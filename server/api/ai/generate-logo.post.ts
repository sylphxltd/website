import type { H3Event } from 'h3'; // Use import type
import { openai } from '@ai-sdk/openai'; // Import the 'openai' provider function/object
import { generateText } from 'ai'; // Import generateText
import { getAdminAuth, getStorageBucket } from '~/server/utils/firebaseAdmin';
import type { File } from '@google-cloud/storage';

// Define the expected request body structure
interface GenerateLogoBody {
  appId: string; // Added: Mandatory App ID for context
  appName: string;
  stylePrompt?: string; // e.g., 'minimalist', 'flat design', 'abstract'
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
  // Using direct fetch for DALL-E 3

  // 3. Read and Validate Request Body
  const body = await readBody<GenerateLogoBody>(event);
  // Updated validation to include appId
  if (!body || !body.appName || !body.appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appName or appId in request body.' });
  }

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
      console.log(`[AI Gen Logo] Found ${textFiles.length} potential text resources for appId ${body.appId}:`, textFiles.map(f => f.name).join(', '));

      // 2. Read content from identified files
      let combinedContent = '';
      for (const file of textFiles) {
        try {
          const [contentBuffer] = await file.download();
          const fileContent = contentBuffer.toString('utf-8', 0, MAX_CHARS_PER_FILE); // Read limited content
          combinedContent += `\n\n--- Content from ${file.name.split('/').pop()} ---\n${fileContent}`;
          console.log(`[AI Gen Logo] Read ${fileContent.length} chars from ${file.name}`);
        } catch (downloadError) {
          console.error(`[AI Gen Logo] Error downloading content for ${file.name}:`, downloadError);
          // Skip this file and continue
        }
      }
      combinedContent = combinedContent.trim();

      // 3. Generate Summary (Internal AI Call)
      if (combinedContent) {
        try {
          console.log(`[AI Gen Logo] Generating summary for ${combinedContent.length} chars of combined content...`);
          const summaryPrompt = `Summarize the following text, focusing on key aspects relevant for describing a software application. Be concise (1-2 sentences):\n\n${combinedContent}\n\nSummary:`;
          const { text: summary } = await generateText({
            model: openai('gpt-4o'), // Use a capable model for summarization
            prompt: summaryPrompt,
            maxTokens: 100, // Limit summary length
          });
          resourceSummary = summary.trim();
          console.log(`[AI Gen Logo] Generated resource summary: "${resourceSummary}"`);
        } catch (summaryError) {
          console.error('[AI Gen Logo] Error generating resource summary:', summaryError);
          // Proceed without summary if internal call fails
        }
      } else {
         console.log(`[AI Gen Logo] No text content could be read from identified files for appId ${body.appId}.`);
      }

    } else {
       console.log(`[AI Gen Logo] No relevant text resources found for appId ${body.appId} under prefix ${prefix}`);
    }

  } catch (error) {
    console.error(`[AI Gen Logo] Error processing resources for appId ${body.appId}:`, error);
    // Allow generation to proceed without resource context if fetching/processing fails
  }
  // --- End: Fetch and Summarize App Resources ---


  // 4. Construct Prompt for DALL-E (Updated)
  const prompt = `Create a simple, modern app logo for an application named "${body.appName}". ${resourceSummary ? `The app is about: ${resourceSummary}. Consider these themes.` : ''} ${body.stylePrompt ? `Style: ${body.stylePrompt}.` : 'Style: minimalist vector.'} The logo should be suitable for a small icon. Do not include any text in the logo itself.`;

  // 5. Call OpenAI Image Generation API (DALL-E 3) using fetch
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3", // Use DALL-E 3
        prompt: prompt,
        n: 1, // Generate one image
        size: "1024x1024", // Specify image size
        response_format: "url" // Get a URL back
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI Image API Error:", errorData);
      throw new Error(errorData.error?.message || `Failed to generate logo (HTTP ${response.status})`);
    }

    const result = await response.json();
    const imageUrl = result.data?.[0]?.url;

    if (!imageUrl) {
        throw new Error("No image URL received from OpenAI.");
    }

    // 6. Return the image URL
    return { logoUrl: imageUrl };

  } catch (error: unknown) {
    console.error("Error generating logo:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate logo.';
     if (message.includes('invalid api key')) {
         throw createError({ statusCode: 500, statusMessage: 'Server configuration error: Invalid OpenAI API key.' });
    }
     if (message.includes('billing issue')) {
         throw createError({ statusCode: 402, statusMessage: 'AI service billing issue.' });
     }
    throw createError({ statusCode: 500, statusMessage: `Logo generation failed: ${message}` });
  }
});