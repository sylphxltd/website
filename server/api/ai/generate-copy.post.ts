import type { H3Event } from 'h3'; // Use import type
import { openai } from '@ai-sdk/openai'; // Import the 'openai' provider function/object
import { streamText } from 'ai';
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // For auth check

// Define the expected request body structure
interface GenerateCopyBody {
  appName: string;
  appDescription?: string;
  targetAudience?: string; // Optional: Add more context fields
  tone?: string;         // Optional: e.g., 'professional', 'playful'
}

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();
  const config = useRuntimeConfig(); // Access runtime config for API key

  // 1. Authentication and Authorization Check (Ensure only admins can call this)
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
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: OpenAI API key not set.' });
  }
  // API Key is likely read from environment variables by the SDK automatically
  // or needs to be configured differently if not. Remove explicit provider instance creation.

  // 3. Read and Validate Request Body
  const body = await readBody<GenerateCopyBody>(event);
  if (!body || !body.appName) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appName in request body.' });
  }

  // 4. Construct Prompt
  // Simple prompt, can be made more sophisticated
  const prompt = `Generate a short, engaging marketing description (around 2-3 sentences) for a mobile application.
App Name: ${body.appName}
${body.appDescription ? `Current Description: ${body.appDescription}` : ''}
${body.targetAudience ? `Target Audience: ${body.targetAudience}` : ''}
${body.tone ? `Desired Tone: ${body.tone}` : ''}
Focus on the key benefits and make it appealing. Output only the generated description.`;

  // 5. Call AI SDK and Stream Response
  try {
    // Directly use the imported 'openai' function with the model ID
    const result = await streamText({
      model: openai('gpt-4o'), // Specify the model directly
      prompt: prompt,
      maxTokens: 150, // Limit output length
    });

    // Return the stream directly to the client using the correct method
    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error("Error calling OpenAI:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate copy.';
    // Check for specific API errors (e.g., rate limits, invalid key)
    if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
    throw createError({ statusCode: 500, statusMessage: `AI generation failed: ${message}` });
  }
});