import type { H3Event } from 'h3';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface GenerateEmailReplyBody {
  originalSubject: string;
  originalSender: string;
  originalBody: string;
}

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();
  const config = useRuntimeConfig();

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

  // 2. Get API Key
  const openaiApiKey = config.openaiApiKey;
  if (!openaiApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: OpenAI API key not set.' });
  }
  // SDK should pick up key from environment/config

  // 3. Read and Validate Request Body
  const body = await readBody<GenerateEmailReplyBody>(event);
  if (!body || !body.originalSubject || !body.originalSender || !body.originalBody) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing originalSubject, originalSender, or originalBody.' });
  }

  // 4. Construct Prompt
  const prompt = `Generate a professional and helpful reply to the following customer support email. Address the main points of the original email. Keep the reply concise and clear.

Original Sender: ${body.originalSender}
Original Subject: ${body.originalSubject}
Original Body:
---
${body.originalBody}
---

Generated Reply (Start with a suitable greeting like "Hi [Sender Name]," if possible, otherwise use a generic greeting):`;


  // 5. Call AI SDK and Stream Response
  try {
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: 300, // Allow for slightly longer email replies
    });

    // Return the stream directly
    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error("Error calling OpenAI for email reply:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate email reply.';
     if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
    throw createError({ statusCode: 500, statusMessage: `AI email reply generation failed: ${message}` });
  }
});