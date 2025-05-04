import type { H3Event } from 'h3';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai'; // Use generateText for non-streaming
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface GenerateSocialPostBody {
  originalContent: string;
  targetPlatform: 'x' | 'facebook'; // Add more platforms as needed
  title?: string; // Optional title for context
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

  // 3. Read and Validate Request Body
  const body = await readBody<GenerateSocialPostBody>(event);
  if (!body || !body.originalContent || !body.targetPlatform) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing originalContent or targetPlatform.' });
  }

  // 4. Construct Prompt based on platform
  let prompt = `Adapt the following content${body.title ? ` (titled "${body.title}")` : ''} into a suitable post for the social media platform: ${body.targetPlatform}.\n\nOriginal Content:\n---\n${body.originalContent}\n---\n\n`;

  let maxTokens = 500; // Default for Facebook-like

  switch (body.targetPlatform) {
      case 'x':
          prompt += `Adapt the content into a concise tweet (or a short thread if necessary, clearly indicating thread breaks with "[THREAD BREAK]"). Focus on the key message. Maximum length around 280 characters per tweet. Include relevant hashtags.`;
          maxTokens = 150; // Shorter for X
          break;
      case 'facebook':
          prompt += 'Adapt the content into an engaging Facebook post. You can be slightly more detailed than X. Include relevant hashtags and maybe a call to action if appropriate.'; // Use plain string
          maxTokens = 400; // Longer for Facebook
          break;
      // Add cases for other platforms
      default:
          throw createError({ statusCode: 400, statusMessage: `Unsupported target platform: ${body.targetPlatform}` });
  }

  prompt += `\n\nGenerated ${body.targetPlatform} Post:`;


  // 5. Call AI SDK (using generateText for a single output)
  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: maxTokens,
    });

    return { generatedContent: text };

  } catch (error: unknown) {
    console.error(`Error calling OpenAI for ${body.targetPlatform} post:`, error);
    const message = error instanceof Error ? error.message : `Failed to generate content for ${body.targetPlatform}.`;
     if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
    throw createError({ statusCode: 500, statusMessage: `AI content generation failed: ${message}` });
  }
});