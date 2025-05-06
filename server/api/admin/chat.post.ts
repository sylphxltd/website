import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // Assuming firebaseAdmin utility exists
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { H3Error } from 'h3';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Corrected import

interface ChatRequestBody {
  message: string;
}

interface ToolUse {
  tool_use: {
    name: string;
    parameters?: Record<string, unknown>; // Changed 'any' to 'unknown'
  };
}

const SYSTEM_PROMPT = `You are an expert admin assistant for a software management platform.
You can help with tasks like listing applications.
If the user asks to see all applications, you should respond with a structured JSON object indicating this intent.
For example, if the user says "show me all apps" or "list apps", you should respond with:
{ "tool_use": { "name": "list_applications" } }

You can also help get details for a specific application.
If the user asks for details of an app, for example "get details for app123" or "show me info about my-app-id",
you should extract the application ID and respond with:
{ "tool_use": { "name": "get_application_details", "parameters": { "appId": "the_extracted_id" } } }
Ensure the appId is correctly extracted.

You can generate marketing copy for an application.
If the user asks to generate copy, e.g., "generate copy for app app123", "create a description for my-app-id targeting young adults with a playful tone",
extract the app ID and any provided context (current description, target audience, tone). Respond with:
{ "tool_use": { "name": "generate_application_copy", "parameters": { "appId": "the_id", "appDescription": "optional_desc", "targetAudience": "optional_audience", "tone": "optional_tone" } } }

You can generate a logo for an application.
If the user asks to generate a logo, e.g., "generate logo for app app123 with a minimalist style",
extract the app ID and any style prompt. Respond with:
{ "tool_use": { "name": "generate_application_logo", "parameters": { "appId": "the_id", "stylePrompt": "optional_style" } } }

You can help generate a reply for a specific app review.
If the user asks to generate a reply, e.g., "generate reply for review reviewXYZ of app app123",
extract the review ID and app ID. Respond with:
{ "tool_use": { "name": "generate_review_reply", "parameters": { "appId": "the_app_id", "reviewId": "the_review_id" } } }

For any other general conversation or questions not related to a specific tool, respond naturally.`;

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  let decodedToken: DecodedIdToken;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    // Check for custom admin claim
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt by user: ${decodedToken.uid}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
     const message = error instanceof Error ? error.message : String(error);
     console.error("Error verifying admin token:", message);
     // Distinguish between verification errors and forbidden access
     // Check if it's an H3Error with the specific status code we threw
     if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
        throw error; // Re-throw the specific forbidden error
     }
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }

  const adminUid = decodedToken.uid; // Get admin UID for logging

  // 2. Read and Validate Request Body
  let body: ChatRequestBody;
  try {
      body = await readBody<ChatRequestBody>(event);
      if (!body || typeof body.message !== 'string' || body.message.trim() === '') {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid "message" in request body' });
      }
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error reading or validating request body:", message);
      // Handle JSON parsing errors or validation errors
      // Check if it's an H3Error with the specific status code we threw
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 400) {
          throw error; // Re-throw validation error
      }
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Could not process request body' });
  }

  const userMessage = body.message.trim();

  // 3. Process with AI
  try {
    console.log(`Admin Chat: Received message from admin [${adminUid}]: "${userMessage}"`);

    const { text: aiResponseText } = await generateText({
      model: openai.chat('gpt-4-turbo'), // Or your preferred model
      system: SYSTEM_PROMPT,
      prompt: userMessage,
    });

    console.log(`Admin Chat: AI response for admin [${adminUid}]: "${aiResponseText}"`);

    try {
      const parsedAiResponse = JSON.parse(aiResponseText) as ToolUse;

      if (parsedAiResponse?.tool_use?.name === "list_applications") {
        try {
          interface AppBasicInfo {
            id: string;
            name: string;
          }
          interface ListAppsResponse {
            apps: AppBasicInfo[];
          }

          const response = await $fetch<ListAppsResponse>('/api/apps/list', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (response.apps && response.apps.length > 0) {
            const appNames = response.apps.map(app => `${app.name} (ID: ${app.id})`).join(', ');
            return { reply: `Found ${response.apps.length} apps: ${appNames}.` };
          }
          return { reply: "No applications found." };
        } catch (fetchError: unknown) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.error(`Admin Chat: Error fetching app list for admin [${adminUid}] after AI intent:`, errorMessage, fetchError);
          return { reply: "Sorry, I understood you want to list apps, but I couldn't fetch them at the moment." };
        }
      } else if (parsedAiResponse?.tool_use?.name === "get_application_details") {
        const appId = parsedAiResponse.tool_use.parameters?.appId as string | undefined;

        if (!appId || typeof appId !== 'string' || appId.trim() === '') {
          console.warn(`Admin Chat: AI identified 'get_application_details' but appId was missing or invalid for admin [${adminUid}]:`, parsedAiResponse.tool_use.parameters);
          return { reply: "I understood you want details for an app, but I couldn't identify which one. Please specify the App ID." };
        }

        try {
          // Define a more specific type for the app details if known, otherwise use a generic one
          interface AppDetails {
            id: string;
            name: string;
            description?: string;
            createdAt: string; // Assuming ISO string date
            // Add other relevant fields
          }

          const appDetails = await $fetch<AppDetails>(`/api/apps/${appId.trim()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });

          // Format the app details into a user-friendly string
          let detailsString = `Details for App ${appDetails.name} (ID: ${appDetails.id}):`;
          if (appDetails.description) {
            detailsString += `\nDescription: ${appDetails.description}`;
          }
          detailsString += `\nCreated At: ${new Date(appDetails.createdAt).toLocaleString()}`;
          // Add more fields as needed

          return { reply: detailsString };

        } catch (fetchError: unknown) {
          const h3Error = fetchError as H3Error; // Type assertion
          if (h3Error.statusCode === 404) {
            console.warn(`Admin Chat: App with ID [${appId}] not found for admin [${adminUid}].`);
            return { reply: `Sorry, I couldn't find an application with ID "${appId}". Please check the ID and try again.` };
          }
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.error(`Admin Chat: Error fetching app details for ID [${appId}] for admin [${adminUid}]:`, errorMessage, fetchError);
          return { reply: `Sorry, I understood you want details for app "${appId}", but I couldn't fetch them right now.` };
        }
      } else if (parsedAiResponse?.tool_use?.name === "generate_application_copy") {
        const params = parsedAiResponse.tool_use.parameters;
        const appId = params?.appId as string | undefined;
        const appDescription = params?.appDescription as string | undefined;
        const targetAudience = params?.targetAudience as string | undefined;
        const tone = params?.tone as string | undefined;

        if (!appId || typeof appId !== 'string' || appId.trim() === '') {
          console.warn(`Admin Chat: AI identified 'generate_application_copy' but appId was missing or invalid for admin [${adminUid}]:`, params);
          return { reply: "I understood you want to generate copy for an app, but I couldn't identify which one. Please specify the App ID." };
        }

        try {
          console.log(`Admin Chat: Calling /api/ai/generate-copy for app [${appId}] by admin [${adminUid}] with params:`, { appDescription, targetAudience, tone });

          // The /api/ai/generate-copy.post.ts endpoint is expected to stream text.
          // $fetch should handle this and return the complete string once the stream ends.
          const generatedCopyText = await $fetch<string>('/api/ai/generate-copy', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
            body: {
              appId: appId.trim(),
              ...(appDescription && { appDescription }),
              ...(targetAudience && { targetAudience }),
              ...(tone && { tone }),
            },
          });

          if (!generatedCopyText || generatedCopyText.trim() === '') {
            console.warn(`Admin Chat: /api/ai/generate-copy returned empty response for app [${appId}] by admin [${adminUid}]`);
            return { reply: `I tried to generate copy for app "${appId}", but it seems I couldn't come up with anything right now.` };
          }

          return { reply: `Generated copy for app ${appId.trim()}: ${generatedCopyText}` };

        } catch (fetchError: unknown) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.error(`Admin Chat: Error calling /api/ai/generate-copy for app [${appId}] by admin [${adminUid}]:`, errorMessage, fetchError);
          const h3Error = fetchError as H3Error;
          if (h3Error.statusCode === 404) { // Assuming generate-copy might 404 if app itself not found by its internal logic
             return { reply: `Sorry, I couldn't find an application with ID "${appId}" to generate copy for. Please check the ID.` };
          }
          return { reply: `Sorry, I couldn't generate copy for app "${appId}" at the moment. There was an issue with the generation service.` };
        }
      } else if (parsedAiResponse?.tool_use?.name === "generate_application_logo") {
        const params = parsedAiResponse.tool_use.parameters;
        const appId = params?.appId as string | undefined;
        const stylePrompt = params?.stylePrompt as string | undefined;

        if (!appId || typeof appId !== 'string' || appId.trim() === '') {
          console.warn(`Admin Chat: AI identified 'generate_application_logo' but appId was missing or invalid for admin [${adminUid}]:`, params);
          return { reply: "I understood you want to generate a logo for an app, but I couldn't identify which one. Please specify the App ID." };
        }

        try {
          console.log(`Admin Chat: Calling /api/ai/generate-logo for app [${appId}] by admin [${adminUid}] with stylePrompt:`, stylePrompt);

          interface GenerateLogoResponse {
            logoUrl: string;
          }

          const response = await $fetch<GenerateLogoResponse>('/api/ai/generate-logo', { // Or /api/ai/generate-logo.post
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
            body: {
              appId: appId.trim(),
              ...(stylePrompt && { stylePrompt }),
            },
          });

          if (!response || !response.logoUrl) {
            console.warn(`Admin Chat: /api/ai/generate-logo returned invalid response for app [${appId}] by admin [${adminUid}]`);
            return { reply: `I tried to generate a logo for app "${appId}", but it seems I couldn't get a valid URL back.` };
          }

          return { reply: `Generated logo for app ${appId.trim()}: ${response.logoUrl}` };

        } catch (fetchError: unknown) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.error(`Admin Chat: Error calling /api/ai/generate-logo for app [${appId}] by admin [${adminUid}]:`, errorMessage, fetchError);
          const h3Error = fetchError as H3Error;
          if (h3Error.statusCode === 404) {
             return { reply: `Sorry, I couldn't find an application with ID "${appId}" to generate a logo for. Please check the ID.` };
          }
          return { reply: `Sorry, I couldn't generate a logo for app "${appId}" at the moment. There was an issue with the generation service.` };
        }
      } else if (parsedAiResponse?.tool_use?.name === "generate_review_reply") {
        const params = parsedAiResponse.tool_use.parameters;
        const appId = params?.appId as string | undefined;
        const reviewId = params?.reviewId as string | undefined;

        if (!appId || typeof appId !== 'string' || appId.trim() === '' || !reviewId || typeof reviewId !== 'string' || reviewId.trim() === '') {
          console.warn(`Admin Chat: AI identified 'generate_review_reply' but appId or reviewId was missing or invalid for admin [${adminUid}]:`, params);
          return { reply: "I understood you want to generate a review reply, but I couldn't identify the app or review. Please specify both the App ID and Review ID." };
        }

        try {
          // Fetch Review Details
          interface ReviewDetails {
            reviewBody: string;
            rating: number;
            // Add other fields if necessary, though only reviewBody and rating are used below
          }
          console.log(`Admin Chat: Fetching review details for review [${reviewId}] of app [${appId}] by admin [${adminUid}]`);
          const reviewDetails = await $fetch<ReviewDetails>('/api/reviews/detail', { // Assuming query params are handled by $fetch
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`
            },
            query: { appId: appId.trim(), reviewId: reviewId.trim() }
          });

          if (!reviewDetails || typeof reviewDetails.reviewBody !== 'string' || typeof reviewDetails.rating !== 'number') {
            console.error(`Admin Chat: Invalid or incomplete review details received for review [${reviewId}], app [${appId}] by admin [${adminUid}]:`, reviewDetails);
            return { reply: `Sorry, I couldn't fetch the necessary details for review "${reviewId}". The data might be incomplete.` };
          }

          console.log(`Admin Chat: Calling /api/ai/generate-review-reply for review [${reviewId}] of app [${appId}] by admin [${adminUid}]`);

          interface GenerateReviewReplyResponse {
            suggestion: string;
          }

          const replyResponse = await $fetch<GenerateReviewReplyResponse>('/api/ai/generate-review-reply', { // Or /api/ai/generate-review-reply.post
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
            body: {
              appId: appId.trim(),
              reviewBody: reviewDetails.reviewBody,
              rating: reviewDetails.rating,
            },
          });

          if (!replyResponse || !replyResponse.suggestion) {
            console.warn(`Admin Chat: /api/ai/generate-review-reply returned invalid response for review [${reviewId}], app [${appId}] by admin [${adminUid}]`);
            return { reply: `I tried to generate a reply for review "${reviewId}", but it seems I couldn't get a valid suggestion back.` };
          }

          return { reply: `Suggested reply for review ${reviewId.trim()} (app ${appId.trim()}): ${replyResponse.suggestion}` };

        } catch (fetchError: unknown) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          const h3Error = fetchError as H3Error;
          if (h3Error.statusCode === 404) {
             console.warn(`Admin Chat: Could not find review [${reviewId}] for app [${appId}] or the app itself, for admin [${adminUid}]. Error:`, errorMessage);
             return { reply: `Sorry, I couldn't find review "${reviewId}" for app "${appId}". Please check the IDs.` };
          }
          console.error(`Admin Chat: Error in 'generate_review_reply' flow for review [${reviewId}], app [${appId}] by admin [${adminUid}]:`, errorMessage, fetchError);
          return { reply: `Sorry, I couldn't generate a reply for review "${reviewId}" at the moment. There was an issue with the process.` };
        }
      }
      else {
        // If JSON is valid but not a recognized tool_use structure
        console.warn(`Admin Chat: AI returned valid JSON but not a recognized tool use for admin [${adminUid}]:`, parsedAiResponse);
        return { reply: aiResponseText }; // Return the AI's natural language response
      }
    } catch (jsonError) {
      // AI response was not valid JSON, assume it's a natural language reply
      console.log(`Admin Chat: AI response for admin [${adminUid}] was not JSON, treating as natural language: "${aiResponseText}"`);
      return { reply: aiResponseText };
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Admin Chat: Error processing message with AI for admin [${adminUid}]:`, message, error);
    // Check if it's an error from the AI SDK or a general processing error
    // You might want more specific error handling for AI SDK errors if they have unique properties
    return { reply: "I'm having trouble understanding that request or connecting to the AI service." };
  }
});