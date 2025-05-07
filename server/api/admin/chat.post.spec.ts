import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { H3Event, H3Error } from 'h3';
import { ReadableStream } from 'node:stream/web'; // For mocking ReadableStream
import type { Mock } from 'vitest';

// ALL MOCK CONSTANTS DEFINED FIRST
const mockDecodedIdToken = { uid: 'admin123', admin: true };
const mockVerifyIdToken = vi.fn().mockResolvedValue(mockDecodedIdToken);
const mockGetAdminAuth = vi.fn(() => ({
  auth: () => ({ // This is what admin.auth() returns
    verifyIdToken: mockVerifyIdToken,
  }),
}));
const mockOpenaiChat = vi.fn();
const mockStreamText = vi.fn();
const mockH3GetHeader = vi.fn();
const mockH3ReadBody = vi.fn();
const mockH3SendStream = vi.fn();
const mockH3SetResponseHeader = vi.fn();
const mockH3CreateError = vi.fn().mockImplementation((options: H3Error) => {
    const error = new Error(options.statusMessage || 'H3 Error') as H3Error;
    error.statusCode = options.statusCode;
    error.statusMessage = options.statusMessage;
    error.data = options.data;
    return error;
});
const mockDollarFetchImplementation = vi.fn();
// const mockDefineEventHandler = vi.fn(handler => handler); // Pass-through mock - Will be global
 
 // ALL vi.mock CALLS NEXT
 vi.mock('~/server/utils/firebaseAdmin', () => ({
  getAdminAuth: mockGetAdminAuth,
}));
vi.mock('@ai-sdk/openai', () => ({
  openai: { chat: mockOpenaiChat },
}));
vi.mock('ai', () => ({
  streamText: mockStreamText,
  // If StreamTextResult is used as a type from 'ai', it doesn't need to be mocked here
  // unless it's a class constructor being instantiated.
}));
vi.mock('h3', () => ({
  getHeader: mockH3GetHeader,
  readBody: mockH3ReadBody,
  sendStream: mockH3SendStream,
  setResponseHeader: mockH3SetResponseHeader,
  createError: mockH3CreateError,
  // defineEventHandler: mockDefineEventHandler, // Removed from h3 mock
}));
 
// Attempting to mock defineEventHandler globally as Nuxt might make it available this way.
// biome-ignore lint/suspicious/noGlobalAssign: Test-specific global mock
global.defineEventHandler = vi.fn(handler => handler);

// Removed the vi.mock('#imports', ...) to address Biome lint error.
// Relying on the h3 mock for defineEventHandler. If this proves insufficient
// in a real test run due to Nuxt's auto-import behavior, it would be part
// of the documented test impasse. For now, this simplification is a focused attempt.
 
// Global $fetch
// The `declare global` for $fetch has been removed to avoid conflict with Nuxt's global type.
// We will cast the mock specifically during assignment.
// biome-ignore lint/suspicious/noExplicitAny: Mocking a complex global like $fetch often requires this type of casting.
global.$fetch = mockDollarFetchImplementation as any; // Cast to 'any' for the global assignment to bypass strict type checking for $fetch's complex type. The mockDollarFetchImplementation variable itself is still a Vitest mock.

// THEN THE IMPORTS FOR THE SYSTEM UNDER TEST
// This import MUST come AFTER all vi.mock calls that affect its dependencies.
const handler = (await import('./chat.post')).default;


// Define an interface for our augmented mock event if we add custom properties for spying
interface MockH3Event extends H3Event {
  _mockSetResponseHeaderSpy?: typeof mockH3SetResponseHeader; // Example if we attach spy directly
}


