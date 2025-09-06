
import { Email } from '../types';

const mockEmails: Omit<Email, 'id' | 'date'>[] = [
  {
    sender: 'frustrated_user@example.com',
    subject: 'URGENT Support Request: Cannot access my account!',
    body: `
      Hi team,

      I've been trying to log into my account for the last hour and it's not working. The password reset link is also broken. This is a critical issue for me as I need to access my files immediately for a client presentation. 

      My username is frustrated_user. Please help me ASAP. My contact number is 555-123-4567.

      This is incredibly frustrating.

      Regards,
      Jane Doe
    `,
  },
  {
    sender: 'happy_customer@example.com',
    subject: 'Positive Feedback on your new feature',
    body: `
      Hello!

      Just wanted to say that the new dashboard update is fantastic! It's so much more intuitive and has saved me a lot of time. 

      Great job to the entire team. Keep up the amazing work!

      Best,
      John Smith
    `,
  },
  {
    sender: 'curious_dev@example.com',
    subject: 'Query about API integration',
    body: `
      Hi Support,

      I'm looking into integrating your service with our internal tools via your API. I was reading the documentation but had a quick question about the rate limits for the Pro plan. Could you clarify what the exact limits are?

      Thanks for your help.

      Cheers,
      Alex Ray
    `,
  },
    {
    sender: 'billing_dept@corp.com',
    subject: 'Request: Invoice for last month',
    body: `
      Hello,

      Could you please provide the invoice for our subscription for the previous month? We need it for our records. Our account is under billing_dept@corp.com.

      Thank you.
    `,
  },
  {
    sender: 'confused_newbie@example.com',
    subject: 'Help needed with setup process',
    body: `
      Hi there,

      I just signed up and I'm a bit lost on how to get started. I've tried following the tutorial video but I seem to be stuck at the data import step. Can someone guide me through it?

      My alternate email is newbie_help@provider.com.

      Thanks,
      Sam Wilson
    `,
  },
    {
    sender: 'sandra_o@techfirm.com',
    subject: 'Critical Support: Production server is down',
    body: `
      This is an emergency. Our production instance that relies on your service is completely unresponsive. We are losing business every minute this is down. I need immediate assistance. Call me at 555-987-6543 if needed.
    `,
  },
];

export const getMockEmails = (): Email[] => {
  const now = new Date();
  return mockEmails.map((email, index) => ({
    ...email,
    id: `email_${index + 1}`,
    date: new Date(now.getTime() - index * 1000 * 60 * 45).toISOString(), // Emails staggered by 45 mins
  }));
};
