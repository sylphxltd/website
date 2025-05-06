import type { H3Event } from 'h3';
import { readBody, getHeader } from 'h3'; // Added getHeader
import { getAdminAuth, getStorageBucket } from '~/server/utils/firebaseAdmin'; // Added getStorageBucket
import { openai } from '@ai-sdk/openai'; // Import the 'openai' provider
import { generateText } from 'ai'; // Import generateText
import type { File } from '@google-cloud/storage'; // Import File type for typing

interface GenerateReplyRequestBody {
  appId: string; // Added: Mandatory App ID for context
  reviewBody: string;
  rating: number;
  // Add other optional context: appName, previousReply, language, etc.
}

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();
  const config = useRuntimeConfig(); // Access runtime config for API key

  // 1. Authorization Check (Admin Only)
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

  // 2. Read Request Body and Validate
  const body = await readBody<GenerateReplyRequestBody>(event);
  // Updated validation to include appId
  if (!body || !body.appId || !body.reviewBody || typeof body.rating !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId, reviewBody, or rating' });
  }

  const { appId, reviewBody, rating } = body;

  // 3. Get API Key
  const openaiApiKey = config.openaiApiKey;
  if (!openaiApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error: OpenAI API key not set.' });
  }
  // Note: The AI SDK typically reads the key from the environment automatically.

  // 4. Fetch and Summarize App Resources from Storage
  let resourceSummary: string | null = null;
  const MAX_TEXT_FILES = 3;
  const MAX_CHARS_PER_FILE = 2000;
  const TEXT_FILE_EXTENSIONS = ['.txt', '.md', '.json']; // Consider adding more if needed

  try {
    const bucket = getStorageBucket();
    const prefix = `resources/${appId}/`;
    const [allFiles] = await bucket.getFiles({ prefix });

    const textFiles = allFiles
      .filter((file: File) => {
        const fileName = file.name.toLowerCase();
        return TEXT_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext));
      })
      .slice(0, MAX_TEXT_FILES);

    if (textFiles.length > 0) {
      console.log(`[AI Review Reply] Found ${textFiles.length} potential text resources for appId ${appId}:`, textFiles.map(f => f.name).join(', '));

      let combinedContent = '';
      for (const file of textFiles) {
        try {
          const [contentBuffer] = await file.download();
          const fileContent = contentBuffer.toString('utf-8', 0, MAX_CHARS_PER_FILE);
          combinedContent += `\n\n--- Context from ${file.name.split('/').pop()} ---\n${fileContent}`;
          console.log(`[AI Review Reply] Read ${fileContent.length} chars from ${file.name}`);
        } catch (downloadError) {
          console.error(`[AI Review Reply] Error downloading content for ${file.name}:`, downloadError);
        }
      }
      combinedContent = combinedContent.trim();

      if (combinedContent) {
        try {
          console.log(`[AI Review Reply] Generating summary for ${combinedContent.length} chars of combined content...`);
          const summaryPrompt = `Summarize the following text, focusing on key aspects relevant for replying to a user review of a software application. Be concise (1-2 sentences):\n\n${combinedContent}\n\nSummary:`;
          const { text: summary } = await generateText({
            model: openai('gpt-3.5-turbo'), // Use a cheaper/faster model for summary
            prompt: summaryPrompt,
            maxTokens: 100,
          });
          resourceSummary = summary.trim();
          console.log(`[AI Review Reply] Generated resource summary: "${resourceSummary}"`);
        } catch (summaryError) {
          console.error('[AI Review Reply] Error generating resource summary:', summaryError);
        }
      } else {
         console.log(`[AI Review Reply] No text content could be read from identified files for appId ${appId}.`);
      }
    } else {
       console.log(`[AI Review Reply] No relevant text resources found for appId ${appId} under prefix ${prefix}`);
    }
  } catch (error) {
    console.error(`[AI Review Reply] Error processing resources for appId ${appId}:`, error);
    // Proceed without resource context if fetching/processing fails
  }

  // 5. Call AI Service to Generate Reply
  try {
    console.log(`Generating AI reply suggestion for review (Rating ${rating}) with appId ${appId}: "${reviewBody.substring(0, 50)}..."`);

    // Construct the prompt with context
    const prompt = `Generate a polite and helpful reply to the following app review.
${resourceSummary ? `\nApp Context:\n${resourceSummary}` : '\nApp Context:\nNo specific app context available.'}

Review (Rating ${rating}/5):
${reviewBody}

Reply:`;

    // Use generateText as we don't need streaming for a single suggestion
    const { text: suggestion } = await generateText({
      model: openai('gpt-4o'), // Use a capable model for the main reply
      prompt: prompt,
      maxTokens: 150, // Adjust as needed
      temperature: 0.7, // Adjust for creativity vs. consistency
    });

    if (!suggestion) {
        throw new Error('AI failed to generate a suggestion.');
    }

    return { suggestion: suggestion.trim() };

  } catch (error: unknown) { // Catch unknown type for better error handling
    console.error("Error generating AI reply:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate suggestion.';
     if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
    throw createError({ statusCode: 500, statusMessage: `Internal Server Error generating AI reply: ${message}` });
  }
});