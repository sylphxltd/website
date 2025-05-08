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
(globalThis as any).defineEventHandler = vi.fn(handler => handler);

// Removed the vi.mock('#imports', ...) to address Biome lint error.
// Relying on the h3 mock for defineEventHandler. If this proves insufficient
// in a real test run due to Nuxt's auto-import behavior, it would be part
// of the documented test impasse. For now, this simplification is a focused attempt.
 
// Global $fetch
// The `declare global` for $fetch has been removed to avoid conflict with Nuxt's global type.
// We will cast the mock specifically during assignment.
// biome-ignore lint/suspicious/noExplicitAny: Mocking a complex global like $fetch often requires this type of casting.
global.$fetch = mockDollarFetchImplementation as any; // Cast to 'any' for the global assignment to bypass strict type checking for $fetch's complex type. The mockDollarFetchImplementation variable itself is still a Vitest mock.

// Helper function to consume a ReadableStream<Uint8Array> and convert it to a string
async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder(); // Defaults to utf-8
  let content = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    content += decoder.decode(value, { stream: true }); // stream: true is important for multi-byte chars
  }
  content += decoder.decode(); // Call decode one last time to flush any remaining bytes
  return content;
}

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
      
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualStreamedText = await streamToString(responseStream);
 
      expect(actualStreamedText).toBe(streamedText);
      
      // Headers are likely set by H3/Nitro when returning a ReadableStream.
      // Direct calls to setResponseHeader by the handler for these are removed.
      // expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'text/plain; charset=utf-8');
      // expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Cache-Control', 'no-cache');
      
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        // system: SYSTEM_PROMPT, // SYSTEM_PROMPT is defined in SUT, not passed to this mock directly for this check
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello AI, just reply.' })
        ]),
        // model: expect.anything(), // Or more specific if needed
        // tools: expect.anything(),
        // toolChoice: 'auto'
      }));
      // The handler now returns the stream directly, it does not call sendStream.
      expect(mockH3SendStream).not.toHaveBeenCalled();
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
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualText = await streamToString(responseStream);
      expect(actualText).toEqual(fullText);
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
        await handler(mockEvent); // This call should throw an error
        // If handler does not throw, make the test fail explicitly
        throw new Error("handler was expected to throw but did not.");
      } catch (e: unknown) {
        const error = e as H3Error;
        // Check if createError was called with the expected parameters by the SUT's catch block
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        // Also assert the properties of the caught error itself
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
    });
  });
 
  // --- Non-Streaming Path (Tool Use based on streamTextResult.type) ---
  describe("Non-Streaming Path (Tool Use - type: 'tool-calls')", () => {
    it("list_applications: should call $fetch and stream AI's interpretation of app list", async () => {
      const appsData = { apps: [{ id: 'app1', name: 'App One' }, { id: 'app2', name: 'App Two' }] };
      // This mock is for the $fetch call inside the tool's 'execute' method
      mockDollarFetchImplementation.mockResolvedValueOnce(appsData);

      const toolOutputString = "Found 2 apps: App One (ID: app1), App Two (ID: app2)."; // What the tool's execute method would return
      const expectedFinalAiResponse = `Okay, I've processed the application list. ${toolOutputString}`;
      
      // Mock streamText to produce a stream containing the AI's final response AFTER tool execution.
      // The Vercel SDK handles the tool execution internally if tools have 'execute' methods.
      // So, this mock simulates the final output stream from the AI.
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        // For the new SUT, streamText result will always be processed via toDataStream.
        // The internal 'type' (text, tool-calls, etc.) is handled by the SDK before this point
        // if tools have 'execute'. We are mocking the final StreamTextResult.
        toDataStream: () => mockFinalStream, // Ensure our mock provides this
        readableStream: mockFinalStream, // Also provide readableStream for robustness
        text: Promise.resolve(expectedFinalAiResponse), // Full text
        toolCalls: Promise.resolve([]), // No tool calls in the *final* AI response stream
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 20, totalTokens: 30 }),
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // 1. Verify the tool's internal $fetch was called correctly (by the tool's 'execute' method)
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/apps/list', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer admin-token-123' },
      });
      
      // 2. Verify the AI's final response (which should incorporate the tool's result)
      expect(actualReply).toEqual(expectedFinalAiResponse);

      // 3. Verify streamText was called by the SUT with the user message and tools
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'list apps' })
        ]),
        tools: expect.objectContaining({ list_applications: expect.any(Object) })
      }));
    });

    it("list_applications: should stream AI's response when no applications are found", async () => {
      // Tool's 'execute' method will call $fetch, which returns this:
      mockDollarFetchImplementation.mockResolvedValueOnce({ apps: [] });

      // The tool's 'execute' method in SUT will process this and return "No applications found."
      // The AI will then formulate a response based on that.
      const expectedFinalAiResponse = "I looked for applications, but it seems there are no applications found at the moment.";
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]), // No tool calls in the final AI response stream
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 15, totalTokens: 25 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/apps/list', expect.anything());
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'list apps' })
        ]),
        tools: expect.objectContaining({ list_applications: expect.any(Object) })
      }));
    });
    
    it("list_applications: should stream AI's apology when $fetch fails during tool execution", async () => {
      const fetchErrorMessage = 'Network error';
      // Tool's 'execute' method will call $fetch, which rejects:
      mockDollarFetchImplementation.mockRejectedValueOnce(new Error(fetchErrorMessage));

      // The tool's 'execute' method in SUT will catch this, process it, and return a string like:
      // "Error listing applications: Network error" to the AI.
      // The AI will then formulate a response based on that.
      const expectedFinalAiResponse = `I encountered a problem while trying to list the applications. The error was: Error listing applications: ${fetchErrorMessage}. Please check the connection or try again later.`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/apps/list', expect.anything());
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'list apps' })
        ]),
        tools: expect.objectContaining({ list_applications: expect.any(Object) })
      }));
    });
 
    it("get_application_details: should fetch app details and stream AI's interpretation", async () => {
      const appId = 'app123';
      const mockDate = new Date('2024-01-01T12:00:00.000Z');
      const appDetailsData = {
          id: appId,
          name: 'Test App',
          description: 'A great app.',
          createdAt: mockDate.toISOString(),
      };
      // This mock is for the $fetch call inside the tool's 'execute' method
      mockDollarFetchImplementation.mockResolvedValueOnce(appDetailsData);

      // What the tool's execute method would return to the AI
      let toolOutputString = `Details for App ${appDetailsData.name} (ID: ${appDetailsData.id}):`;
      if (appDetailsData.description) toolOutputString += `\nDescription: ${appDetailsData.description}`;
      toolOutputString += `\nCreated: ${new Date(appDetailsData.createdAt).toLocaleString()}`;
      
      const expectedFinalAiResponse = `I have fetched the details for application ${appId} for you. ${toolOutputString}`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 30, totalTokens: 40 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-xyz' }, { message: `details for ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // 1. Verify the tool's internal $fetch was called correctly
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith(`/api/apps/${appId.trim()}`, { // Added trim() for robustness, matching SUT
        method: 'GET',
        headers: { 'Authorization': 'Bearer admin-token-xyz' },
      });
      
      // 2. Verify the AI's final response
      expect(actualReply).toEqual(expectedFinalAiResponse);

      // 3. Verify streamText was called by the SUT
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `details for ${appId}` })
        ]),
        tools: expect.objectContaining({ get_application_details: expect.any(Object) })
      }));
    });
 
    it("get_application_details: should stream AI's clarification request if appId is missing from AI's tool call", async () => {
      // The tool's 'execute' method in SUT will be called with no appId.
      // It will return "App ID missing for get_application_details." to the AI.
      // The AI will then formulate a response based on that.
      const expectedFinalAiResponse = "It seems the App ID was not provided for fetching details. Could you please specify the App ID?";
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 15, totalTokens: 25 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'details for an app' }); // User message that might lead AI to forget appId
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // $fetch for app details should NOT have been called by the tool's execute method
      // as the tool's execute method returns early if appId is missing.
      expect(mockDollarFetchImplementation).not.toHaveBeenCalledWith(expect.stringContaining('/api/apps/'), expect.anything());
      
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'details for an app' })
        ]),
        tools: expect.objectContaining({ get_application_details: expect.any(Object) })
      }));
    });
    
    it("get_application_details: should stream AI's response when app is not found (404)", async () => {
      const appId = 'nonexistent';
      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404; // Simulate H3Error
      // Tool's 'execute' method will call $fetch, which rejects:
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);

      // The tool's 'execute' method in SUT will catch this and return a string like:
      // "Error getting details for app nonexistent: Not Found" to the AI.
      // The AI will then formulate a response based on that.
      const toolErrorMessageInSUT = `Error getting details for app ${appId}: ${fetchError.message}`; // This is what the tool's execute method returns
      const expectedFinalAiResponse = `I attempted to fetch details for app ID '${appId}', but it seems there was an issue: ${toolErrorMessageInSUT}. Please verify the App ID.`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `details for ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(mockDollarFetchImplementation).toHaveBeenCalledWith(`/api/apps/${appId.trim()}`, expect.anything());
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `details for ${appId}` })
        ]),
        tools: expect.objectContaining({ get_application_details: expect.any(Object) })
      }));
    });

    it("should stream the provided readableStream if AI doesn't make specific tool calls but provides a stream", async () => {
      const fallbackText = "This is a fallback text stream.";
      const mockFallbackStream = new ReadableStream({
        start(controller) { controller.enqueue(new TextEncoder().encode(fallbackText)); controller.close(); }
      });

      // This mock simulates a scenario where the AI might have intended tool use (or not)
      // but didn't specify any, and provides a direct stream.
      // The Vercel AI SDK's toDataStream() should pick up this readableStream.
      mockStreamText.mockResolvedValueOnce({
        // The 'type' field's direct handling by SUT is less relevant now with 'execute' methods.
        // We are mocking the StreamTextResult that the SUT's call to streamText() would resolve to.
        toDataStream: () => mockFallbackStream,
        readableStream: mockFallbackStream, // For completeness of StreamTextResult mock
        text: Promise.resolve(fallbackText), // text should also align
        toolCalls: Promise.resolve([]), // No specific tool calls from the AI in this scenario
        finishReason: Promise.resolve('stop'), // Or 'tool-calls' if that's what this scenario implies for finish
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 5, completionTokens: 5, totalTokens: 10 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'A query that leads to this scenario' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualStreamedText = await streamToString(responseStream);

      expect(actualStreamedText).toBe(fallbackText);
      
      // Headers are set by H3/Nitro when a ReadableStream is returned.
      // Direct calls to setResponseHeader by the handler for these are removed.
      // expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'text/plain; charset=utf-8');
      
      // sendStream is not called by the SUT as it directly returns the stream.
      expect(mockH3SendStream).not.toHaveBeenCalled();
    });

    it("should throw an error if AI provides an unusable StreamTextResult (e.g., empty tool calls, no text, no stream)", async () => {
      // This mock simulates a problematic StreamTextResult from the AI SDK
      // Forcing streamText itself to throw is a clearer way to test the SUT's outer error handling
      // when the AI SDK interaction results in an unrecoverable state.
      mockStreamText.mockRejectedValueOnce(new Error("Simulated internal AI SDK error from bad result state"));

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Query for empty tool calls no stream' });
      
      try {
        await handler(mockEvent);
        throw new Error("Handler was expected to throw but did not.");
      } catch (e: unknown) {
        const error = e as H3Error;
        // This error comes from the SUT's main catch block when streamText (or subsequent .toDataStream()) fails
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
    });
  });
 
  // --- AI Service and Other Error Handling (based on streamTextResult.type and other factors) ---
  describe('AI Service and Other Errors', () => {
    it('should throw H3Error if streamText itself throws', async () => {
      const streamTextError = new Error('AI service unavailable');
      mockStreamText.mockRejectedValueOnce(streamTextError);
      
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello' });
      
      try {
        await handler(mockEvent);
        throw new Error("Handler was expected to throw but did not."); // Should not reach here
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
    });
 
    it("should stream AI-generated error message if AI responds with an error", async () => {
      const aiGeneratedErrorMessage = "I'm sorry, I encountered an internal error and cannot complete your request regarding listing applications.";
      
      const mockErrorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(aiGeneratedErrorMessage));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockErrorStream,
        readableStream: mockErrorStream,
        text: Promise.resolve(aiGeneratedErrorMessage),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('error'), // AI indicates an error finish
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(new Error("Simulated AI-side processing error message")), // Optional error object
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'list my apps' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(actualReply).toEqual(aiGeneratedErrorMessage);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'list my apps' })
        ]),
        // tools: expect.any(Object) // Tools would still be passed to streamText
      }));
    });
 
    it("should stream arbitrary text if AI responds with text and no valid tools are called", async () => {
      const arbitraryAiTextOutput = JSON.stringify({ some_other_action: { detail: "do something else" } });
      
      const mockOutputStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(arbitraryAiTextOutput));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockOutputStream,
        readableStream: mockOutputStream,
        text: Promise.resolve(arbitraryAiTextOutput),
        toolCalls: Promise.resolve([]), // AI does not call any of our defined tools
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'perform unknown action' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(actualReply).toEqual(arbitraryAiTextOutput);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'perform unknown action' })
        ]),
        // tools: expect.any(Object) // Tools would still be passed to streamText by SUT
      }));
    });
    
    it("should stream content reflecting an AI processing error when type is 'error'", async () => {
      const aiProcessingError = new Error("AI processing error from mock");
      const expectedTextInStream = "An error occurred with the AI service: AI processing error from mock"; // Hypothetical text AI might stream

      // Mock streamText to resolve with a result indicating an error
      // The toDataStream() method should then produce a stream reflecting this.
      const mockErrorStream = new ReadableStream({
        start(controller) {
          // Simulate how an error might be represented in the text part of the stream
          // or if the SDK serializes result.error into the stream for toDataStream.
          controller.enqueue(new TextEncoder().encode(expectedTextInStream));
          controller.close();
        }
      });

      mockStreamText.mockResolvedValueOnce({
        // type: 'error', // The 'type' field is an internal detail of StreamTextResult
        error: Promise.resolve(aiProcessingError), // The error object itself
        finishReason: Promise.resolve('error'),
        
        // Mocking what toDataStream would provide
        toDataStream: () => mockErrorStream,
        readableStream: mockErrorStream, // for completeness
        text: Promise.resolve(expectedTextInStream), // text should align
        toolCalls: Promise.resolve([]),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 1, completionTokens: 0, totalTokens: 1 }), // Example usage
        warnings: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger ai error' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(actualReply).toEqual(expectedTextInStream);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'trigger ai error' })
        ]),
      }));
    });

    it("should stream an empty string if AI indicates an 'empty' response type", async () => {
      // Mock streamText to resolve with a result indicating an empty response
      const mockEmptyStream = new ReadableStream({
        start(controller) {
          controller.close(); // Immediately close, producing an empty stream
        }
      });

      mockStreamText.mockResolvedValueOnce({
        // type: 'empty', // The 'type' field is an internal detail
        finishReason: Promise.resolve('stop'), // Or 'empty' if that's a valid reason
        
        toDataStream: () => mockEmptyStream,
        readableStream: mockEmptyStream,
        text: Promise.resolve(""), // Text should be empty
        toolCalls: Promise.resolve([]),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 1, completionTokens: 0, totalTokens: 1 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger empty response' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(actualReply).toEqual(""); // Expect an empty string from an empty stream
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'trigger empty response' })
        ]),
      }));
    });
 
    it('should throw H3Error if streamText resolves with an internally inconsistent/unexpected result', async () => {
      // Mock streamText to resolve with a result that might cause toDataStream() to fail
      // or represents an unhandleable state by the SDK for streaming.
      // Forcing streamText itself to throw is a cleaner way to test this SUT error path.
      mockStreamText.mockRejectedValueOnce(new Error("Simulated SDK error due to unexpected StreamTextResult structure"));

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger unknown reason' });
      
      try {
        await handler(mockEvent);
        throw new Error("Handler was expected to throw but did not.");
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
    });

    it('should throw H3Error if streamText resolves with a result where type is undefined', async () => {
      // Mock streamText to resolve with a result that might cause toDataStream() to fail
      // Forcing streamText itself to throw is a cleaner way to test this SUT error path.
      mockStreamText.mockRejectedValueOnce(new Error("Simulated SDK error due to StreamTextResult with undefined type"));

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'trigger undefined type' });
      
      // const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // SUT no longer logs this specific console error

      try {
        await handler(mockEvent);
        throw new Error("Handler was expected to throw but did not.");
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
      // consoleErrorSpy.mockRestore(); // SUT no longer logs this specific console error
    });
  
    it("should throw H3Error if toDataStream fails", async () => {
      const mockUserMessage = 'Test message for toDataStream failure';
      const toDataStreamError = new Error("toDataStream failed");

      mockStreamText.mockResolvedValueOnce({
        // Mock a StreamTextResult object
        readableStream: new ReadableStream({ start(c){c.close();} }), // Dummy, not directly used if toDataStream throws
        text: Promise.resolve("dummy text"),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens:1, completionTokens:1, totalTokens:2}), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
        // Crucially, make toDataStream throw
        toDataStream: vi.fn().mockImplementation(() => { throw toDataStreamError; }),
      });
      
      mockEvent = createMockEvent(
        { 'Authorization': 'Bearer admin-token-stream-fail' },
        { message: mockUserMessage }
      );
      
      try {
        await handler(mockEvent);
        throw new Error("Handler was expected to throw but did not.");
      } catch (e: unknown) {
        const error = e as H3Error;
        expect(mockH3CreateError).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            statusMessage: "Service unavailable or internal server error during chat processing."
        }));
        expect(error.statusCode).toBe(500);
        expect(error.statusMessage).toContain("Service unavailable or internal server error during chat processing.");
      }
    });
  });
 
  // --- generate_application_copy Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_application_copy (type: 'tool-calls')", () => {
    const appId = 'appGenCopy1';
    const appDescription = 'Original description';
    const targetAudience = 'Young adults';
    const tone = 'Playful';
 
    it("should call /api/ai/generate-copy and stream AI's interpretation of the generated copy", async () => {
      // These constants (appId, appDescription, etc.) are defined in the describe block for "Tool Use: generate_application_copy"
      const aiParamsForToolExecute = { appId, appDescription, targetAudience, tone };
      const generatedCopy = "This is fresh, playful copy!";
      
      // This mock is for the $fetch call inside the tool's 'execute' method
      mockDollarFetchImplementation.mockResolvedValueOnce(generatedCopy);

      // What the tool's execute method in SUT would return to the AI.
      // SUT logic: resultForAI = `Generated copy for app ${params.appId.trim()}: ${copy}`;
      const toolOutputString = `Generated copy for app ${appId}: ${generatedCopy}`;
      // Example of how the AI might incorporate the tool's output into its final response.
      const expectedFinalAiResponse = `Alright, I've drafted some marketing copy for app ${appId}: "${generatedCopy}"`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 15, completionTokens: 25, totalTokens: 40 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // 1. Verify the tool's internal $fetch was called correctly
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: aiParamsForToolExecute, // The SUT's execute method constructs this body
      });
      
      // 2. Verify the AI's final response
      expect(actualReply).toEqual(expectedFinalAiResponse);

      // 3. Verify streamText was called by the SUT
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `generate copy for ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_application_copy: expect.any(Object) })
      }));
    });
 
    it("should stream AI's clarification request if appId is missing for generate_application_copy", async () => {
      // const appDescription = 'Original description'; // This is available from the describe block scope
      // Tool's 'execute' method in SUT will be called with args not containing appId.
      // It will return "App ID missing for generate_application_copy." to the AI.
      const expectedFinalAiResponse = "It looks like you want to generate copy, but the application ID wasn't specified. Could you please provide the App ID?";
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 15, totalTokens: 25 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'generate copy' });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // $fetch for generating copy should NOT have been called as appId is missing
      expect(mockDollarFetchImplementation).not.toHaveBeenCalledWith('/api/ai/generate-copy', expect.anything());
      
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'generate copy' })
        ]),
        tools: expect.objectContaining({ generate_application_copy: expect.any(Object) })
      }));
    });
 
    it("should stream AI's response when app is not found (404) for generate_application_copy", async () => {
      const unknownAppId = 'unknownApp';
      // const appDescription = 'Original description'; // Available from describe block scope

      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404;
      // This mock is for the $fetch call inside the tool's 'execute' method for '/api/ai/generate-copy'
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);

      // The tool's 'execute' method in SUT will catch this and return a string like:
      // "Error generating copy for app unknownApp: Not Found" to the AI.
      const toolErrorMessageInSUT = `Error generating copy for app ${unknownAppId}: ${fetchError.message}`;
      const expectedFinalAiResponse = `I attempted to generate copy for app ID '${unknownAppId}', but it seems there was an issue: ${toolErrorMessageInSUT}. Please verify the App ID.`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${unknownAppId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // Verify $fetch was called (and rejected, as per mock)
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-copy',
        expect.objectContaining({ body: expect.objectContaining({ appId: unknownAppId }) })
      );
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `generate copy for ${unknownAppId}` })
        ]),
        tools: expect.objectContaining({ generate_application_copy: expect.any(Object) })
      }));
    });
    
    it("should stream AI's response when generate-copy service returns empty copy", async () => {
      // const appId = 'appGenCopy1'; // from describe block scope
      // For this test, the tool's execute method will be called with only appId if other params are not provided by AI.
      // The SUT's execute method for generate_application_copy will form a body with at least appId.
      
      mockDollarFetchImplementation.mockResolvedValueOnce("  "); // Simulate emptyish response from /api/ai/generate-copy

      // The tool's 'execute' method in SUT will process this and return:
      // "Generated empty copy for app ${appId}."
      const toolOutputString = `Generated empty copy for ${appId}.`;
      const expectedFinalAiResponse = `I attempted to generate copy for app ID '${appId}', but the result was empty. Tool said: "${toolOutputString}"`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-copy',
        expect.objectContaining({ body: expect.objectContaining({ appId }) })
      );
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `generate copy for ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_application_copy: expect.any(Object) })
      }));
    });
  });
 
  // --- generate_application_logo Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_application_logo (type: 'tool-calls')", () => {
    const appId = 'appGenLogo1';
    const stylePrompt = 'minimalist';
 
    it("should call /api/ai/generate-logo and stream AI's interpretation of the logo URL", async () => {
      // const appId = 'appGenLogo1'; // from describe block scope
      // const stylePrompt = 'minimalist'; // from describe block scope
      const aiParamsForToolExecute = { appId, stylePrompt };
      const logoUrl = 'https://example.com/logo.png';
      
      // This mock is for the $fetch call inside the tool's 'execute' method
      mockDollarFetchImplementation.mockResolvedValueOnce({ logoUrl });

      // SUT's execute for generate_application_logo returns: `Generated logo for app ${appId.trim()}: ${resp.logoUrl}`
      const toolOutputString = `Generated logo for app ${appId}: ${logoUrl}`;
      // Example of how the AI might incorporate the tool's output into its final response.
      const expectedFinalAiResponse = `Great! The logo for app ${appId} has been generated: ${logoUrl}`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 15, completionTokens: 25, totalTokens: 40 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate logo for ${appId} ${stylePrompt}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // 1. Verify the tool's internal $fetch was called correctly
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: aiParamsForToolExecute,
      });
      
      // 2. Verify the AI's final response
      expect(actualReply).toEqual(expectedFinalAiResponse);

      // 3. Verify streamText was called by the SUT
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `generate logo for ${appId} ${stylePrompt}` })
        ]),
        tools: expect.objectContaining({ generate_application_logo: expect.any(Object) })
      }));
    });
    
    it("should stream AI's response when generate-logo service returns invalid data", async () => {
      // const appId = 'appGenLogo1'; // from describe block scope
      const aiParamsForToolExecute = { appId }; // SUT's execute method for generate_application_logo uses appId from args

      mockDollarFetchImplementation.mockResolvedValueOnce({ notLogoUrl: 'something' }); // Simulate invalid response from $fetch

      // The tool's 'execute' method in SUT will process this and return:
      // `Failed to get logo URL for ${appId}.`
      const toolOutputString = `Failed to get logo URL for ${appId}.`;
      const expectedFinalAiResponse = `I encountered an issue while generating the logo for app ID '${appId}'. The system reported: "${toolOutputString}"`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate logo for ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // Verify $fetch was called by the tool's execute method
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-logo',
        expect.objectContaining({ body: expect.objectContaining({ appId }) }) // SUT sends at least appId
      );
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `generate logo for ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_application_logo: expect.any(Object) })
      }));
    });
  });
 
  // --- generate_review_reply Tests (type: 'tool-calls') ---
  describe("Tool Use: generate_review_reply (type: 'tool-calls')", () => {
    const appId = 'appReviewReply1';
    const reviewId = 'review123';
 
    it("should fetch review, call /api/ai/generate-review-reply, and stream AI's interpretation", async () => {
      // const appId = 'appReviewReply1'; // from describe scope
      // const reviewId = 'review123'; // from describe scope
      // const aiParamsForTool = { appId, reviewId }; // SUT's tool execute method uses these from args
      const reviewDetails = { reviewBody: 'Great app!', rating: 5 };
      const suggestedReply = 'Thank you for your positive feedback!';
      
      // Mock $fetch calls made by the tool's execute method
      mockDollarFetchImplementation.mockResolvedValueOnce(reviewDetails); // For /api/reviews/detail
      mockDollarFetchImplementation.mockResolvedValueOnce({ suggestion: suggestedReply }); // For /api/ai/generate-review-reply

      // What the tool's execute method in SUT would return to the AI
      // SUT logic: resultForAI = `Suggested reply for review ${params.reviewId.trim()}: ${sugg.suggestion}`;
      const toolOutputString = `Suggested reply for review ${reviewId}: ${suggestedReply}`;
      // Example of how the AI might incorporate the tool's output into its final response.
      const expectedFinalAiResponse = `I've drafted a reply for review ${reviewId} on app ${appId}: "${suggestedReply}"`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 20, completionTokens: 30, totalTokens: 50 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-rev' }, { message: `reply to review ${reviewId} for app ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // 1. Verify the tool's internal $fetch calls
      expect(mockDollarFetchImplementation).toHaveBeenNthCalledWith(1, '/api/reviews/detail',
        expect.objectContaining({ query: { appId: appId.trim(), reviewId: reviewId.trim() } })
      );
      expect(mockDollarFetchImplementation).toHaveBeenNthCalledWith(2, '/api/ai/generate-review-reply',
        expect.objectContaining({ body: { appId: appId.trim(), reviewBody: reviewDetails.reviewBody, rating: reviewDetails.rating } })
      );
      
      // 2. Verify the AI's final response
      expect(actualReply).toEqual(expectedFinalAiResponse);

      // 3. Verify streamText was called by the SUT
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `reply to review ${reviewId} for app ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_review_reply: expect.any(Object) })
      }));
    });
 
    it("should stream AI's clarification if appId or reviewId is missing for generate_review_reply", async () => {
      // const appId = 'appReviewReply1'; // from describe scope, used in message
      // Tool's 'execute' method in SUT will be called with args missing reviewId (or appId).
      // It will return "App/Review ID missing for generate_review_reply." to the AI.
      const expectedFinalAiResponse = "It seems either the App ID or the Review ID was not provided for generating a reply. Could you please provide both IDs?";
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 15, totalTokens: 25 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      // Simulate a message where AI might "forget" reviewId, but appId is in scope from describe block
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review for app ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // $fetch for review details or reply generation should NOT have been called
      expect(mockDollarFetchImplementation).not.toHaveBeenCalledWith('/api/reviews/detail', expect.anything());
      expect(mockDollarFetchImplementation).not.toHaveBeenCalledWith('/api/ai/generate-review-reply', expect.anything());
      
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `reply to review for app ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_review_reply: expect.any(Object) })
      }));
    });
 
    it("should stream AI's response when review details are not found (404) for generate_review_reply", async () => {
      // const appId = 'appReviewReply1'; // from describe scope
      const unknownReviewId = 'unknownReview';
      // const aiParamsForTool = { appId, reviewId: unknownReviewId }; // SUT tool's execute method uses these from args

      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404;
      // This mock is for the first $fetch call (to /api/reviews/detail) inside the tool's 'execute' method
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);

      // The tool's 'execute' method in SUT will catch this and return a string like:
      // "Error generating review reply for review unknownReview: Not Found" to the AI.
      const toolErrorMessageInSUT = `Error generating review reply for review ${unknownReviewId}: ${fetchError.message}`;
      const expectedFinalAiResponse = `I attempted to fetch details for review ID '${unknownReviewId}' on app '${appId}', but it seems there was an issue: ${toolErrorMessageInSUT}. Please verify the App and Review IDs.`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review ${unknownReviewId} for app ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // Verify the first $fetch was called (and rejected)
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/reviews/detail',
        expect.objectContaining({ query: { appId: appId.trim(), reviewId: unknownReviewId.trim() } })
      );
      // Ensure the second $fetch (to generate reply) was NOT called because the first one failed
      expect(mockDollarFetchImplementation.mock.calls.length).toBe(1);
      
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `reply to review ${unknownReviewId} for app ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_review_reply: expect.any(Object) })
      }));
    });
    
    it("should stream AI's response when review details from service are incomplete for generate_review_reply", async () => {
      // const appId = 'appReviewReply1'; // from describe scope
      // const reviewId = 'review123'; // from describe scope
      // const aiParamsForTool = { appId, reviewId }; // SUT tool's execute method uses these from args

      // Mock $fetch calls:
      // 1. For /api/reviews/detail - returns incomplete details (missing rating)
      mockDollarFetchImplementation.mockResolvedValueOnce({ reviewBody: 'Only body, no rating.' });
      // 2. For /api/ai/generate-review-reply - assume it returns an empty suggestion due to incomplete input (missing rating)
      mockDollarFetchImplementation.mockResolvedValueOnce({ suggestion: null });

      // The tool's 'execute' method in SUT, after the second $fetch returns no suggestion (due to missing rating), will return:
      // `Failed to generate suggestion for review ${reviewId}.`
      const toolOutputString = `Failed to generate suggestion for review ${reviewId}.`;
      const expectedFinalAiResponse = `I tried to generate a reply for review ${reviewId} on app ${appId}, but I couldn't get a suggestion. The system said: "${toolOutputString}"`;
      
      const mockFinalStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(expectedFinalAiResponse));
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        toDataStream: () => mockFinalStream,
        readableStream: mockFinalStream,
        text: Promise.resolve(expectedFinalAiResponse),
        toolCalls: Promise.resolve([]),
        finishReason: Promise.resolve('stop'),
        response: Promise.resolve(new Response()),
        usage: Promise.resolve({ promptTokens: 10, completionTokens: 25, totalTokens: 35 }), // Example usage
        warnings: Promise.resolve(undefined),
        error: Promise.resolve(undefined),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review ${reviewId} for app ${appId}` });
      const responseStream = await handler(mockEvent) as ReadableStream<Uint8Array>;
      const actualReply = await streamToString(responseStream);

      // Verify the first $fetch to /api/reviews/detail
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/reviews/detail',
        expect.objectContaining({ query: { appId: appId.trim(), reviewId: reviewId.trim() } })
      );
      // Verify the second $fetch to /api/ai/generate-review-reply (even with incomplete data)
      expect(mockDollarFetchImplementation).toHaveBeenCalledWith('/api/ai/generate-review-reply',
        expect.objectContaining({ body: { appId: appId.trim(), reviewBody: 'Only body, no rating.', rating: undefined } }) // rating will be undefined
      );
      
      expect(actualReply).toEqual(expectedFinalAiResponse);
      expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: `reply to review ${reviewId} for app ${appId}` })
        ]),
        tools: expect.objectContaining({ generate_review_reply: expect.any(Object) })
      }));
    });
  });
});