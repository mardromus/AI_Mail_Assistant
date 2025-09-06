import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Email, ProcessedEmail, Sentiment, Priority, AttachmentInfo } from './types';
import { getMockEmails } from './services/mockEmailService';
import { analyzeEmail, generateReply } from './services/geminiService';
import GmailService from './services/gmailService';
import DatabaseService from './services/databaseService';
import PriorityQueueService from './services/priorityQueueService';
import RAGService from './services/ragService';
import EmailSendingService from './services/emailSendingService';
import { UserProvider, useUser } from './contexts/UserContext';
import Header from './components/Header';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import DashboardStats from './components/DashboardStats';
import GmailAuth from './components/GmailAuth';
import ApiConfig from './components/ApiConfig';
import SetupWizard from './components/SetupWizard';
import StatusDashboard from './components/StatusDashboard';
import SettingsPanel from './components/SettingsPanel';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Spinner from './components/Spinner';

type Theme = 'light' | 'dark';
type ActiveTab = 'inbox' | 'sent';

const AuthenticatedApp: React.FC = () => {
  const { user } = useUser();
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'All'>('All');
  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Service instances
  const [dbService] = useState(() => new DatabaseService());
  const [priorityQueue] = useState(() => new PriorityQueueService());
  const [emailSendingService] = useState(() => new EmailSendingService());
  const [ragService, setRagService] = useState<RAGService | null>(null);
  const [gmailService, setGmailService] = useState<GmailService | null>(null);
  const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [serviceStatuses, setServiceStatuses] = useState([
    { name: 'Gemini AI', status: 'disconnected' as const, lastChecked: new Date() },
    { name: 'Gmail API', status: 'disconnected' as const, lastChecked: new Date() },
    { name: 'SMTP', status: 'disconnected' as const, lastChecked: new Date() },
    { name: 'Database', status: 'disconnected' as const, lastChecked: new Date() },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize database
        await dbService.initialize();
        
        // Initialize RAG service
        if (process.env.API_KEY) {
          const rag = new RAGService(process.env.API_KEY, dbService);
          await rag.initializeKnowledgeBase();
          setRagService(rag);
        }

        // Initialize Gmail service if access token is available
        const gmailAccessToken = localStorage.getItem('gmail_access_token');
        if (gmailAccessToken) {
          const gmail = new GmailService(gmailAccessToken);
          setGmailService(gmail);
          emailSendingService.setGmailService(gmail);
          setIsGmailAuthenticated(true);
        }

        // Set up priority queue processing
        priorityQueue.setProcessCallback(async (email: ProcessedEmail) => {
          try {
            if (ragService) {
              const contextAwareReply = await ragService.generateContextAwareReply({
                subject: email.subject,
                body: email.body,
                customerRequest: email.customerRequest,
                sentiment: email.sentiment,
                priority: email.priority
              });
              
              const updatedEmail = { ...email, draftReply: contextAwareReply };
              setEmails(prevEmails => 
                prevEmails.map(e => e.id === email.id ? updatedEmail : e)
              );
              await dbService.saveEmail(updatedEmail);
            }
          } catch (error) {
            console.error('Error processing email in queue:', error);
          }
        });

        // Load existing emails from database
        const existingEmails = await dbService.getEmails();
        if (existingEmails.length > 0) {
          setEmails(existingEmails);
          if (existingEmails.length > 0) {
            handleSelectEmail(existingEmails[0]);
          }
        }

        // Check if this is first time setup
        const hasApiKey = !!process.env.API_KEY;
        const hasGmailToken = !!localStorage.getItem('gmail_access_token');
        
        if (!hasApiKey && !hasGmailToken) {
          setShowSetupWizard(true);
        }

        // Check service statuses
        await checkServiceStatuses();
      } catch (error) {
        console.error('Error initializing services:', error);
        setError('Failed to initialize services. Please refresh the page.');
      }
    };

    initializeServices();
  }, [dbService, priorityQueue, emailSendingService, isGmailAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleGmailAuthSuccess = (accessToken: string) => {
    const gmail = new GmailService(accessToken);
    setGmailService(gmail);
    emailSendingService.setGmailService(gmail);
    setIsGmailAuthenticated(true);
    updateServiceStatus('Gmail API', 'connected');
  };

  const updateServiceStatus = (serviceName: string, status: 'connected' | 'disconnected' | 'error' | 'loading', error?: string) => {
    setServiceStatuses(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status, lastChecked: new Date(), error }
        : service
    ));
  };

  const checkServiceStatuses = async () => {
    setIsRefreshing(true);
    
    // Check Gemini AI
    if (process.env.API_KEY) {
      updateServiceStatus('Gemini AI', 'connected');
    } else {
      updateServiceStatus('Gemini AI', 'disconnected');
    }

    // Check Gmail API
    if (isGmailAuthenticated) {
      updateServiceStatus('Gmail API', 'connected');
    } else {
      updateServiceStatus('Gmail API', 'disconnected');
    }

    // Check SMTP
    if (emailSendingService.isConfigured()) {
      updateServiceStatus('SMTP', 'connected');
    } else {
      updateServiceStatus('SMTP', 'disconnected');
    }

    // Check Database
    try {
      await dbService.initialize();
      updateServiceStatus('Database', 'connected');
    } catch (error) {
      updateServiceStatus('Database', 'error', 'Failed to initialize database');
    }

    setIsRefreshing(false);
  };

  const handleApiConfigUpdate = (config: any) => {
    // Update environment variables (in a real app, this would be handled differently)
    console.log('API configuration updated:', config);
    setShowApiConfig(false);
    checkServiceStatuses();
  };

  const handleExportData = async () => {
    try {
      const emails = await dbService.getEmails();
      const analytics = await dbService.getAnalytics();
      const data = { emails, analytics, timestamp: new Date().toISOString() };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-email-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.emails) {
        for (const email of data.emails) {
          await dbService.saveEmail(email);
        }
      }
      
      // Refresh the UI
      const existingEmails = await dbService.getEmails();
      setEmails(existingEmails);
      
      setError(null);
    } catch (error) {
      console.error('Error importing data:', error);
      setError('Failed to import data. Please check the file format.');
    }
  };

  const handleClearData = async () => {
    try {
      await dbService.clearAllData();
      setEmails([]);
      setSelectedEmail(null);
      setError(null);
    } catch (error) {
      console.error('Error clearing data:', error);
      setError('Failed to clear data');
    }
  };
  
  const handleSendReply = useCallback(async (emailId: string, attachments: File[]) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Sending reply...');

      const result = await emailSendingService.sendReplyToEmail(
        email,
        email.draftReply,
        attachments
      );

      if (result.success) {
        const attachmentInfo: AttachmentInfo[] = attachments.map(file => ({ name: file.name, size: file.size }));
        
        const updatedEmail = { 
          ...email, 
          status: 'Resolved' as const, 
          attachments: attachmentInfo 
        };
        
        setEmails(prevEmails => 
          prevEmails.map(e => e.id === emailId ? updatedEmail : e)
        );

        // Save to database
        await dbService.saveEmail(updatedEmail);
        
        // Remove from priority queue
        priorityQueue.removeEmail(emailId);
        
        setError(null);
      } else {
        setError(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [emails, emailSendingService, dbService, priorityQueue]);

  const handleSelectEmail = useCallback(async (email: ProcessedEmail) => {
    setSelectedEmail(email);
    if (!email.draftReply && email.status === 'Pending') {
      setIsLoading(true);
      setLoadingMessage('Generating draft reply...');
      try {
        const reply = await generateReply(email);
        const updatedEmail = { ...email, draftReply: reply };
        
        setEmails(prevEmails => 
          prevEmails.map(e => e.id === email.id ? updatedEmail : e)
        );
        setSelectedEmail(updatedEmail);
      } catch (e) {
        console.error(e);
        setError('Failed to generate a reply.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  }, []);
  
  const processAndSetEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPriorityFilter('All');
    setSentimentFilter('All');
    setLoadingMessage('Fetching and filtering support emails...');
    
    try {
      let rawEmails: Email[] = [];

      // Try to fetch from Gmail first, fallback to mock data
      if (gmailService) {
        try {
          rawEmails = await gmailService.fetchSupportEmails(50);
          setLoadingMessage(`Fetched ${rawEmails.length} emails from Gmail`);
        } catch (gmailError) {
          console.warn('Gmail fetch failed, using mock data:', gmailError);
          rawEmails = getMockEmails();
        }
      } else {
        rawEmails = getMockEmails();
      }

      const processedEmails: ProcessedEmail[] = [];
      for (let i = 0; i < rawEmails.length; i++) {
        const email = rawEmails[i];
        setLoadingMessage(`Analyzing email ${i + 1} of ${rawEmails.length}: "${email.subject}"`);
        
        const analysis = await analyzeEmail(email.subject, email.body);
        
        const processedEmail: ProcessedEmail = {
          ...email,
          ...analysis,
          status: 'Pending',
          draftReply: '',
        };

        processedEmails.push(processedEmail);
        
        // Save to database
        await dbService.saveEmail(processedEmail);
        
        // Add to priority queue for processing
        priorityQueue.addEmail(processedEmail);
      }
      
      const sortedEmails = processedEmails.sort((a, b) => {
        if (a.priority === Priority.Urgent && b.priority !== Priority.Urgent) return -1;
        if (a.priority !== Priority.Urgent && b.priority === Priority.Urgent) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setEmails(sortedEmails);
      if (sortedEmails.length > 0) {
        handleSelectEmail(sortedEmails[0]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to process emails. Please check your configuration and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [handleSelectEmail, gmailService, dbService, priorityQueue]);

  useEffect(() => {
    processAndSetEmails();
  }, [processAndSetEmails]);

  const inboxEmails = useMemo(() => emails.filter(e => e.status === 'Pending'), [emails]);

  const sentEmails = useMemo(() => 
    emails.filter(e => e.status === 'Resolved')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [emails]
  );

  const filteredAndSortedInbox = useMemo(() => {
    return inboxEmails
      .filter(email => priorityFilter === 'All' || email.priority === priorityFilter)
      .filter(email => sentimentFilter === 'All' || email.sentiment === sentimentFilter)
      .sort((a, b) => {
        if (a.priority === Priority.Urgent && b.priority !== Priority.Urgent) return -1;
        if (a.priority !== Priority.Urgent && b.priority === Priority.Urgent) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [inboxEmails, priorityFilter, sentimentFilter]);

  useEffect(() => {
    if (isLoading || activeTab !== 'inbox') return;

    const isSelectedEmailVisible = selectedEmail && filteredAndSortedInbox.some(e => e.id === selectedEmail.id);

    if (!isSelectedEmailVisible) {
      if (filteredAndSortedInbox.length > 0) {
        handleSelectEmail(filteredAndSortedInbox[0]);
      } else {
        setSelectedEmail(null);
      }
    }
  }, [filteredAndSortedInbox, selectedEmail, handleSelectEmail, isLoading, activeTab]);
  
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    emailsInLast24h: 0,
    sentimentCounts: {
      [Sentiment.Positive]: 0,
      [Sentiment.Negative]: 0,
      [Sentiment.Neutral]: 0,
    },
    priorityCounts: {
      [Priority.Urgent]: 0,
      [Priority.NotUrgent]: 0,
    },
    emailsByHour: [] as Array<{ hour: number; count: number }>,
  });

  // Update analytics from database
  useEffect(() => {
    const updateAnalytics = async () => {
      try {
        const analytics = await dbService.getAnalytics();
        setDashboardStats(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    updateAnalytics();
  }, [emails, dbService]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header 
        onRefresh={processAndSetEmails} 
        theme={theme} 
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        user={user}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <GmailAuth 
                onAuthSuccess={handleGmailAuthSuccess}
                isAuthenticated={isGmailAuthenticated}
              />
              <StatusDashboard 
                services={serviceStatuses}
                onRefresh={checkServiceStatuses}
                isRefreshing={isRefreshing}
              />
              <EmailList
                emails={activeTab === 'inbox' ? filteredAndSortedInbox : sentEmails}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                priorityFilter={priorityFilter}
                sentimentFilter={sentimentFilter}
                onPriorityFilterChange={setPriorityFilter}
                onSentimentFilterChange={setSentimentFilter}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          <div className="lg:col-span-6">
            {selectedEmail ? (
              <EmailDetail key={selectedEmail.id} email={selectedEmail} onSendReply={handleSendReply} />
            ) : !isLoading && (
              <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <p className="text-slate-500">{emails.length > 0 ? "Select an email to view details." : "No support emails found."}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-3">
            <DashboardStats stats={dashboardStats} />
          </div>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
            <Spinner />
            <p className="text-white mt-4 text-lg">{loadingMessage}</p>
          </div>
        )}

        {/* Modals */}
        {showSetupWizard && (
          <SetupWizard
            onComplete={() => setShowSetupWizard(false)}
            onSkip={() => setShowSetupWizard(false)}
          />
        )}

        {showSettings && (
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onConfigUpdate={handleApiConfigUpdate}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        )}

        {showApiConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ApiConfig
                onConfigUpdate={handleApiConfigUpdate}
                currentConfig={{
                  geminiApiKey: process.env.API_KEY || '',
                  smtpHost: process.env.SMTP_HOST || '',
                  smtpPort: process.env.SMTP_PORT || '',
                  smtpUser: process.env.SMTP_USER || '',
                  smtpPassword: process.env.SMTP_PASSWORD || '',
                  fromEmail: process.env.FROM_EMAIL || '',
                  fromName: process.env.FROM_NAME || '',
                  gmailClientId: process.env.GMAIL_CLIENT_ID || '',
                  gmailClientSecret: process.env.GMAIL_CLIENT_SECRET || '',
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp />;
};

const AppWithProvider: React.FC = () => {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
};

export default AppWithProvider;