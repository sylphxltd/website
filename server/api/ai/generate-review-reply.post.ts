import type { H3Event } from 'h3';
import { openai } from '@ai-sdk/openai'; // Correct import
import { streamText } from 'ai'; // Or use generateText if streaming isn't needed
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface GenerateReplyBody {
  reviewText: string;
  reviewRating: number; // 1-5
  appName: string; // Context for the reply
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

  // 2. Get API Key and Initialize AI Client
  const openaiApiKey = config.openaiApiKey;
  if (!openaiApiKey) {
    // Although the SDK might read from env var, check if it's set in runtimeConfig for clarity/fallback
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: OpenAI API key not set in runtime config.' });
  }
  // Remove explicit provider initialization; SDK should handle API key from environment or config.

  // 3. Read and Validate Request Body
  const body = await readBody<GenerateReplyBody>(event);
  if (!body || !body.reviewText || !body.reviewRating || !body.appName) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing reviewText, reviewRating, or appName.' });
  }

  // 4. Construct Prompt
  let prompt = `Generate a polite and helpful reply to the following app store review for the app "${body.appName}".\n\n`;
  prompt += `Rating: ${body.reviewRating} / 5\n`;
  prompt += `Review Text: "${body.reviewText}"\n\n`;

  if (body.reviewRating >= 4) {
      prompt += 'The review is positive. Thank the user and briefly acknowledge their feedback. Keep the reply concise.';
  } else if (body.reviewRating <= 2) {
      prompt += 'The review is negative. Apologize for the user\'s negative experience, show empathy, and offer assistance or mention that the feedback will be passed on to the development team. Avoid making specific promises you can\'t keep.';
  } else {
      prompt += 'The review is neutral. Acknowledge the feedback politely and thank the user for their input.';
  }
  prompt += '\n\nGenerated Reply:'; // Use plain string

  // 5. Call AI SDK and Stream Response (or use generateText)
  try {
    // Using streamText for potential real-time display
    const result = await streamText({
      model: openai('gpt-4o'), // Use imported 'openai' directly with model ID
      prompt: prompt,
      maxTokens: 150,
    });

    // Return the stream directly
    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error("Error calling OpenAI for review reply:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate reply.';
     if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
    throw createError({ statusCode: 500, statusMessage: `AI reply generation failed: ${message}` });
  }
});