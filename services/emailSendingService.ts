import { ProcessedEmail, AttachmentInfo } from '../types';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
  replyTo?: string;
}

class EmailSendingService {
  private config: EmailConfig | null = null;
  private gmailService: any = null; // Will be set if using Gmail API

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    // In a real application, these would come from environment variables
    this.config = {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      smtpPassword: process.env.SMTP_PASSWORD || '',
      fromEmail: process.env.FROM_EMAIL || 'support@yourapp.com',
      fromName: process.env.FROM_NAME || 'AI Support Assistant',
    };
  }

  setGmailService(gmailService: any): void {
    this.gmailService = gmailService;
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Try Gmail API first if available
      if (this.gmailService) {
        return await this.sendViaGmail(message);
      }

      // Fallback to SMTP
      return await this.sendViaSMTP(message);
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async sendViaGmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const success = await this.gmailService.sendEmail(
        message.to,
        message.subject,
        message.body,
        message.attachments
      );

      if (success) {
        return {
          success: true,
          messageId: `gmail_${Date.now()}` // Generate a unique ID
        };
      } else {
        return {
          success: false,
          error: 'Failed to send email via Gmail API'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gmail API error'
      };
    }
  }

  private async sendViaSMTP(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // For browser environment, we'll use a simple fetch-based approach
    // In a real application, you'd use a proper SMTP library or send via your backend
    
    const emailData = {
      to: message.to,
      subject: message.subject,
      body: message.body,
      from: `${this.config?.fromName} <${this.config?.fromEmail}>`,
      replyTo: message.replyTo || this.config?.fromEmail,
      attachments: message.attachments?.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    try {
      // This would typically be a call to your backend API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          messageId: result.messageId || `smtp_${Date.now()}`
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `SMTP error: ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMTP connection error'
      };
    }
  }

  async sendReplyToEmail(originalEmail: ProcessedEmail, replyBody: string, attachments?: File[]): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const replySubject = originalEmail.subject.startsWith('Re: ') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`;

    const message: EmailMessage = {
      to: originalEmail.sender,
      subject: replySubject,
      body: replyBody,
      attachments,
      replyTo: this.config?.fromEmail,
    };

    return await this.sendEmail(message);
  }

  // Generate email templates for common scenarios
  generateTemplate(templateType: 'acknowledgment' | 'resolution' | 'escalation', email: ProcessedEmail): string {
    const templates = {
      acknowledgment: `
        Hi there,
        
        Thank you for reaching out to us. We've received your message about "${email.subject}" and our team is looking into it.
        
        We'll get back to you within 24 hours with a detailed response.
        
        Best regards,
        Alex from Support
      `,
      
      resolution: `
        Hi there,
        
        Thank you for your patience. We've resolved the issue you mentioned regarding "${email.subject}".
        
        ${email.draftReply}
        
        If you have any other questions, please don't hesitate to reach out.
        
        Best regards,
        Alex from Support
      `,
      
      escalation: `
        Hi there,
        
        Thank you for contacting us about "${email.subject}". This requires specialized attention, so I've escalated your case to our technical team.
        
        You should receive a response from our senior support team within 2-4 hours.
        
        Best regards,
        Alex from Support
      `
    };

    return templates[templateType].trim();
  }

  // Validate email configuration
  isConfigured(): boolean {
    return !!(
      this.config?.smtpHost && 
      this.config?.smtpUser && 
      this.config?.smtpPassword &&
      this.config?.fromEmail
    );
  }

  // Get configuration status
  getConfigStatus(): {
    smtpConfigured: boolean;
    gmailConfigured: boolean;
    fromEmail: string;
  } {
    return {
      smtpConfigured: this.isConfigured(),
      gmailConfigured: !!this.gmailService,
      fromEmail: this.config?.fromEmail || 'Not configured'
    };
  }
}

export default EmailSendingService;