// Helper to create a mock H3Event
const createMockEvent = (headers: Record<string, string>, body?: unknown): MockH3Event => {
  const mockReq = { // Simplified, actual H3 req is more complex
    headers: headers,
  };
  const mockRes = {}; // Simplified, h3 utilities handle most response interactions

  const event = {
    node: {
      req: mockReq,
      res: mockRes,
    },
    context: {},
  } as unknown as MockH3Event;

  // Configure the global h3 mocks for this event instance
  // This ensures that when the handler calls getHeader(event, name), our mock is used
  // and it behaves according to the 'headers' provided for this specific mockEvent.
  mockH3GetHeader.mockImplementation((e: H3Event, name: string) => {
    if (e === event) { // Check if it's the event instance we created
      const lowerName = name.toLowerCase();
      const headerKeys = Object.keys(headers); // headers from createMockEvent argument
      const actualKey = headerKeys.find(k => k.toLowerCase() === lowerName);
      return actualKey ? headers[actualKey] : undefined;
    }
    // Fallback for other event instances if any (should not happen in these tests)
    return undefined;
  });

  mockH3ReadBody.mockImplementation(async (e: H3Event) => {
    if (e === event) {
      if (body === undefined) throw new Error("Mock readBody: body not provided for this test case");
      if (body instanceof Error) throw body;
      return Promise.resolve(body);
    }
    return Promise.resolve(undefined);
  });

  mockH3SendStream.mockImplementation(async (e: H3Event, stream: ReadableStream) => {
    if (e === event) {
      if (stream instanceof ReadableStream) {
        const reader = stream.getReader();
        let resultText = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resultText += (typeof value === 'string' ? value : new TextDecoder().decode(value));
        }
        return resultText;
      }
      // According to H3 types, sendStream returns Promise<void>
      // However, for testing convenience, we are returning the consumed stream.
      // If strict void is needed, this mock should just consume and not return.
      // For now, this helps assert the streamed content.
    }
    // return Promise.resolve(); // Or return Promise.resolve(undefined) for void
  });
  
  return event;
};


