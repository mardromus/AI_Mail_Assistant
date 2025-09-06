import { ProcessedEmail, EmailAnalysis, Sentiment, Priority } from '../types';

interface DatabaseEmail extends ProcessedEmail {
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  totalEmails: number;
  pendingEmails: number;
  resolvedEmails: number;
  emailsLast24h: number;
  sentimentCounts: Record<Sentiment, number>;
  priorityCounts: Record<Priority, number>;
  emailsByHour: Array<{ hour: number; count: number }>;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private dbName = 'AIEmailAssistant';
  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create emails store
        if (!db.objectStoreNames.contains('emails')) {
          const emailStore = db.createObjectStore('emails', { keyPath: 'id' });
          emailStore.createIndex('status', 'status', { unique: false });
          emailStore.createIndex('priority', 'priority', { unique: false });
          emailStore.createIndex('sentiment', 'sentiment', { unique: false });
          emailStore.createIndex('date', 'date', { unique: false });
          emailStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('date', 'date', { unique: false });
        }

        // Create knowledge base store
        if (!db.objectStoreNames.contains('knowledgeBase')) {
          const kbStore = db.createObjectStore('knowledgeBase', { keyPath: 'id', autoIncrement: true });
          kbStore.createIndex('category', 'category', { unique: false });
          kbStore.createIndex('keywords', 'keywords', { unique: false, multiEntry: true });
        }
      };
    });
  }

  private async withTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => T
  ): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      
      try {
        const result = operation(store);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveEmail(email: ProcessedEmail): Promise<void> {
    const dbEmail: DatabaseEmail = {
      ...email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.withTransaction('emails', 'readwrite', (store) => {
      store.put(dbEmail);
    });
  }

  async getEmails(): Promise<ProcessedEmail[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['emails'], 'readonly');
      const store = transaction.objectStore('emails');
      const request = store.getAll();

      request.onsuccess = () => {
        const emails = request.result.map((dbEmail: DatabaseEmail) => {
          const { createdAt, updatedAt, ...email } = dbEmail;
          return email;
        });
        resolve(emails);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateEmailStatus(emailId: string, status: 'Pending' | 'Resolved'): Promise<void> {
    const email = await this.getEmailById(emailId);
    if (email) {
      email.status = status;
      email.updatedAt = new Date().toISOString();
      await this.saveEmail(email);
    }
  }

  async getEmailById(emailId: string): Promise<ProcessedEmail | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['emails'], 'readonly');
      const store = transaction.objectStore('emails');
      const request = store.get(emailId);

      request.onsuccess = () => {
        if (request.result) {
          const { createdAt, updatedAt, ...email } = request.result;
          resolve(email);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const emails = await this.getEmails();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const emailsLast24h = emails.filter(email => 
      new Date(email.date) > last24h
    ).length;

    const sentimentCounts = {
      [Sentiment.Positive]: emails.filter(e => e.sentiment === Sentiment.Positive).length,
      [Sentiment.Negative]: emails.filter(e => e.sentiment === Sentiment.Negative).length,
      [Sentiment.Neutral]: emails.filter(e => e.sentiment === Sentiment.Neutral).length,
    };

    const priorityCounts = {
      [Priority.Urgent]: emails.filter(e => e.priority === Priority.Urgent).length,
      [Priority.NotUrgent]: emails.filter(e => e.priority === Priority.NotUrgent).length,
    };

    // Generate hourly data for the last 24 hours
    const emailsByHour = Array.from({ length: 24 }, (_, i) => {
      const hour = (now.getHours() - i + 24) % 24;
      const hourStart = new Date(now);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      const count = emails.filter(email => {
        const emailDate = new Date(email.date);
        return emailDate >= hourStart && emailDate < hourEnd;
      }).length;

      return { hour, count };
    }).reverse();

    return {
      totalEmails: emails.length,
      pendingEmails: emails.filter(e => e.status === 'Pending').length,
      resolvedEmails: emails.filter(e => e.status === 'Resolved').length,
      emailsLast24h,
      sentimentCounts,
      priorityCounts,
      emailsByHour,
    };
  }

  async addKnowledgeBaseEntry(entry: {
    category: string;
    title: string;
    content: string;
    keywords: string[];
  }): Promise<void> {
    await this.withTransaction('knowledgeBase', 'readwrite', (store) => {
      store.add({
        ...entry,
        createdAt: new Date().toISOString(),
      });
    });
  }

  async searchKnowledgeBase(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['knowledgeBase'], 'readonly');
      const store = transaction.objectStore('knowledgeBase');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        const queryLower = query.toLowerCase();
        
        const matches = entries.filter((entry: any) => 
          entry.title.toLowerCase().includes(queryLower) ||
          entry.content.toLowerCase().includes(queryLower) ||
          entry.keywords.some((keyword: string) => keyword.toLowerCase().includes(queryLower))
        );

        resolve(matches);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    await this.withTransaction('emails', 'readwrite', (store) => {
      store.clear();
    });
    await this.withTransaction('analytics', 'readwrite', (store) => {
      store.clear();
    });
    await this.withTransaction('knowledgeBase', 'readwrite', (store) => {
      store.clear();
    });
  }
}

export default DatabaseService;
