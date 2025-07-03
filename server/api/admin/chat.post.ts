import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { streamText, tool, type CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getFirestore, type Firestore } from 'firebase-admin/firestore'; // Added for session validation

interface UseChatRequestBody {
  messages: CoreMessage[];
  sessionId: string; // Added sessionId
  message?: string;  // Optional direct message content
  preventUserMessageOptimisticUpdate?: boolean; // Flag to prevent automatic user message addition
  // id?: string;
  // data?: Record<string, string>;
}

const SYSTEM_PROMPT = `You are an expert admin assistant for a software management platform.
You have access to several tools to help users.
- To list all applications, use the "list_applications" tool.
- To get details for a specific application, use the "get_application_details" tool with the application's ID.
- To generate marketing copy for an application, use the "generate_application_copy" tool with the app ID and any relevant context (description, audience, tone).
- To generate a logo for an application, use the "generate_application_logo" tool with the app ID and an optional style prompt.
- To generate a reply for a specific app review, use the "generate_review_reply" tool with the app ID and review ID.
- To list all users, use the "list_users" tool.
For any other general conversation or questions not related to a specific tool, respond naturally.
When a tool is used and you receive its output, use that output to formulate your final response to the user.`;

// Helper type interfaces for tool responses (can be kept for clarity within execute methods)
interface UserBasicInfo { id: string; email?: string; displayName?: string; }
interface ListUsersResponse { users: UserBasicInfo[]; }
interface AppBasicInfo { id: string; name: string; }
interface ListAppsResponse { apps: AppBasicInfo[]; }
interface AppDetails { id: string; name: string; description?: string; createdAt: string; }
interface GenerateLogoResponse { logoUrl: string; }
interface ReviewDetails { reviewBody: string; rating: number; }
interface GenerateReviewReplyResponse { suggestion: string; }