describe('POST /api/admin/chat', () => {
  let mockEvent: MockH3Event;

  beforeEach(() => {
    vi.resetAllMocks();

    mockVerifyIdToken.mockResolvedValue({ uid: 'admin123', admin: true });
    mockOpenaiChat.mockReturnValue({}); // Default mock for openai.chat
    // Default mock for streamText - simulates a direct text response
    mockStreamText.mockResolvedValue({
      type: 'text', // Default to text type based on new logic
      readableStream: new ReadableStream({ // Corresponds to readableStream for type: 'text'
        start(controller) {
          controller.enqueue('Default mock AI response');
          controller.close();
        }
      }),
      toolCalls: Promise.resolve([]), // For type: 'text', toolCalls might be an empty array or promise to it
      text: Promise.resolve('Default mock AI response'), // For type: 'text', text might be the full text
      finishReason: Promise.resolve('stop'), // finishReason is still relevant for completion status
      response: Promise.resolve(new Response()),
      usage: Promise.resolve({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }),
      warnings: Promise.resolve(undefined),
      error: Promise.resolve(undefined), // For type: 'error'
    });
    mockDollarFetchImplementation.mockResolvedValue({}); // Default for $fetch

    // Ensure H3 mocks are reset and configured with default behavior for each test
    // This is important because createMockEvent reconfigures them based on its arguments.
    mockH3GetHeader.mockReset();
    mockH3ReadBody.mockReset();
    mockH3SendStream.mockReset();
    mockH3SetResponseHeader.mockReset();
    mockH3CreateError.mockImplementation((options: H3Error) => {
        const error = new Error(options.statusMessage || 'H3 Error') as H3Error;
        error.statusCode = options.statusCode;
        error.statusMessage = options.statusMessage;
        error.data = options.data;
        return error;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Authentication and Authorization Tests ---
  describe('Authentication & Authorization', () => {
    it('should return 401 if Authorization header is missing', async () => {
      mockEvent = createMockEvent({}, { message: 'Test' });
      // mockH3GetHeader is configured by createMockEvent to return undefined for missing headers
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(401);
        expect(error.statusMessage).toContain('Missing Bearer token');
      }
    });

    it('should return 401 if Authorization header does not start with Bearer', async () => {
      mockEvent = createMockEvent({ 'Authorization': 'Invalid token' }, { message: 'Test' });
      // createMockEvent configures mockH3GetHeader
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(401);
        expect(error.statusMessage).toContain('Missing Bearer token');
      }
    });

    it('should return 401 if token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Verification failed'));
      mockEvent = createMockEvent({ 'Authorization': 'Bearer invalid-token' }, { message: 'Test' });
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(401);
        expect(error.statusMessage).toContain('Invalid or expired token');
      }
    });

    it('should return 403 if user is not an admin', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user123', admin: false });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer valid-user-token' }, { message: 'Test' });
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(403);
        expect(error.statusMessage).toContain('User is not an admin');
      }
    });

     it('should re-throw 403 if verifyIdToken throws a 403 H3Error', async () => {
      const forbiddenError = new Error('Forbidden by mock') as H3Error;
      forbiddenError.statusCode = 403;
      forbiddenError.statusMessage = 'Forbidden: User is not an admin';
      mockVerifyIdToken.mockRejectedValueOnce(forbiddenError);
      mockEvent = createMockEvent({ 'Authorization': 'Bearer some-token' }, { message: 'Test' });
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(403);
        expect(error.statusMessage).toBe('Forbidden: User is not an admin');
      }
    });
  });

  // --- Request Body Validation Tests ---
  describe('Request Body Validation', () => {
    it('should return 400 if request body is missing message', async () => {
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, {});
      // createMockEvent configures mockH3ReadBody to return the body object
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(400);
        expect(error.statusMessage).toContain('Missing or invalid "message"');
      }
    });

    it('should return 400 if message is an empty string', async () => {
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: '  ' });
      try {
        await handler(mockEvent);
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(error.statusCode).toBe(400);
        expect(error.statusMessage).toContain('Missing or invalid "message"');
      }
    });

    it('should return 400 if readBody throws a non-H3Error', async () => {
        // For this test, we need readBody to throw a generic error
        mockH3ReadBody.mockRejectedValueOnce(new Error("Malformed JSON"));
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, undefined); // Body arg to createMockEvent is not used by this specific mockH3ReadBody
        
        try {
            await handler(mockEvent);
        } catch (e: unknown) {
            const error = e as H3Error;
            expect(error.statusCode).toBe(400);
            expect(error.statusMessage).toContain('Could not process request body');
        }
    });

    it('should re-throw 400 if readBody throws a 400 H3Error', async () => {
        const badRequestError = new Error('Bad request by mock') as H3Error;
        badRequestError.statusCode = 400;
        badRequestError.statusMessage = 'Bad Request: Specific validation';
        mockH3ReadBody.mockRejectedValueOnce(badRequestError);
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, undefined);

        try {
            await handler(mockEvent);
        } catch (e: unknown) {
            const error = e as H3Error;
            expect(error.statusCode).toBe(400);
            expect(error.statusMessage).toBe('Bad Request: Specific validation');
        }
    });
  });


  // --- Streaming Path (Direct AI Text Reply based on streamTextResult.type) ---
  describe("Streaming Path (Direct AI Text Reply - type: 'text')", () => {
    it("should stream text response and set correct headers when type is 'text'", async () => {
      const streamedText = "This is a direct AI reply because type is 'text'.";
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(streamedText);
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        type: 'text',
        readableStream: mockReadableStream,
        toolCalls: Promise.resolve([]),
        text: Promise.resolve(streamedText),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 1, completionTokens: 1, totalTokens: 2 }),
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello AI, just reply.' });
      
      const result = await handler(mockEvent);
 
      expect(result).toBe(streamedText);
      
      expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'text/plain; charset=utf-8');
      expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Cache-Control', 'no-cache');
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        prompt: 'Hello AI, just reply.',
      }));
      expect(mockH3SendStream).toHaveBeenCalledWith(mockEvent, mockReadableStream);
    });

    it("should handle missing readableStream when type is 'text' by returning full text if available", async () => {
      const fullText = "Full text reply as fallback.";
      mockStreamText.mockResolvedValueOnce({
        type: 'text',
        readableStream: undefined, // Simulate missing stream
        toolCalls: Promise.resolve([]),
        text: Promise.resolve(fullText), // Full text is available
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello AI, no stream please.' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: fullText });
      // Ensure sendStream was not called
      expect(mockH3SendStream).not.toHaveBeenCalled();
    });

    it("should throw error if type is 'text' but readableStream and text are unavailable", async () => {
      mockStreamText.mockResolvedValueOnce({
        type: 'text',
        readableStream: undefined,
        toolCalls: Promise.resolve([]),
        text: Promise.resolve(undefined), // No fallback text
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello AI, break everything.' });
      
      try {
        await handler(mockEvent);
      } catch (e: any) {
        // The handler's outer catch block will catch this and return a generic error message.
        // So we expect the final result to be that generic message.
      }
      // Re-run to check the actual returned object due to outer catch.
      const result = await handler(mockEvent);
      expect(result).toEqual({ reply: "I'm having trouble understanding that request or connecting to the AI service." });
    });
  });
 
  // --- Non-Streaming Path (Tool Use based on streamTextResult.type) ---
  describe("Non-Streaming Path (Tool Use - type: 'tool-calls')", () => {
    it("list_applications: should call $fetch and return formatted app list when type is 'tool-calls'", async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        // For 'tool-calls', readableStream might not be primary, but text and toolCalls are.
        readableStream: new ReadableStream({ start(c){ c.enqueue("This stream should not be used directly for tool calls"); c.close(); } }),
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} } as any]), // Cast to any to match untyped streamTextResult
        text: Promise.resolve(aiToolCallResponseText),
        finishReason: Promise.resolve('tool-calls'), // finishReason can still indicate tool usage completion
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 1, completionTokens: 1, totalTokens: 2 }),
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({
        apps: [
          { id: 'app1', name: 'App One' },
          { id: 'app2', name: 'App Two' },
        ],
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const result = await handler(mockEvent) as { reply: string };

      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'list apps' }));
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/apps/list', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer admin-token-123' },
      });
      expect(result).toEqual({ reply: 'Found 2 apps: App One (ID: app1), App Two (ID: app2).' });
    });

    it("list_applications: should handle no applications found (type: 'tool-calls')", async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ apps: [] });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: 'No applications found.' });
    });
    
    it("list_applications: should handle $fetch error (type: 'tool-calls')", async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });
      mockDollarFetchImplementation.mockRejectedValueOnce(new Error('Network error'));
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "Sorry, I understood you want to list apps, but I couldn't fetch them at the moment." });
    });
 
    it("get_application_details: should fetch and return app details (type: 'tool-calls')", async () => {
        const appId = 'app123';
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: { appId } } });
        mockStreamText.mockResolvedValueOnce({
            type: 'tool-calls',
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: { appId } } as any]),
            text: Promise.resolve(aiToolCallResponseText),
            readableStream: new ReadableStream({start(c){c.close()}}),
            finishReason: Promise.resolve('tool-calls'),
            response: Promise.resolve(new Response()),
        });
        const mockDate = new Date('2024-01-01T12:00:00.000Z');
        mockDollarFetchImplementation.mockResolvedValueOnce({
            id: appId,
            name: 'Test App',
            description: 'A great app.',
            createdAt: mockDate.toISOString(),
        });
 
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-xyz' }, { message: `details for ${appId}` });
        const result = await handler(mockEvent) as { reply: string };
        
        expect(mockDollarFetchImplementation).toHaveBeenCalledWith(`/api/apps/${appId}`, expect.anything());
        expect(result.reply).toContain(`Details for App Test App (ID: ${appId})`);
        expect(result.reply).toContain('Description: A great app.');
        expect(result.reply).toContain(`Created At: ${mockDate.toLocaleString()}`);
    });
 
    it("get_application_details: should handle missing appId from AI (type: 'tool-calls')", async () => {
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: {} } });
        mockStreamText.mockResolvedValueOnce({
            type: 'tool-calls',
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: {} }as any]),
            text: Promise.resolve(aiToolCallResponseText),
            readableStream: new ReadableStream({start(c){c.close()}}),
            finishReason: Promise.resolve('tool-calls'),
            response: Promise.resolve(new Response()),
        });
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'details for an app' });
        const result = await handler(mockEvent) as { reply: string };
        expect(result).toEqual({ reply: "I understood you want details for an app, but I couldn't identify which one. Please specify the App ID." });
    });
    
    it("get_application_details: should handle app not found (404) (type: 'tool-calls')", async () => {
        const appId = 'nonexistent';
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: { appId } } });
        mockStreamText.mockResolvedValueOnce({
            type: 'tool-calls',
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: { appId } } as any]),
            text: Promise.resolve(aiToolCallResponseText),
            readableStream: new ReadableStream({start(c){c.close()}}),
            finishReason: Promise.resolve('tool-calls'),
            response: Promise.resolve(new Response()),
        });
        const fetchError = new Error('Not Found') as H3Error;
        fetchError.statusCode = 404;
        mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);
 
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `details for ${appId}` });
        const result = await handler(mockEvent) as { reply: string };
        expect(result).toEqual({ reply: `Sorry, I couldn't find an application with ID "${appId}". Please check the ID and try again.` });
    });

    it("should handle type 'tool-calls' but empty toolCalls array by trying to stream readableStream", async () => {
      const fallbackText = "This is a fallback text stream.";
      const mockFallbackStream = new ReadableStream({
        start(controller) { controller.enqueue(fallbackText); controller.close(); }
      });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([]), // Empty toolCalls
        text: Promise.resolve("Some text that might be present but not primary"),
        readableStream: mockFallbackStream, // Fallback stream is available
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'A query that leads to empty tool calls' });
      const result = await handler(mockEvent);

      expect(result).toBe(fallbackText);
      expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'text/plain; charset=utf-8');
      expect(mockH3SendStream).toHaveBeenCalledWith(mockEvent, mockFallbackStream);
    });

    it("should return error if type 'tool-calls', empty toolCalls, and no readableStream", async () => {
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([]),
        text: Promise.resolve(""),
        readableStream: undefined, // No fallback stream
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Query for empty tool calls no stream' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I received an unusual tool response from the AI that I couldn't process as a tool action or direct text." });
    });
  });
 
  // --- AI Service and Other Error Handling (based on streamTextResult.type and other factors) ---
  describe('AI Service and Other Errors', () => {
    it('should return error if streamText itself throws (before type is available)', async () => {
      mockStreamText.mockRejectedValueOnce(new Error('AI service unavailable'));
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I'm having trouble understanding that request or connecting to the AI service." });
    });
 
    it("should handle AI response with type 'tool-calls' but invalid JSON text", async () => {
      const invalidJsonText = "{ tool_use: { name: 'list_applications' }"; // Malformed JSON
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} } as any]),
        text: Promise.resolve(invalidJsonText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'list my apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I tried to use a tool, but the response format was incorrect. Please try again." });
    });
 
    it("should return AI text if type 'tool-calls' but JSON is not a recognized tool_use structure", async () => {
      const unknownToolJson = JSON.stringify({ some_other_action: { detail: "do something else" } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'unknown_tool_from_sdk_perspective', args: {} } as any]),
        text: Promise.resolve(unknownToolJson),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
        response: Promise.resolve(new Response()),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'perform unknown action' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: unknownToolJson });
    });
    
    it("should handle type 'error'", async () => {
      const aiError = new Error("AI processing error");
      mockStreamText.mockResolvedValueOnce({
        type: 'error',
        error: Promise.resolve(aiError), // error property contains the error
        // Other properties might be undefined or promises resolving to undefined
        readableStream: undefined,
        toolCalls: Promise.resolve(undefined),
        text: Promise.resolve(undefined),
        finishReason: Promise.resolve('error'),
        response: Promise.resolve(new Response()),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger ai error' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I encountered an error while processing your request with the AI." });
    });

    it("should handle type 'empty'", async () => {
      mockStreamText.mockResolvedValueOnce({
        type: 'empty',
        readableStream: undefined,
        toolCalls: Promise.resolve(undefined),
        text: Promise.resolve(undefined),
        finishReason: Promise.resolve('stop'), // Or another appropriate finishReason for empty
        response: Promise.resolve(new Response()),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger empty response' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "The AI returned an empty response." });
    });
 
    it('should handle unexpected streamTextResult.type', async () => {
      mockStreamText.mockResolvedValueOnce({
        type: 'some_unexpected_type_value', // An unknown type
        readableStream: new ReadableStream({start(c){c.close()}}),
        toolCalls: Promise.resolve(null),
        text: Promise.resolve("Text for unexpected reason"),
        finishReason: Promise.resolve('other'),
        response: Promise.resolve(new Response()),
      } as any); // Cast to any because 'some_unexpected_type_value' is not a known type
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger unknown reason' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I received an unexpected response type from the AI service." });
    });

    it('should handle streamTextResult.type being undefined', async () => {
      mockStreamText.mockResolvedValueOnce({
        type: undefined, // Explicitly undefined type
        finishReason: Promise.resolve('error_undefined_type'),
        response: Promise.resolve(new Response('mock response body for undefined type', { status: 200 })),
        readableStream: undefined,
        toolCalls: Promise.resolve(undefined),
        text: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
        usage: Promise.resolve({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
        warnings: Promise.resolve(undefined),
      } as any);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger undefined type' });
      const result = await handler(mockEvent) as { reply: string };

      expect(result).toEqual({ reply: "I received an unexpected response type from the AI service." });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin Chat: streamTextResult.type is undefined for admin [admin123].")
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin Chat: Corresponding finishReason: "error_undefined_type"'),
        expect.anything(),
        expect.anything()
      );

      consoleErrorSpy.mockRestore();
    });
  
    it("should handle errors if sendStream fails (when type is 'text')", async () => {
      const mockStreamContent = 'Attempting to stream this.';
      const mockUserMessage = 'Test message for stream failure';
      const mockReadableStreamForError = new ReadableStream({
        start(controller) {
          controller.enqueue(mockStreamContent);
          controller.close();
        }
      });
 
      mockStreamText.mockResolvedValueOnce({
        type: 'text',
        readableStream: mockReadableStreamForError,
        toolCalls: Promise.resolve([]),
        text: Promise.resolve(mockStreamContent),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
      });
 
      mockEvent = createMockEvent(
        { 'Authorization': 'Bearer admin-token-stream-fail' },
        { message: mockUserMessage }
      );
 
      const simulatedSendStreamError = new Error('Network connection lost during stream');
      mockH3SendStream.mockRejectedValueOnce(simulatedSendStreamError);
      
      // The handler's outer catch block will return a generic reply.
      const finalResult = await handler(mockEvent);
      expect(finalResult).toEqual({ reply: "I'm having trouble understanding that request or connecting to the AI service." });
    });
  });
 
  // --- generate_application_copy Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_application_copy (type: 'tool-calls')", () => {
    const appId = 'appGenCopy1';
    const appDescription = 'Original description';
    const targetAudience = 'Young adults';
    const tone = 'Playful';
 
    it('should call /api/ai/generate-copy and return generated copy', async () => {
      const aiParams = { appId, appDescription, targetAudience, tone };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: aiParams } });
      const generatedCopy = "This is fresh, playful copy!";
 
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce(generatedCopy);
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
 
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: { appId, appDescription, targetAudience, tone },
      });
      expect(result).toEqual({ reply: `Generated copy for app ${appId}: ${generatedCopy}` });
    });
 
    it('should handle missing appId for generate_application_copy', async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: { appDescription } } });
       mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: { appDescription } } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'generate copy' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I understood you want to generate copy for an app, but I couldn't identify which one. Please specify the App ID." });
    });
 
    it('should handle 404 when app not found for generate_application_copy', async () => {
      const aiParams = { appId: 'unknownApp', appDescription };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404;
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'generate copy for unknownApp' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `Sorry, I couldn't find an application with ID "unknownApp" to generate copy for. Please check the ID.` });
    });
    
    it('should handle empty response from generate-copy service', async () => {
      const aiParams = { appId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce("  ");
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `I tried to generate copy for app "${appId}", but it seems I couldn't come up with anything right now.` });
    });
  });
 
  // --- generate_application_logo Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_application_logo (type: 'tool-calls')", () => {
    const appId = 'appGenLogo1';
    const stylePrompt = 'minimalist';
 
    it('should call /api/ai/generate-logo and return logo URL', async () => {
      const aiParams = { appId, stylePrompt };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_logo', parameters: aiParams } });
      const logoUrl = 'https://example.com/logo.png';
 
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_logo', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ logoUrl });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate logo for ${appId} ${stylePrompt}` });
      const result = await handler(mockEvent) as { reply: string };
 
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: { appId, stylePrompt },
      });
      expect(result).toEqual({ reply: `Generated logo for app ${appId}: ${logoUrl}` });
    });
    
    it('should handle invalid response from generate-logo service', async () => {
      const aiParams = { appId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_logo', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_logo', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ notLogoUrl: 'something' });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate logo for ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `I tried to generate a logo for app "${appId}", but it seems I couldn't get a valid URL back.` });
    });
  });
 
  // --- generate_review_reply Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_review_reply (type: 'tool-calls')", () => {
    const appId = 'appReviewReply1';
    const reviewId = 'review123';
 
    it('should fetch review, call /api/ai/generate-review-reply, and return suggestion', async () => {
      const aiParams = { appId, reviewId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      const reviewDetails = { reviewBody: 'Great app!', rating: 5 };
      const suggestedReply = 'Thank you for your positive feedback!';
 
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce(reviewDetails);
      mockDollarFetchImplementation.mockResolvedValueOnce({ suggestion: suggestedReply });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-rev' }, { message: `reply to review ${reviewId} for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
 
      expect(mockDollarFetchImplementation).toHaveBeenNthCalledWith(1, '/api/reviews/detail', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer admin-token-rev' },
        query: { appId, reviewId },
      });
      expect(mockDollarFetchImplementation).toHaveBeenNthCalledWith(2, '/api/ai/generate-review-reply', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token-rev', 'Content-Type': 'application/json' },
        body: { appId, reviewBody: reviewDetails.reviewBody, rating: reviewDetails.rating },
      });
      expect(result).toEqual({ reply: `Suggested reply for review ${reviewId} (app ${appId}): ${suggestedReply}` });
    });
 
    it('should handle missing appId or reviewId for generate_review_reply', async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: { appId } } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: { appId } } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I understood you want to generate a review reply, but I couldn't identify the app or review. Please specify both the App ID and Review ID." });
    });
 
    it('should handle 404 when review details not found', async () => {
      const aiParams = { appId, reviewId: 'unknownReview' };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404;
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review unknownReview for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `Sorry, I couldn't find review "unknownReview" for app "${appId}". Please check the IDs.` });
    });
    
    it('should handle incomplete review details from service', async () => {
      const aiParams = { appId, reviewId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        type: 'tool-calls',
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams } as any]),
        text: Promise.resolve(aiToolCallResponseText),
        readableStream: new ReadableStream({start(c){c.close()}}),
        finishReason: Promise.resolve('tool-calls'),
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ reviewBody: 'Only body' });
 
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review ${reviewId} for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `Sorry, I couldn't fetch the necessary details for review "${reviewId}". The data might be incomplete.` });
    });
  });
});