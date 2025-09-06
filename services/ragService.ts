import { GoogleGenAI, Type } from "@google/genai";
import DatabaseService from './databaseService';

interface KnowledgeBaseEntry {
  id?: number;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  createdAt: string;
}

interface RAGContext {
  relevantEntries: KnowledgeBaseEntry[];
  contextSummary: string;
  suggestedActions: string[];
}

class RAGService {
  private ai: GoogleGenAI;
  private db: DatabaseService;

  constructor(apiKey: string, db: DatabaseService) {
    this.ai = new GoogleGenAI({ apiKey });
    this.db = db;
  }

  async initializeKnowledgeBase(): Promise<void> {
    // Initialize with common support knowledge base entries
    const initialEntries = [
      {
        category: 'Account Issues',
        title: 'Password Reset Process',
        content: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and check your inbox for reset instructions. If you don\'t receive the email, check your spam folder.',
        keywords: ['password', 'reset', 'login', 'access', 'forgot', 'account']
      },
      {
        category: 'Account Issues',
        title: 'Account Lockout Resolution',
        content: 'If your account is locked due to multiple failed login attempts, wait 15 minutes before trying again. For immediate assistance, contact support with your username and email address.',
        keywords: ['locked', 'lockout', 'failed', 'attempts', 'unlock', 'access']
      },
      {
        category: 'Technical Issues',
        title: 'Browser Compatibility',
        content: 'Our platform works best with Chrome, Firefox, Safari, or Edge. Clear your browser cache and cookies if you experience issues. Disable browser extensions temporarily to test.',
        keywords: ['browser', 'compatibility', 'chrome', 'firefox', 'safari', 'edge', 'cache', 'cookies']
      },
      {
        category: 'Technical Issues',
        title: 'API Rate Limits',
        content: 'Pro plan users have a rate limit of 1000 requests per hour. Free plan users have 100 requests per hour. Rate limits reset every hour. Contact us to upgrade your plan for higher limits.',
        keywords: ['api', 'rate', 'limit', 'requests', 'pro', 'plan', 'upgrade']
      },
      {
        category: 'Billing',
        title: 'Invoice Requests',
        content: 'To request an invoice, log into your account and go to Billing > Invoice History. You can download invoices directly or request them via email. For custom billing periods, contact our billing team.',
        keywords: ['invoice', 'billing', 'payment', 'receipt', 'download', 'history']
      },
      {
        category: 'Billing',
        title: 'Subscription Management',
        content: 'You can upgrade, downgrade, or cancel your subscription from your account settings. Changes take effect at the next billing cycle. Refunds are processed within 5-7 business days.',
        keywords: ['subscription', 'upgrade', 'downgrade', 'cancel', 'billing', 'refund']
      },
      {
        category: 'General',
        title: 'Getting Started Guide',
        content: 'New users should start with our onboarding tutorial. Import your data using the CSV template provided. Set up integrations in the Settings tab. Watch our video tutorials for step-by-step guidance.',
        keywords: ['getting started', 'onboarding', 'tutorial', 'import', 'data', 'setup', 'guide']
      },
      {
        category: 'General',
        title: 'Feature Requests',
        content: 'We welcome feature requests! Submit them through our feedback form or email us directly. Popular requests are prioritized in our development roadmap. We review all suggestions monthly.',
        keywords: ['feature', 'request', 'suggestion', 'feedback', 'roadmap', 'development']
      }
    ];

    for (const entry of initialEntries) {
      await this.db.addKnowledgeBaseEntry(entry);
    }
  }

  async retrieveRelevantContext(email: { subject: string; body: string; customerRequest: string }): Promise<RAGContext> {
    // Extract key terms from the email
    const searchTerms = this.extractSearchTerms(email);
    
    // Search knowledge base for relevant entries
    const relevantEntries: KnowledgeBaseEntry[] = [];
    
    for (const term of searchTerms) {
      const results = await this.db.searchKnowledgeBase(term);
      relevantEntries.push(...results);
    }

    // Remove duplicates and rank by relevance
    const uniqueEntries = this.deduplicateAndRank(relevantEntries, email);
    
    // Generate context summary using AI
    const contextSummary = await this.generateContextSummary(email, uniqueEntries);
    
    // Generate suggested actions
    const suggestedActions = await this.generateSuggestedActions(email, uniqueEntries);

    return {
      relevantEntries: uniqueEntries.slice(0, 5), // Return top 5 most relevant
      contextSummary,
      suggestedActions,
    };
  }

