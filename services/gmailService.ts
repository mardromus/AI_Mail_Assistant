import { Email } from '../types';

interface GmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
  internalDate: string;
}

interface GmailListResponse {
  messages: Array<{ id: string }>;
  nextPageToken?: string;
}

class GmailService {
  private accessToken: string;
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private decodeBase64(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  private extractEmailBody(message: GmailMessage): string {
    const { payload } = message;
    
    // Check if body has data directly
    if (payload.body?.data) {
      return this.decodeBase64(payload.body.data);
    }

    // Check parts for text content
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return this.decodeBase64(part.body.data);
        }
        if (part.mimeType === 'text/html' && part.body?.data) {
          // For HTML emails, we'll use the snippet as fallback
          return message.snippet;
        }
      }
    }

    // Fallback to snippet
    return message.snippet;
  }

  private getHeaderValue(headers: Array<{ name: string; value: string }>, name: string): string {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  }

  private isSupportEmail(subject: string, body: string): boolean {
    const supportKeywords = ['support', 'query', 'request', 'help', 'assistance', 'issue', 'problem'];
    const text = `${subject} ${body}`.toLowerCase();
    
    return supportKeywords.some(keyword => text.includes(keyword));
  }

  async fetchSupportEmails(maxResults: number = 50): Promise<Email[]> {
    try {
      // Search for emails with support-related keywords
      const query = 'subject:(support OR query OR request OR help OR assistance OR issue OR problem)';
      const searchResponse = await this.makeRequest(`/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      
      if (!searchResponse.messages || searchResponse.messages.length === 0) {
        return [];
      }

      const emails: Email[] = [];
      
      // Fetch detailed information for each message
      for (const messageRef of searchResponse.messages) {
        try {
          const message = await this.makeRequest(`/users/me/messages/${messageRef.id}`);
          const sender = this.getHeaderValue(message.payload.headers, 'From');
          const subject = this.getHeaderValue(message.payload.headers, 'Subject');
          const body = this.extractEmailBody(message);
          const date = new Date(parseInt(message.internalDate)).toISOString();

          // Double-check if it's a support email
          if (this.isSupportEmail(subject, body)) {
            emails.push({
              id: message.id,
              sender,
              subject,
              body,
              date,
            });
          }
        } catch (error) {
          console.error(`Error fetching message ${messageRef.id}:`, error);
          // Continue with other messages
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails from Gmail:', error);
      throw new Error('Failed to fetch emails from Gmail. Please check your authentication.');
    }
  }

  async sendEmail(to: string, subject: string, body: string, attachments?: File[]): Promise<boolean> {
    try {
      // Create email message in RFC 2822 format
      const message = this.createEmailMessage(to, subject, body, attachments);
      const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await this.makeRequest('/users/me/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private createEmailMessage(to: string, subject: string, body: string, attachments?: File[]): string {
    const boundary = '----=_Part_' + Math.random().toString(36).substr(2, 9);
    const date = new Date().toUTCString();
    
    let message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Date: ${date}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      '',
      body,
    ].join('\r\n');

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        message += [
          '',
          `--${boundary}`,
          `Content-Type: ${attachment.type || 'application/octet-stream'}`,
          `Content-Disposition: attachment; filename="${attachment.name}"`,
          `Content-Transfer-Encoding: base64`,
          '',
          // Note: In a real implementation, you'd need to read the file content
          // and encode it as base64. This is a simplified version.
          `[Base64 encoded content of ${attachment.name}]`,
        ].join('\r\n');
      }
    }

    message += `\r\n--${boundary}--\r\n`;
    return message;
  }
}

export default GmailService;
