import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface SendEmailBody {
  to: string;
  from?: string; // Optional: MailChannels might override this
  subject: string;
  text?: string;
  html?: string;
}

// MailChannels API Endpoint
const MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();

  // 1. Authentication and Authorization Check
  const authorization = getHeader(event, 'Authorization');
   if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
    console.error("Error verifying admin token:", error);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Read and Validate Request Body
  const body = await readBody<SendEmailBody>(event);
  if (!body || !body.to || !body.subject || (!body.text && !body.html)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing required fields (to, subject, text or html).' });
  }

  // 3. Construct MailChannels Payload
  const emailPayload = {
    personalizations: [
      { to: [{ email: body.to }] }
    ],
    from: {
      // IMPORTANT: Replace with your verified sending email address configured in Cloudflare/MailChannels
      email: body.from || "support@yourverifieddomain.com",
      name: "Sylphx Support" // Optional: Sender name
    },
    subject: body.subject,
    content: [
      body.text ? { type: "text/plain", value: body.text } : undefined,
      body.html ? { type: "text/html", value: body.html } : undefined
    ].filter(Boolean) // Remove undefined entries
  };

   if (emailPayload.content.length === 0) {
       throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing email content (text or html).' });
   }


  // 4. Call MailChannels API
  try {
    const response = await fetch(MAILCHANNELS_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    // MailChannels returns 202 Accepted on success
    if (response.status !== 202) {
      const errorText = await response.text();
      console.error("MailChannels API Error:", response.status, errorText);
      throw new Error(`Failed to send email via MailChannels: ${response.status} ${errorText}`);
    }

    console.log(`Email successfully sent to ${body.to} via MailChannels.`);
    return { success: true, message: 'Email sent successfully.' };

  } catch (error: unknown) {
    console.error("Error sending email via MailChannels:", error);
    const message = error instanceof Error ? error.message : 'Failed to send email.';
    throw createError({ statusCode: 500, statusMessage: `Email sending failed: ${message}` });
  }
});