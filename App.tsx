import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Email, ProcessedEmail, Sentiment, Priority, AttachmentInfo } from './types';
import { getMockEmails } from './services/mockEmailService';
import { analyzeEmail, generateReply } from './services/geminiService';
import Header from './components/Header';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import DashboardStats from './components/DashboardStats';
import Spinner from './components/Spinner';

type Theme = 'light' | 'dark';
type ActiveTab = 'inbox' | 'sent';

const App: React.FC = () => {
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

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleSendReply = useCallback((emailId: string, attachments: File[]) => {
    const attachmentInfo: AttachmentInfo[] = attachments.map(file => ({ name: file.name, size: file.size }));
    
    setEmails(prevEmails => 
      prevEmails.map(e => e.id === emailId ? { ...e, status: 'Resolved', attachments: attachmentInfo } : e)
    );
  }, []);

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
    
    await new Promise(res => setTimeout(res, 500));
    const rawEmails: Email[] = getMockEmails();

    try {
      const processedEmails: ProcessedEmail[] = [];
      for (let i = 0; i < rawEmails.length; i++) {
        const email = rawEmails[i];
        setLoadingMessage(`Analyzing email ${i + 1} of ${rawEmails.length}: "${email.subject}"`);
        
        const analysis = await analyzeEmail(email.subject, email.body);
        
        processedEmails.push({
          ...email,
          ...analysis,
          status: 'Pending',
          draftReply: '',
        });
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
      setError('Failed to analyze emails with Gemini API. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [handleSelectEmail]);

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
  
  const dashboardStats = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return {
      total: emails.length,
      pending: inboxEmails.length,
      resolved: sentEmails.length,
      emailsInLast24h: emails.filter(e => new Date(e.date) > twentyFourHoursAgo).length,
      sentimentCounts: {
        [Sentiment.Positive]: emails.filter(e => e.sentiment === Sentiment.Positive).length,
        [Sentiment.Negative]: emails.filter(e => e.sentiment === Sentiment.Negative).length,
        [Sentiment.Neutral]: emails.filter(e => e.sentiment === Sentiment.Neutral).length,
      },
      priorityCounts: {
        [Priority.Urgent]: emails.filter(e => e.priority === Priority.Urgent).length,
        [Priority.NotUrgent]: emails.filter(e => e.priority === Priority.NotUrgent).length,
      },
    };
  }, [emails, inboxEmails.length, sentEmails.length]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header onRefresh={processAndSetEmails} theme={theme} onToggleTheme={handleToggleTheme} />
      <main className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
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
      </main>
    </div>
  );
};

export default App;