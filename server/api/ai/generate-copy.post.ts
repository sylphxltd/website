import type { H3Event } from 'h3'; // Use import type
import { openai } from '@ai-sdk/openai'; // Import the 'openai' provider function/object
import { streamText, generateText } from 'ai'; // Import generateText
import { getAdminAuth, getStorageBucket } from '~/server/utils/firebaseAdmin'; // For auth check and storage
import type { File } from '@google-cloud/storage'; // Import File type for typing

// Define the expected request body structure
interface GenerateCopyBody {
  appId: string; // Added: Mandatory App ID for context
  appName?: string; // Made optional
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

  if (!body || !body.appId) { // appName is now optional, only appId is strictly required initially
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId in request body.' });
  }

  let finalAppName = body.appName;

  if (!finalAppName) {
    // appName was not provided, try to fetch it using appId
    console.log(`[AI Gen Copy] appName not provided for appId ${body.appId}, fetching...`);
    try {
      // Make an internal fetch call to get app details
      // Assuming the app details endpoint returns an object like { id: string, name: string, ... }
      const appDetails = await $fetch<{ name: string }>(`/api/apps/${body.appId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`, // Pass the admin's token
        },
      });

      if (appDetails?.name) { // Changed to optional chain
        finalAppName = appDetails.name;
        console.log(`[AI Gen Copy] Fetched appName: "${finalAppName}" for appId ${body.appId}`);
      } else {
        throw createError({ statusCode: 404, statusMessage: `App not found or name missing for appId ${body.appId}.` });
      }
    } catch (fetchError: unknown) { // Changed 'any' to 'unknown'
      console.error(`[AI Gen Copy] Error fetching app details for appId ${body.appId}:`, fetchError);
      // Type guard for fetchError to access statusCode
      if (typeof fetchError === 'object' && fetchError !== null && 'statusCode' in fetchError && fetchError.statusCode === 404) {
        throw createError({ statusCode: 404, statusMessage: `App not found for the given appId: ${body.appId}.` });
      }
      throw createError({ statusCode: 500, statusMessage: `Failed to fetch app details for appId ${body.appId}.` });
    }
  }

  // At this point, finalAppName should be set, either from input or fetched.
  // If it's still not set (e.g. fetch failed and didn't throw an error that was caught above, which shouldn't happen with current logic)
  // this would be an internal error, but the checks above should prevent this.
  // For robustness, one might add a check here, but the current logic aims to throw before this point if appName cannot be determined.


  // --- Start: Fetch and Summarize App Resources from Storage ---
  let resourceSummary: string | null = null;
  const MAX_TEXT_FILES = 3; // Limit the number of text files to process
  const MAX_CHARS_PER_FILE = 2000; // Limit characters read per file
  const TEXT_FILE_EXTENSIONS = ['.txt', '.md', '.json'];

  try {
    const bucket = getStorageBucket();
    const prefix = `resources/${body.appId}/`;
    const [allFiles] = await bucket.getFiles({ prefix });

    // 1. Identify relevant text files
    const textFiles = allFiles
      .filter((file: File) => {
        const fileName = file.name.toLowerCase();
        // Basic check for text-based extensions
        return TEXT_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext));
        // TODO: Could potentially check file.metadata.contentType if available and reliable
      })
      .slice(0, MAX_TEXT_FILES); // Limit the number of files

    if (textFiles.length > 0) {
      console.log(`[AI Gen Copy] Found ${textFiles.length} potential text resources for appId ${body.appId}:`, textFiles.map(f => f.name).join(', '));

      // 2. Read content from identified files
      let combinedContent = '';
      for (const file of textFiles) {
        try {
          const [contentBuffer] = await file.download();
          const fileContent = contentBuffer.toString('utf-8', 0, MAX_CHARS_PER_FILE); // Read limited content
          combinedContent += `\n\n--- Content from ${file.name.split('/').pop()} ---\n${fileContent}`;
          console.log(`[AI Gen Copy] Read ${fileContent.length} chars from ${file.name}`);
        } catch (downloadError) {
          console.error(`[AI Gen Copy] Error downloading content for ${file.name}:`, downloadError);
          // Skip this file and continue
        }
      }
      combinedContent = combinedContent.trim();

      // 3. Generate Summary (Internal AI Call)
      if (combinedContent) {
        try {
          console.log(`[AI Gen Copy] Generating summary for ${combinedContent.length} chars of combined content...`);
          const summaryPrompt = `Summarize the following text, focusing on key aspects relevant for describing a software application. Be concise (1-2 sentences):\n\n${combinedContent}\n\nSummary:`;
          const { text: summary } = await generateText({
            model: openai('gpt-4o'), // Using the same model as main generation for now
            prompt: summaryPrompt,
            maxTokens: 100, // Limit summary length
          });
          resourceSummary = summary.trim();
          console.log(`[AI Gen Copy] Generated resource summary: "${resourceSummary}"`);
        } catch (summaryError) {
          console.error('[AI Gen Copy] Error generating resource summary:', summaryError);
          // Proceed without summary if internal call fails
        }
      } else {
         console.log(`[AI Gen Copy] No text content could be read from identified files for appId ${body.appId}.`);
      }

    } else {
       console.log(`[AI Gen Copy] No relevant text resources found for appId ${body.appId} under prefix ${prefix}`);
    }

  } catch (error) {
    console.error(`[AI Gen Copy] Error processing resources for appId ${body.appId}:`, error);
    // Allow generation to proceed without resource context if fetching/processing fails
  }
  // --- End: Fetch and Summarize App Resources ---


  // 4. Construct Prompt
  // Simple prompt, can be made more sophisticated
  const prompt = `Generate a short, engaging marketing description (around 2-3 sentences) for a mobile application.
App Name: ${finalAppName}
${resourceSummary ? `Based on provided resources:\n${resourceSummary}` : ''}
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