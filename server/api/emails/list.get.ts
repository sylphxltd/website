import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { EmailMessage } from '~/stores/emails'; // Import type

// Mock Data Generation
const generateMockEmails = (count: number, page: number, status: string): EmailMessage[] => {
  const emails: EmailMessage[] = [];
  const baseId = `email-${status}-p${page}-`;
  const senders = ['customer1@example.com', 'user_xyz@domain.com', 'support-issue@company.net', 'feedback@mail.org'];
  const subjects = ['Login Problem', 'Feature Request: Dark Mode', 'Billing Inquiry', 'Bug Report - Crash on Startup', 'Question about Subscription'];
  const snippets = [
    'I cannot log into my account, it says invalid password...',
    'It would be great if the app had a dark mode option...',
    'I was charged twice this month, can you please check...',
    'The app crashes every time I try to open the settings page...',
    'How do I cancel my current subscription plan?',
  ];

  for (let i = 0; i < count; i++) {
    const isRead = status === 'sent' || Math.random() > 0.3;
    const receivedAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(); // Random date in last 14 days

    emails.push({
      id: baseId + i,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      senderName: senders[Math.floor(Math.random() * senders.length)].split('@')[0],
      senderEmail: senders[Math.floor(Math.random() * senders.length)],
      recipientEmail: 'support@sylphx.com', // Your support email
      snippet: snippets[Math.floor(Math.random() * snippets.length)],
      body: `This is the full body content for email ${baseId + i}. \n\n ${snippets[Math.floor(Math.random() * snippets.length)]}`,
      isRead: isRead,
      isArchived: status === 'archived',
      receivedAt: receivedAt,
      replies: status === 'sent' ? [{ // Add a mock reply for sent items
          id: `${baseId + i}-reply`,
          subject: `Re: ${subjects[Math.floor(Math.random() * subjects.length)]}`,
          senderName: 'Support Team',
          senderEmail: 'support@sylphx.com',
          recipientEmail: senders[Math.floor(Math.random() * senders.length)],
          body: 'This is a sample reply from the support team.',
          isRead: true,
          isArchived: false,
          receivedAt: new Date(new Date(receivedAt).getTime() + Math.random() * 1000 * 60 * 30).toISOString(), // Reply within 30 mins
      }] : [],
    });
  }
  return emails;
};


export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Get Query Parameters
  const query = getQuery(event);
  const page = Number.parseInt(query.page?.toString() || '1', 10);
  const limit = Number.parseInt(query.limit?.toString() || '20', 10);
  const status = query.status?.toString() || 'inbox'; // inbox, sent, archived, unread
  // Add search, dateFrom, dateTo if needed

  console.log(`Fetching emails for status: ${status}, page: ${page}, limit: ${limit}`);

  // 3. **Placeholder:** Fetch emails from actual source (IMAP, API, etc.)
  // Apply filtering and pagination based on query params.
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 250));

    const totalMockEmails = 88; // Simulate total based on status filter
    const mockEmails = generateMockEmails(limit, page, status);

    // Simulate filtering (crude version for mock data)
    // let filteredEmails = mockEmails;
    // if (status === 'unread') filteredEmails = filteredEmails.filter(e => !e.isRead);
    // Apply search etc.

    return {
      emails: mockEmails, // Return the generated page directly
      total: totalMockEmails // Return simulated total
    };

  } catch (error) {
    console.error('Error fetching/simulating emails:', error); // Use simple string
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching emails' });
  }
});