  private extractSearchTerms(email: { subject: string; body: string; customerRequest: string }): string[] {
    const text = `${email.subject} ${email.body} ${email.customerRequest}`.toLowerCase();
    
    // Common support-related terms
    const commonTerms = [
      'password', 'login', 'access', 'account', 'billing', 'invoice',
      'api', 'integration', 'error', 'bug', 'issue', 'problem',
      'upgrade', 'downgrade', 'cancel', 'refund', 'payment',
      'tutorial', 'guide', 'help', 'setup', 'configuration'
    ];

    // Extract terms that appear in the email
    const foundTerms = commonTerms.filter(term => text.includes(term));
    
    // Extract potential product/service names (simple heuristic)
    const productTerms = text.match(/\b(?:dashboard|api|service|platform|app|system)\b/g) || [];
    
    return [...foundTerms, ...productTerms];
  }

  private deduplicateAndRank(entries: KnowledgeBaseEntry[], email: { subject: string; body: string; customerRequest: string }): KnowledgeBaseEntry[] {
    const uniqueEntries = new Map<number, KnowledgeBaseEntry>();
    
    entries.forEach(entry => {
      if (entry.id && !uniqueEntries.has(entry.id)) {
        uniqueEntries.set(entry.id, entry);
      }
    });

    // Simple ranking based on keyword matches
    const rankedEntries = Array.from(uniqueEntries.values()).map(entry => {
      const emailText = `${email.subject} ${email.body} ${email.customerRequest}`.toLowerCase();
      const entryText = `${entry.title} ${entry.content}`.toLowerCase();
      
      let score = 0;
      entry.keywords.forEach(keyword => {
        if (emailText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      // Boost score for title matches
      if (emailText.includes(entry.title.toLowerCase())) {
        score += 2;
      }

      return { ...entry, relevanceScore: score };
    });

    return rankedEntries
      .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
      .map(({ relevanceScore, ...entry }) => entry);
  }

  private async generateContextSummary(email: { subject: string; body: string; customerRequest: string }, entries: KnowledgeBaseEntry[]): Promise<string> {
    if (entries.length === 0) {
      return 'No specific knowledge base entries found for this inquiry.';
    }

    const entrySummaries = entries.map(entry => 
      `${entry.title}: ${entry.content.substring(0, 200)}...`
    ).join('\n\n');

    const prompt = `
    Based on the customer email and relevant knowledge base entries, provide a brief context summary:
    
    Customer Email:
    Subject: ${email.subject}
    Request: ${email.customerRequest}
    
    Relevant Knowledge Base Entries:
    ${entrySummaries}
    
    Provide a 2-3 sentence summary of the context and what information is available to help this customer.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating context summary:', error);
      return 'Context analysis unavailable.';
    }
  }

  private async generateSuggestedActions(email: { subject: string; body: string; customerRequest: string }, entries: KnowledgeBaseEntry[]): Promise<string[]> {
    if (entries.length === 0) {
      return ['Escalate to human support', 'Request more information from customer'];
    }

    const entryTitles = entries.map(entry => entry.title).join(', ');

    const prompt = `
    Based on the customer email and available knowledge base entries, suggest 3-5 specific actions the support agent should take:
    
    Customer Request: ${email.customerRequest}
    Available Knowledge: ${entryTitles}
    
    Provide specific, actionable steps. Format as a simple list.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      // Parse the response into an array of actions
      const actions = response.text
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5);

      return actions;
    } catch (error) {
      console.error('Error generating suggested actions:', error);
      return ['Review customer request', 'Check knowledge base', 'Escalate if needed'];
    }
  }

  async generateContextAwareReply(email: { subject: string; body: string; customerRequest: string; sentiment: string; priority: string }): Promise<string> {
    // Get relevant context
    const ragContext = await this.retrieveRelevantContext(email);
    
    const systemInstruction = `
    You are Alex, an expert customer support assistant. Use the provided context to give accurate, helpful responses.
    
    Guidelines:
    - Be empathetic and professional
    - Use specific information from the knowledge base when available
    - If the customer is frustrated (negative sentiment), acknowledge their feelings first
    - Provide clear, actionable steps
    - If you don't have enough information, ask specific questions
    - Always sign off as "Alex from Support"
    `;

    const contextInfo = ragContext.relevantEntries.length > 0 
      ? `\n\nRelevant Information:\n${ragContext.relevantEntries.map(entry => `- ${entry.title}: ${entry.content}`).join('\n')}`
      : '';

    const suggestedActions = ragContext.suggestedActions.length > 0
      ? `\n\nSuggested Actions:\n${ragContext.suggestedActions.map(action => `- ${action}`).join('\n')}`
      : '';

    const prompt = `
    Customer Email Analysis:
    - Sentiment: ${email.sentiment}
    - Priority: ${email.priority}
    - Request: ${email.customerRequest}
    
    Original Email:
    Subject: ${email.subject}
    Body: ${email.body}
    
    ${contextInfo}
    ${suggestedActions}
    
    Generate a helpful, context-aware response to this customer.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating context-aware reply:', error);
      throw new Error('Failed to generate context-aware reply.');
    }
  }
}

export default RAGService;