export default defineEventHandler(async (event: H3Event) => {
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt by user: ${decodedToken.uid}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
     const message = error instanceof Error ? error.message : String(error);
     console.error("Error verifying admin token:", message, error);
     if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
        throw error;
     }
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }
  const adminUid = decodedToken.uid;

  let receivedMessages: CoreMessage[];
  let userMessageContentForLog: string;
  let sessionId: string;

  try {
      const requestBody = await readBody<UseChatRequestBody>(event);
      if (!requestBody || !Array.isArray(requestBody.messages) || !requestBody.sessionId) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing "messages" array or "sessionId" in request body' });
      }
      
      // If messages array is empty but direct message is provided (for first messages handling)
      if (requestBody.messages.length === 0 && requestBody.message) {
        console.log(`Adding direct message to empty messages array: "${requestBody.message}"`);
        requestBody.messages.push({
          role: 'user',
          content: requestBody.message
          // Don't add id as CoreUserMessage type doesn't include it
        });
      }
      
      // If direct message is provided and we should add it to existing messages
      if (requestBody.message && !requestBody.preventUserMessageOptimisticUpdate && requestBody.messages.length > 0) {
        // Don't add if the last message is already this user message (prevents duplication)
        const lastMessage = requestBody.messages[requestBody.messages.length - 1];
        if (lastMessage.role !== 'user' || lastMessage.content !== requestBody.message) {
          console.log(`Adding direct message to messages array: "${requestBody.message}"`);
          requestBody.messages.push({
            role: 'user',
            content: requestBody.message
            // Don't add id as CoreUserMessage type doesn't include it
          });
        }
      }
      
      // Ensure we have at least one message after all processing
      if (requestBody.messages.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Empty "messages" array and no "message" provided' });
      }
      
      receivedMessages = requestBody.messages;
      sessionId = requestBody.sessionId;

      // Validate session ownership
      const firestore: Firestore = getFirestore();
      const sessionDocRef = firestore.collection('adminChatSessions').doc(sessionId);
      const sessionDoc = await sessionDocRef.get();

      if (!sessionDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: `Not Found: Session ${sessionId} does not exist.` });
      }
      const sessionData = sessionDoc.data();
      if (sessionData?.adminUid !== adminUid) {
        console.warn(`Forbidden attempt by admin ${adminUid} to use session ${sessionId} owned by ${sessionData?.adminUid}`);
        throw createError({ statusCode: 403, statusMessage: `Forbidden: You do not own session ${sessionId}.` });
      }

      // Find the last message from the user to use for logging.
      // The Vercel AI SDK typically ensures the last message is the user's current input.
      const lastMessage = receivedMessages[receivedMessages.length - 1];
      
      // We expect the last message to be from the user for a new submission.
      // If it's not, or content is invalid, it's a problematic request.
      if (!lastMessage || lastMessage.role !== 'user' || typeof lastMessage.content !== 'string' || lastMessage.content.trim() === '') {
        console.warn("AdminChat: Last message in request was not a valid user message.", lastMessage);
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid or missing user message content in the last message of the array.' });
      }
      userMessageContentForLog = lastMessage.content.trim();
      
  } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error reading or validating request body:", errMessage, error);
      // Re-throw H3Errors, otherwise wrap in a new H3Error
      if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') {
          throw error;
      }
      throw createError({ statusCode: 400, statusMessage: `Bad Request: Could not process request body. ${errMessage}` });
  }
  // userMessageContentForLog is now set for logging.
  // receivedMessages contains the full message history to be passed to the AI.

  // --- Define Tools INSIDE the handler to access idToken via closure ---
  const listApplicationsTool = tool({
    description: 'Lists all applications in the system.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await $fetch<ListAppsResponse>('/api/apps/list', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
        if (response.apps && response.apps.length > 0) {
            // Return a JSON string with count and apps array
            return JSON.stringify({
                count: response.apps.length,
                apps: response.apps.map(app => ({ id: app.id, name: app.name })) // Ensure only id and name are included as per AppBasicInfo
            });
        }
        // Return a JSON string for no applications found
        return JSON.stringify({ count: 0, apps: [] });
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (list_applications): ${m}`, e);
        // Return a JSON string for errors
        return JSON.stringify({ error: `Error listing applications: ${m}` });
      }
    }
  });

  const getApplicationDetailsTool = tool({
    description: 'Gets detailed information for a specific application.',
    parameters: z.object({
      appId: z.string().describe('The ID of the application to get details for.'),
    }),
    execute: async ({ appId }) => {
      try {
        if (!appId) { return "App ID missing for get_application_details."; }
        const appDetails = await $fetch<AppDetails>(`/api/apps/${appId.trim()}`, { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
        let r = `Details for App ${appDetails.name} (ID: ${appDetails.id}):`;
        if (appDetails.description) r += `\nDescription: ${appDetails.description}`;
        r += `\nCreated: ${new Date(appDetails.createdAt).toLocaleString()}`;
        return r;
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (get_application_details for ${appId}): ${m}`, e);
        return `Error getting details for app ${appId}: ${m}`;
      }
    }
  });

  const generateApplicationCopyTool = tool({
    description: 'Generates marketing copy for an application.',
    parameters: z.object({
      appId: z.string().describe('The ID of the application.'),
      appDescription: z.string().optional().describe('Current description of the app (optional).'),
      targetAudience: z.string().optional().describe('Target audience for the copy (optional).'),
      tone: z.string().optional().describe('Desired tone for the copy (e.g., playful, professional) (optional).'),
    }),
    execute: async ({ appId, appDescription, targetAudience, tone }) => {
      try {
        if (!appId) { return "App ID missing for generate_application_copy."; }
        const b: Record<string, unknown> = { appId: appId.trim() };
        if (appDescription) b.appDescription = appDescription;
        if (targetAudience) b.targetAudience = targetAudience;
        if (tone) b.tone = tone;
        const copy = await $fetch<string>('/api/ai/generate-copy', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
        if (!copy) { return `Generated empty copy for ${appId}.`;}
        return `Generated copy for app ${appId.trim()}: ${copy}`;
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (generate_application_copy for ${appId}): ${m}`, e);
        return `Error generating copy for app ${appId}: ${m}`;
      }
    }
  });

  const generateApplicationLogoTool = tool({
    description: 'Generates a logo for an application.',
    parameters: z.object({
      appId: z.string().describe('The ID of the application.'),
      stylePrompt: z.string().optional().describe('A prompt describing the desired style of the logo (e.g., minimalist, vibrant) (optional).'),
    }),
    execute: async ({ appId, stylePrompt }) => {
      try {
        if (!appId) { return "App ID missing for generate_application_logo."; }
        const b: Record<string, unknown> = { appId: appId.trim() };
        if (stylePrompt) b.stylePrompt = stylePrompt;
        const resp = await $fetch<GenerateLogoResponse>('/api/ai/generate-logo', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
        if (!resp?.logoUrl) { return `Failed to get logo URL for ${appId}.`;}
        return `Generated logo for app ${appId.trim()}: ${resp.logoUrl}`;
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (generate_application_logo for ${appId}): ${m}`, e);
        return `Error generating logo for app ${appId}: ${m}`;
      }
    }
  });

  const generateReviewReplyTool = tool({
    description: 'Generates a reply for a specific app review.',
    parameters: z.object({
      appId: z.string().describe('The ID of the application the review belongs to.'),
      reviewId: z.string().describe('The ID of the review to reply to.'),
    }),
    execute: async ({ appId, reviewId }) => {
      try {
        if (!appId || !reviewId) { return "App/Review ID missing for generate_review_reply."; }
        const details = await $fetch<ReviewDetails>('/api/reviews/detail', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}`}, query: { appId: appId.trim(), reviewId: reviewId.trim() }});
        if (!details?.reviewBody) { return `Could not get details for review ${reviewId}.`;}
        
        const b = { appId: appId.trim(), reviewBody: details.reviewBody, rating: details.rating };
        const sugg = await $fetch<GenerateReviewReplyResponse>('/api/ai/generate-review-reply', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
        if (!sugg?.suggestion) { return `Failed to generate suggestion for review ${reviewId}.`;}
        return `Suggested reply for review ${reviewId.trim()}: ${sugg.suggestion}`;
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (generate_review_reply for app ${appId}, review ${reviewId}): ${m}`, e);
        return `Error generating review reply for review ${reviewId}: ${m}`;
      }
    }
  });

  const listUsersTool = tool({
    description: 'Lists all users in the system.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await $fetch<ListUsersResponse>('/api/users/list', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
        if (response.users && response.users.length > 0) {
            const userDescriptions = response.users.map(user => { let d = `ID: ${user.id}`; if (user.email) d+=`, Email: ${user.email}`; if (user.displayName) d+=`, Name: ${user.displayName}`; return d; }).join('\n- ');
            return `Found ${response.users.length} users:\n- ${userDescriptions}`;
        }
        return "No users found.";
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        console.error(`Tool Error (list_users): ${m}`, e);
        return `Error listing users: ${m}`;
      }
    }
  });

  const allToolsWithAuth = {
    list_applications: listApplicationsTool,
    get_application_details: getApplicationDetailsTool,
    generate_application_copy: generateApplicationCopyTool,
    generate_application_logo: generateApplicationLogoTool,
    generate_review_reply: generateReviewReplyTool,
    list_users: listUsersTool,
  };
  // --- End Tool Definitions ---

  try {
    console.log(`Admin Chat: Received message for session [${sessionId}] from admin [${adminUid}]: "${userMessageContentForLog}"`);
    console.log(`Admin Chat DEBUG: Request body messages count: ${receivedMessages.length}, first message:`, JSON.stringify(receivedMessages[0]));

    // The `receivedMessages` variable now holds the full message history from the client,
    // which is what `streamText` expects.
    // No need to reconstruct the messages array here if `receivedMessages` is already in the correct format.
    // The Vercel AI SDK's `useChat` hook sends the messages in the `CoreMessage[]` format.
    const messagesToAI: CoreMessage[] = receivedMessages;
    
    console.log(`Admin Chat DEBUG: Prepared ${messagesToAI.length} messages for AI`);
    
    // Ensure `messagesToAI` is what's passed to streamText below.
    // The old logic of just passing the last user message is incorrect for maintaining context.
    
    // If you were to maintain history, you'd fetch it and prepend here.
    // For example, if `body.history` was an array of CoreMessage:
    // const messages: CoreMessage[] = [...body.history, { role: 'user', content: userMessageContent }];

    const result = await streamText({
      model: openai.chat('gpt-4-turbo'), // Consider making model configurable
      system: SYSTEM_PROMPT,
      messages: messagesToAI, // Pass the full message history
      tools: allToolsWithAuth,
      maxSteps: 1000,
      toolChoice: 'auto',
    });

    console.log("Admin Chat DEBUG: AI stream processing complete, preparing response");

    // The key issue: We need to return a proper Response object, not just the raw stream
    // This ensures the client receives the stream in the format expected by useChat
    // Convert the Vercel AI SDK stream to a Response object with the proper headers
    return new Response(result.toDataStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Admin Chat: Error during AI stream processing for admin [${adminUid}]:`, message, error);
    
    // If error happens before stream response is initiated, throw standard H3 error
    if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') {
        throw error; // Re-throw if it's already an H3Error or similar
    }
    // For other errors, return a generic 500
    throw createError({ statusCode: 500, statusMessage: "Service unavailable or internal server error during chat processing." });
  }
});