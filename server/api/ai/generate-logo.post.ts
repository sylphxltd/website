import type { H3Event } from 'h3'; // Use import type
// import { OpenAI } from '@ai-sdk/openai'; // Removed unused import
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface GenerateLogoBody {
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
  if (!body || !body.appName) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appName in request body.' });
  }

  // 4. Construct Prompt for DALL-E
  const prompt = `Create a simple, modern app logo for an application named "${body.appName}". ${body.stylePrompt ? `Style: ${body.stylePrompt}.` : 'Style: minimalist vector.'} The logo should be suitable for a small icon. Do not include any text in the logo itself.`;

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