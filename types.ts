export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export enum Priority {
  Urgent = 'Urgent',
  NotUrgent = 'Not Urgent',
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
}

export interface ExtractedInfo {
  summary: string;
  customerRequest: string;
  contactDetails?: {
    phone?: string;
    alternateEmail?: string;
  };
}

export interface EmailAnalysis extends ExtractedInfo {
  sentiment: Sentiment;
  priority: Priority;
}

export interface AttachmentInfo {
  name: string;
  size: number;
}

export interface ProcessedEmail extends Email, EmailAnalysis {
  status: 'Pending' | 'Resolved';
  draftReply: string;
  attachments?: AttachmentInfo[];
}

export interface DashboardStatsData {
  total: number;
  pending: number;
  resolved: number;
  emailsInLast24h: number;
  sentimentCounts: Record<Sentiment, number>;
  priorityCounts: Record<Priority, number>;
}