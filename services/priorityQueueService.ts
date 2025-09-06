import { ProcessedEmail, Priority } from '../types';

interface QueueItem {
  email: ProcessedEmail;
  priority: number;
  timestamp: number;
}

class PriorityQueueService {
  private queue: QueueItem[] = [];
  private processing = false;
  private onProcessCallback?: (email: ProcessedEmail) => Promise<void>;

  constructor() {
    this.queue = [];
  }

  setProcessCallback(callback: (email: ProcessedEmail) => Promise<void>): void {
    this.onProcessCallback = callback;
  }

  addEmail(email: ProcessedEmail): void {
    const priority = this.calculatePriority(email);
    const timestamp = Date.now();
    
    const queueItem: QueueItem = {
      email,
      priority,
      timestamp,
    };

    // Insert item in correct position based on priority
    this.insertByPriority(queueItem);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  private calculatePriority(email: ProcessedEmail): number {
    let priority = 0;

    // Base priority from email analysis
    if (email.priority === Priority.Urgent) {
      priority += 1000;
    } else {
      priority += 100;
    }

    // Sentiment-based priority adjustment
    switch (email.sentiment) {
      case 'Negative':
        priority += 200; // Higher priority for negative sentiment
        break;
      case 'Positive':
        priority += 50;  // Lower priority for positive sentiment
        break;
      case 'Neutral':
        priority += 100; // Medium priority for neutral
        break;
    }

    // Time-based priority (older emails get slightly higher priority)
    const emailAge = Date.now() - new Date(email.date).getTime();
    const ageInHours = emailAge / (1000 * 60 * 60);
    priority += Math.min(ageInHours * 10, 100); // Cap at 100 points

    // Keyword-based priority boost
    const urgentKeywords = [
      'urgent', 'critical', 'emergency', 'asap', 'immediately',
      'cannot access', 'broken', 'down', 'not working', 'error'
    ];
    
    const emailText = `${email.subject} ${email.body}`.toLowerCase();
    const urgentKeywordCount = urgentKeywords.filter(keyword => 
      emailText.includes(keyword)
    ).length;
    
    priority += urgentKeywordCount * 50;

    return priority;
  }

  private insertByPriority(item: QueueItem): void {
    let insertIndex = this.queue.length;
    
    // Find the correct position to maintain priority order
    for (let i = 0; i < this.queue.length; i++) {
      if (item.priority > this.queue[i].priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, item);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        if (this.onProcessCallback) {
          await this.onProcessCallback(item.email);
        }
      } catch (error) {
        console.error('Error processing email from queue:', error);
        // Re-add to queue with lower priority if processing failed
        item.priority = Math.max(item.priority - 50, 0);
        this.insertByPriority(item);
      }

      // Small delay between processing to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  getQueueStatus(): {
    totalItems: number;
    urgentItems: number;
    processing: boolean;
    nextItem?: ProcessedEmail;
  } {
    const urgentItems = this.queue.filter(item => 
      item.email.priority === Priority.Urgent
    ).length;

    return {
      totalItems: this.queue.length,
      urgentItems,
      processing: this.processing,
      nextItem: this.queue[0]?.email,
    };
  }

  clearQueue(): void {
    this.queue = [];
  }

  removeEmail(emailId: string): boolean {
    const index = this.queue.findIndex(item => item.email.id === emailId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get emails in priority order without removing them
  getQueueSnapshot(): ProcessedEmail[] {
    return this.queue.map(item => item.email);
  }

  // Recalculate priorities for all items in queue
  recalculatePriorities(): void {
    const items = this.queue.map(item => ({
      email: item.email,
      priority: this.calculatePriority(item.email),
      timestamp: item.timestamp,
    }));

    this.queue = [];
    items.forEach(item => this.insertByPriority(item));
  }
}

export default PriorityQueueService;
