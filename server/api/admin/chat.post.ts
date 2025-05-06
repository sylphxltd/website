import type { H3Event } from 'h3';
import { sendStream, setResponseHeader } from 'h3'; // Added for streaming
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // Assuming firebaseAdmin utility exists
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { H3Error } from 'h3';
import { streamText, type StreamTextResult, type ToolCall } from 'ai'; // Added ToolCall for more specific typing
import { openai } from '@ai-sdk/openai'; // Corrected import

// Define a more specific type for the tools used in this handler
interface AdminChatToolParameters {
  appId?: string;
  appDescription?: string;
  targetAudience?: string;
  tone?: string;
  stylePrompt?: string;
  reviewId?: string;
  [key: string]: unknown; // Allow other parameters
}

// The AdminChatTool interface was an attempt to strongly type tools,
// but the current logic parses a custom 'ToolUse' structure from streamTextResult.text.
// We'll keep AdminChatToolParameters for now if it's useful for the SDK's generics.

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

    const streamTextResultUntyped = await streamText({
      model: openai.chat('gpt-4-turbo'),
      system: SYSTEM_PROMPT,
      prompt: userMessage,
    });
    
    // Cast to any to bypass TS errors about property existence, as a workaround.
    const streamTextResult = streamTextResultUntyped as any;
 
    // New logic based on streamTextResult.type
    if (streamTextResult.type === 'text') {
      console.log(`Admin Chat: Streaming direct AI response (type: 'text') for admin [${adminUid}]`);
      setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
      setResponseHeader(event, 'Cache-Control', 'no-cache');
      try {
        if (!streamTextResult.readableStream) {
          console.error(`Admin Chat: readableStream is not available on streamTextResult (type: 'text') for admin [${adminUid}]. Cannot stream direct response.`);
          // Attempt to get full text if stream is not available
          const textContent = await streamTextResult.text;
          if (textContent) {
             console.warn(`Admin Chat: Fallback to sending full text content as non-streamed response for admin [${adminUid}] because readableStream was unavailable.`);
             return { reply: textContent };
          }
          throw new Error('readableStream not available for direct AI response (type: text) and no fallback text content.');
        }
        return sendStream(event, streamTextResult.readableStream);
      } catch (streamError: unknown) {
        const streamErrorMessage = streamError instanceof Error ? streamError.message : String(streamError);
        console.error(`Admin Chat: Error during sendStream for direct AI response (type: 'text') for admin [${adminUid}]:`, streamErrorMessage, streamError);
        throw streamError; // Re-throw to be caught by the outer try-catch
      }
    } else if (streamTextResult.type === 'tool-calls') {
      console.log(`Admin Chat: AI response for admin [${adminUid}] (type: 'tool-calls') - processing tool calls...`);
      
      // When type is 'tool-calls', toolCalls should be available.
      // The Vercel SDK's StreamTextResult type for 'tool-calls' should guarantee .toolCalls
      const toolCallsResult = await streamTextResult.toolCalls;
      const aiResponseText = await streamTextResult.text; // This is the JSON string for tool calls
 
      const actualToolCalls: any[] = Array.isArray(toolCallsResult) ? toolCallsResult : [];

      if (actualToolCalls.length > 0) {
        console.log(`Admin Chat: AI response for admin [${adminUid}] (tool use detected via type: 'tool-calls', full text for tools): "${aiResponseText}"`);
        try {
          // The aiResponseText is expected to be a JSON string that might represent one of the tools.
          // The system prompt guides the AI to return a specific JSON structure like { "tool_use": { "name": "...", "parameters": {...} } }
          // This structure is slightly different from the direct `ToolCall[]` from `streamTextResult.toolCalls`.
          // The existing logic parses `aiResponseText`. We should ensure this is the intended behavior.
          // If `toolCalls` from the SDK is already structured, we might use that directly.
          // For now, sticking to parsing `aiResponseText` as per existing logic.
          const parsedAiResponse = JSON.parse(aiResponseText) as ToolUse;
          
          // Example of how you might use the structured `actualToolCalls` from the SDK if needed:
          // const firstSdkTool = actualToolCalls[0];
          // if (firstSdkTool.toolName === 'list_applications') { /* ... */ }

          if (parsedAiResponse?.tool_use?.name === "list_applications") {
            try {
              interface AppBasicInfo { id: string; name: string; }
              interface ListAppsResponse { apps: AppBasicInfo[]; }
 
              const response = await $fetch<ListAppsResponse>('/api/apps/list', {
                method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }
              });
 
              if (response.apps && response.apps.length > 0) {
                const appNames = response.apps.map(app => `${app.name} (ID: ${app.id})`).join(', ');
                return { reply: `Found ${response.apps.length} apps: ${appNames}.` };
              }
              return { reply: "No applications found." };
            } catch (fetchError: unknown) {
              const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
              console.error(`Admin Chat: Error fetching app list for admin [${adminUid}] after AI intent (type: 'tool-calls'):`, errorMessage, fetchError);
              return { reply: "Sorry, I understood you want to list apps, but I couldn't fetch them at the moment." };
            }
          } else if (parsedAiResponse?.tool_use?.name === "get_application_details") {
            const appId = parsedAiResponse.tool_use.parameters?.appId as string | undefined;
            if (!appId || typeof appId !== 'string' || appId.trim() === '') {
              console.warn(`Admin Chat: AI identified 'get_application_details' (type: 'tool-calls') but appId was missing or invalid for admin [${adminUid}]:`, parsedAiResponse.tool_use.parameters);
              return { reply: "I understood you want details for an app, but I couldn't identify which one. Please specify the App ID." };
            }
            try {
              interface AppDetails { id: string; name: string; description?: string; createdAt: string; }
              const appDetails = await $fetch<AppDetails>(`/api/apps/${appId.trim()}`, {
                method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }
              });
              let detailsString = `Details for App ${appDetails.name} (ID: ${appDetails.id}):`;
              if (appDetails.description) { detailsString += `\nDescription: ${appDetails.description}`; }
              detailsString += `\nCreated At: ${new Date(appDetails.createdAt).toLocaleString()}`;
              return { reply: detailsString };
            } catch (fetchError: unknown) {
              const h3Error = fetchError as H3Error;
              if (h3Error.statusCode === 404) {
                console.warn(`Admin Chat: App with ID [${appId}] not found for admin [${adminUid}] (type: 'tool-calls').`);
                return { reply: `Sorry, I couldn't find an application with ID "${appId}". Please check the ID and try again.` };
              }
              const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
              console.error(`Admin Chat: Error fetching app details for ID [${appId}] for admin [${adminUid}] (type: 'tool-calls'):`, errorMessage, fetchError);
              return { reply: `Sorry, I understood you want details for app "${appId}", but I couldn't fetch them right now.` };
            }
          } else if (parsedAiResponse?.tool_use?.name === "generate_application_copy") {
            const params = parsedAiResponse.tool_use.parameters;
            const appId = params?.appId as string | undefined;
            const appDescription = params?.appDescription as string | undefined;
            const targetAudience = params?.targetAudience as string | undefined;
            const tone = params?.tone as string | undefined;
            if (!appId || typeof appId !== 'string' || appId.trim() === '') {
              console.warn(`Admin Chat: AI identified 'generate_application_copy' (type: 'tool-calls') but appId was missing or invalid for admin [${adminUid}]:`, params);
              return { reply: "I understood you want to generate copy for an app, but I couldn't identify which one. Please specify the App ID." };
            }
            try {
              console.log(`Admin Chat: Calling /api/ai/generate-copy for app [${appId}] by admin [${adminUid}] (type: 'tool-calls') with params:`, { appDescription, targetAudience, tone });
              const generatedCopyText = await $fetch<string>('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json', },
                body: { appId: appId.trim(), ...(appDescription && { appDescription }), ...(targetAudience && { targetAudience }), ...(tone && { tone }), },
              });
              if (!generatedCopyText || generatedCopyText.trim() === '') {
                console.warn(`Admin Chat: /api/ai/generate-copy returned empty response for app [${appId}] by admin [${adminUid}] (type: 'tool-calls')`);
                return { reply: `I tried to generate copy for app "${appId}", but it seems I couldn't come up with anything right now.` };
              }
              return { reply: `Generated copy for app ${appId.trim()}: ${generatedCopyText}` };
            } catch (fetchError: unknown) {
              const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
              console.error(`Admin Chat: Error calling /api/ai/generate-copy for app [${appId}] by admin [${adminUid}] (type: 'tool-calls'):`, errorMessage, fetchError);
              const h3Error = fetchError as H3Error;
              if (h3Error.statusCode === 404) {
                 return { reply: `Sorry, I couldn't find an application with ID "${appId}" to generate copy for. Please check the ID.` };
              }
              return { reply: `Sorry, I couldn't generate copy for app "${appId}" at the moment. There was an issue with the generation service.` };
            }
          } else if (parsedAiResponse?.tool_use?.name === "generate_application_logo") {
            const params = parsedAiResponse.tool_use.parameters;
            const appId = params?.appId as string | undefined;
            const stylePrompt = params?.stylePrompt as string | undefined;
            if (!appId || typeof appId !== 'string' || appId.trim() === '') {
              console.warn(`Admin Chat: AI identified 'generate_application_logo' (type: 'tool-calls') but appId was missing or invalid for admin [${adminUid}]:`, params);
              return { reply: "I understood you want to generate a logo for an app, but I couldn't identify which one. Please specify the App ID." };
            }
            try {
              console.log(`Admin Chat: Calling /api/ai/generate-logo for app [${appId}] by admin [${adminUid}] (type: 'tool-calls') with stylePrompt:`, stylePrompt);
              interface GenerateLogoResponse { logoUrl: string; }
              const response = await $fetch<GenerateLogoResponse>('/api/ai/generate-logo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json', },
                body: { appId: appId.trim(), ...(stylePrompt && { stylePrompt }), },
              });
              if (!response || !response.logoUrl) {
                console.warn(`Admin Chat: /api/ai/generate-logo returned invalid response for app [${appId}] by admin [${adminUid}] (type: 'tool-calls')`);
                return { reply: `I tried to generate a logo for app "${appId}", but it seems I couldn't get a valid URL back.` };
              }
              return { reply: `Generated logo for app ${appId.trim()}: ${response.logoUrl}` };
            } catch (fetchError: unknown) {
              const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
              console.error(`Admin Chat: Error calling /api/ai/generate-logo for app [${appId}] by admin [${adminUid}] (type: 'tool-calls'):`, errorMessage, fetchError);
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
              console.warn(`Admin Chat: AI identified 'generate_review_reply' (type: 'tool-calls') but appId or reviewId was missing or invalid for admin [${adminUid}]:`, params);
              return { reply: "I understood you want to generate a review reply, but I couldn't identify the app or review. Please specify both the App ID and Review ID." };
            }
            try {
              interface ReviewDetails { reviewBody: string; rating: number; }
              console.log(`Admin Chat: Fetching review details for review [${reviewId}] of app [${appId}] by admin [${adminUid}] (type: 'tool-calls')`);
              const reviewDetails = await $fetch<ReviewDetails>('/api/reviews/detail', {
                method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }, query: { appId: appId.trim(), reviewId: reviewId.trim() }
              });
              if (!reviewDetails || typeof reviewDetails.reviewBody !== 'string' || typeof reviewDetails.rating !== 'number') {
                console.error(`Admin Chat: Invalid or incomplete review details received for review [${reviewId}], app [${appId}] by admin [${adminUid}] (type: 'tool-calls'):`, reviewDetails);
                return { reply: `Sorry, I couldn't fetch the necessary details for review "${reviewId}". The data might be incomplete.` };
              }
              console.log(`Admin Chat: Calling /api/ai/generate-review-reply for review [${reviewId}] of app [${appId}] by admin [${adminUid}] (type: 'tool-calls')`);
              interface GenerateReviewReplyResponse { suggestion: string; }
              const replyResponse = await $fetch<GenerateReviewReplyResponse>('/api/ai/generate-review-reply', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json', },
                body: { appId: appId.trim(), reviewBody: reviewDetails.reviewBody, rating: reviewDetails.rating, },
              });
              if (!replyResponse || !replyResponse.suggestion) {
                console.warn(`Admin Chat: /api/ai/generate-review-reply returned invalid response for review [${reviewId}], app [${appId}] by admin [${adminUid}] (type: 'tool-calls')`);
                return { reply: `I tried to generate a reply for review "${reviewId}", but it seems I couldn't get a valid suggestion back.` };
              }
              return { reply: `Suggested reply for review ${reviewId.trim()} (app ${appId.trim()}): ${replyResponse.suggestion}` };
            } catch (fetchError: unknown) {
              const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
              const h3Error = fetchError as H3Error;
              if (h3Error.statusCode === 404) {
                 console.warn(`Admin Chat: Could not find review [${reviewId}] for app [${appId}] or the app itself, for admin [${adminUid}] (type: 'tool-calls'). Error:`, errorMessage);
                 return { reply: `Sorry, I couldn't find review "${reviewId}" for app "${appId}". Please check the IDs.` };
              }
              console.error(`Admin Chat: Error in 'generate_review_reply' flow for review [${reviewId}], app [${appId}] by admin [${adminUid}] (type: 'tool-calls'):`, errorMessage, fetchError);
              return { reply: `Sorry, I couldn't generate a reply for review "${reviewId}" at the moment. There was an issue with the process.` };
            }
          } else {
            console.warn(`Admin Chat: AI returned valid JSON but not a recognized tool use for admin [${adminUid}] (type: 'tool-calls'):`, parsedAiResponse);
            return { reply: aiResponseText }; // Return the JSON text as a string reply
          }
        } catch (jsonError) {
          console.error(`Admin Chat: AI response for admin [${adminUid}] (type: 'tool-calls', indicated by SDK) was not valid JSON: "${aiResponseText}"`, jsonError);
          return { reply: "I tried to use a tool, but the response format was incorrect. Please try again." };
        }
      } else {
        // This case: type is 'tool-calls' but toolCalls array is empty or null.
        console.warn(`Admin Chat: AI response type was 'tool-calls' but no toolCalls array found or it's empty for admin [${adminUid}]. Attempting to stream text part if available via readableStream.`);
        if (streamTextResult.readableStream) {
            console.log(`Admin Chat: Streaming direct AI response (type: 'tool-calls' with empty/no toolCalls, fallback to readableStream) for admin [${adminUid}]`);
            setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
            setResponseHeader(event, 'Cache-Control', 'no-cache');
            try {
                return sendStream(event, streamTextResult.readableStream);
            } catch (streamError: unknown) {
                const streamErrorMessage = streamError instanceof Error ? streamError.message : String(streamError);
                console.error(`Admin Chat: Error during sendStream fallback for 'tool-calls' with empty toolCalls for admin [${adminUid}]:`, streamErrorMessage, streamError);
                throw streamError; // Re-throw
            }
        } else {
            const fullResponseForError = await streamTextResult.response; // Await the raw response for logging
            console.error(`Admin Chat: type was 'tool-calls' but no toolCalls and no readableStream for admin [${adminUid}]. Full response object:`, fullResponseForError);
            return { reply: "I received an unusual tool response from the AI that I couldn't process as a tool action or direct text." };
        }
      }
    } else if (streamTextResult.type === 'empty') {
        console.warn(`Admin Chat: AI response for admin [${adminUid}] (type: 'empty'). No content to process.`);
        return { reply: "The AI returned an empty response." };
    } else if (streamTextResult.type === 'error') {
        const errorContent = await streamTextResult.error; // error is a promise
        console.error(`Admin Chat: AI processing resulted in an error (type: 'error') for admin [${adminUid}]. Error:`, errorContent);
        return { reply: "I encountered an error while processing your request with the AI." };
    } else {
      const unknownType = streamTextResult.type; // No 'as any' needed if type is on StreamTextResult
      console.error(`Admin Chat: Unknown or unhandled streamTextResult.type: "${String(unknownType)}" for admin [${adminUid}].`);
      try {
        const finishReason = await streamTextResult.finishReason; // Log finishReason for debugging unknown types
        const rawResponse = await streamTextResult.response;
        console.error(`Admin Chat: Corresponding finishReason: "${finishReason}". Raw response:`, rawResponse, 'Full streamTextResult object:', streamTextResult);
      } catch (frError) {
        console.error('Admin Chat: Error getting finishReason/response for unknown type. Full streamTextResult:', streamTextResult, 'Error:', frError);
      }
      return { reply: "I received an unexpected response type from the AI service." };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Admin Chat: Error processing message with AI for admin [${adminUid}]:`, message, error);
    // Check if it's an error from the AI SDK or a general processing error
    // You might want more specific error handling for AI SDK errors if they have unique properties
    return { reply: "I'm having trouble understanding that request or connecting to the AI service." };
  }
});