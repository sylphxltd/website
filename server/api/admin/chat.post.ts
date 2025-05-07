import type { H3Event } from 'h3';
import { sendStream, setResponseHeader } from 'h3'; 
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { H3Error } from 'h3';
import { streamText, type StreamTextResult } from 'ai';
import { openai } from '@ai-sdk/openai';

interface ChatRequestBody {
  message: string;
}

interface ToolUseIntent {
  tool_use: {
    name: string;
    parameters?: Record<string, unknown>; 
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

You can also list users.
If the user asks to see all users, for example "show me all users" or "list users",
you should respond with:
{ "tool_use": { "name": "list_users" } }

For any other general conversation or questions not related to a specific tool, respond naturally.`;

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
     console.error("Error verifying admin token:", message);
     if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
        throw error; 
     }
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }
  const adminUid = decodedToken.uid;
  let body: ChatRequestBody;
  try {
      body = await readBody<ChatRequestBody>(event);
      if (!body || typeof body.message !== 'string' || body.message.trim() === '') {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid "message" in request body' });
      }
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error reading or validating request body:", message);
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 400) {
          throw error; 
      }
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Could not process request body' });
  }
  const userMessage = body.message.trim();

  try {
    console.log(`Admin Chat: Received message from admin [${adminUid}]: "${userMessage}"`);

    const streamTextResult = await streamText({
      model: openai.chat('gpt-4-turbo'),
      system: SYSTEM_PROMPT,
      prompt: userMessage,
    });

    // Set headers for streaming
    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    setResponseHeader(event, 'Cache-Control', 'no-cache');
    setResponseHeader(event, 'Connection', 'keep-alive'); // Optional, but good for streaming

    let fullResponseText = "";
    let streamError: unknown | undefined;

    for await (const part of streamTextResult.fullStream) {
      if (part.type === 'text-delta') {
        if (part.textDelta) {
          event.node.res.write(part.textDelta); // Send chunk immediately
          fullResponseText += part.textDelta;
        }
      } else if (part.type === 'error') {
        console.error(`Admin Chat: Error part in stream for admin [${adminUid}]:`, part.error);
        streamError = part.error;
        // End the response prematurely if an error part is encountered in the stream
        if (!event.node.res.writableEnded) {
          event.node.res.end();
        }
        break; // Stop processing further parts
      }
      // 'tool-call' and 'tool-result' parts are not explicitly handled here yet,
      // as we are first focusing on text streaming and then parsing fullResponseText for tool intents.
      // Proper handling will come with Phase 2 (SDK tools).
    }

    if (!event.node.res.writableEnded) {
      event.node.res.end(); // Ensure stream is closed if not already by an error
    }
    
    // After streaming all text parts (or erroring out):
    if (streamError) {
        // The error was already logged, and response stream ended.
        // No further action needed here as we can't send a JSON error if stream already started.
        return; 
    }

    const finishReason = await streamTextResult.finishReason;
    console.log(`Admin Chat: Stream finished for admin [${adminUid}]. Reason: ${finishReason}. Full text accumulated: "${fullResponseText}"`);

    // Now, attempt to parse the accumulated fullResponseText for our custom tool call JSON.
    // This happens *after* the text (which might be the JSON itself) has been streamed to the client.
    if (fullResponseText.trim().startsWith('{"tool_use":')) {
      console.log(`Admin Chat: Detected potential tool call in accumulated text for admin [${adminUid}].`);
      try {
        const parsedAiResponse = JSON.parse(fullResponseText.trim()) as ToolUseIntent;
        
        // IMPORTANT: At this point, the client has already received the raw JSON as a stream.
        // The following tool execution will happen, but the server cannot send a *new* separate response
        // for the tool result in this same HTTP request if it was already a streaming response.
        // This part of the logic needs to be re-thought for proper tool result handling.
        // For now, it will execute the tool, but the result won't be sent back in this request.
        // This is a known limitation of this interim step. Phase 2 will fix this.

        let toolExecutionResultReply: string | undefined;

        if (parsedAiResponse?.tool_use?.name === "list_applications") {
          try {
            const response = await $fetch<ListAppsResponse>('/api/apps/list', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
            if (response.apps && response.apps.length > 0) {
              const appNames = response.apps.map(app => `${app.name} (ID: ${app.id})`).join(', ');
              toolExecutionResultReply = `Found ${response.apps.length} apps: ${appNames}.`;
            } else { toolExecutionResultReply = "No applications found."; }
          } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err list_applications: ${m}`); toolExecutionResultReply = `Error listing applications: ${m}`;}
        
        } else if (parsedAiResponse?.tool_use?.name === "get_application_details") {
          const appId = parsedAiResponse.tool_use.parameters?.appId as string | undefined;
          if (!appId) { toolExecutionResultReply = "App ID missing for get_application_details."; }
          else {
            try {
              const appDetails = await $fetch<AppDetails>(`/api/apps/${appId.trim()}`, { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
              let r = `Details for App ${appDetails.name} (ID: ${appDetails.id}):`;
              if (appDetails.description) r += `\nDesc: ${appDetails.description}`;
              r += `\nCreated: ${new Date(appDetails.createdAt).toLocaleString()}`; toolExecutionResultReply = r;
            } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err get_app_details: ${m}`); toolExecutionResultReply = `Error getting app details for ${appId}: ${m}`;}
          }
        } else if (parsedAiResponse?.tool_use?.name === "generate_application_copy") {
          const p = parsedAiResponse.tool_use.parameters; const appId = p?.appId as string | undefined;
          if (!appId) { toolExecutionResultReply = "App ID missing for generate_application_copy."; }
          else {
            try {
              const b: Record<string, unknown> = { appId: appId.trim() };
              if (p?.appDescription) b.appDescription = p.appDescription as string;
              if (p?.targetAudience) b.targetAudience = p.targetAudience as string;
              if (p?.tone) b.tone = p.tone as string;
              const copy = await $fetch<string>('/api/ai/generate-copy', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
              if (!copy) { toolExecutionResultReply = `Generated empty copy for ${appId}.`;}
              else { toolExecutionResultReply = `Generated copy for app ${appId.trim()}: ${copy}`; }
            } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err gen_copy: ${m}`); toolExecutionResultReply = `Error generating copy for ${appId}: ${m}`;}
          }
        } else if (parsedAiResponse?.tool_use?.name === "generate_application_logo") {
          const p = parsedAiResponse.tool_use.parameters; const appId = p?.appId as string | undefined;
          if (!appId) { toolExecutionResultReply = "App ID missing for generate_application_logo."; }
          else {
            try {
              const b: Record<string, unknown> = { appId: appId.trim() };
              if (p?.stylePrompt) b.stylePrompt = p.stylePrompt as string;
              const resp = await $fetch<GenerateLogoResponse>('/api/ai/generate-logo', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
              if (!resp?.logoUrl) { toolExecutionResultReply = `Failed to get logo URL for ${appId}.`;}
              else { toolExecutionResultReply = `Generated logo for app ${appId.trim()}: ${resp.logoUrl}`; }
            } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err gen_logo: ${m}`); toolExecutionResultReply = `Error generating logo for ${appId}: ${m}`;}
          }
        } else if (parsedAiResponse?.tool_use?.name === "generate_review_reply") {
          const p = parsedAiResponse.tool_use.parameters; const appId = p?.appId as string | undefined; const reviewId = p?.reviewId as string | undefined;
          if (!appId || !reviewId) { toolExecutionResultReply = "App/Review ID missing for generate_review_reply."; }
          else {
            try {
              const details = await $fetch<ReviewDetails>('/api/reviews/detail', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}`}, query: { appId: appId.trim(), reviewId: reviewId.trim() }});
              if (!details?.reviewBody) { toolExecutionResultReply = `Could not get details for review ${reviewId}.`;}
              else {
                const b = { appId: appId.trim(), reviewBody: details.reviewBody, rating: details.rating };
                const sugg = await $fetch<GenerateReviewReplyResponse>('/api/ai/generate-review-reply', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json'}, body: b });
                if (!sugg?.suggestion) { toolExecutionResultReply = `Failed to generate suggestion for review ${reviewId}.`;}
                else { toolExecutionResultReply = `Suggested reply for review ${reviewId.trim()}: ${sugg.suggestion}`; }
              }
            } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err gen_review_reply: ${m}`); toolExecutionResultReply = `Error generating review reply for ${reviewId}: ${m}`;}
          }
        } else if (parsedAiResponse?.tool_use?.name === "list_users") {
          try {
            const response = await $fetch<ListUsersResponse>('/api/users/list', { method: 'GET', headers: { 'Authorization': `Bearer ${idToken}` }});
            if (response.users && response.users.length > 0) {
              const userDescriptions = response.users.map(user => { let d = `ID: ${user.id}`; if (user.email) d+=`, Email: ${user.email}`; if (user.displayName) d+=`, Name: ${user.displayName}`; return d; }).join('\n- ');
              toolExecutionResultReply = `Found ${response.users.length} users:\n- ${userDescriptions}`;
            } else { toolExecutionResultReply = "No users found."; }
          } catch (e) { const m = e instanceof Error ? e.message : String(e); console.error(`Err list_users: ${m}`); toolExecutionResultReply = `Error listing users: ${m}`;}
        } else {
          console.warn(`Admin Chat: AI returned tool JSON but not a recognized tool use for admin [${adminUid}]:`, parsedAiResponse);
          // No specific action if tool name is not recognized after streaming.
        }
        
        if (toolExecutionResultReply) {
            console.log(`Admin Chat: Tool [${parsedAiResponse?.tool_use?.name}] executed. Result (not sent in this stream): ${toolExecutionResultReply}`);
            // How to send this back to the client is the next challenge.
            // For now, it's just logged. Client would need to make a new request or use WebSockets.
        }

      } catch (jsonError) {
        console.error(`Admin Chat: Accumulated text for admin [${adminUid}] looked like a tool call but was not valid JSON: "${fullResponseText.trim()}"`, jsonError);
        // No action, as text was already streamed.
      }
    } else if (finishReason === 'error') {
        // Error already handled during stream iteration if streamError was set.
        // If streamError was not set, log the full text which might contain error.
        if(!streamError) {
             console.error(`Admin Chat: AI processing finished with error (finishReason: 'error') for admin [${adminUid}]. Full text: "${fullResponseText}"`);
        }
    } else if (finishReason !== 'stop' && finishReason !== 'tool-calls') { // length, content-filter, other
         console.warn(`Admin Chat: AI response finished due to '${finishReason}' for admin [${adminUid}]. Full text streamed: "${fullResponseText}"`);
    }
    // The response stream to the client has already been ended by this point.
    return; 

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Admin Chat: Outer error processing message with AI for admin [${adminUid}]:`, message, error);
    // If stream hasn't started or headers not sent, can send a JSON error
    if (!event.node.res.headersSent) {
      return createError({ statusCode: 500, statusMessage: "I'm having trouble understanding that request or connecting to the AI service." });
    }
    // If headers were sent but stream not ended (e.g. outer catch after stream started but before normal end)
    if (!event.node.res.writableEnded) {
      // Try to write an error message if stream is still open, then end it.
      event.node.res.write("\n[Error processing your request]");
      event.node.res.end();
    }
    // Otherwise, error is logged, stream might have ended abruptly.
  }
});