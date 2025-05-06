import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { H3Event, H3Error } from 'h3';
import { ReadableStream } from 'node:stream/web'; // For mocking ReadableStream
import type { Mock } from 'vitest';

// Import the handler
import handler from './chat.post';

// Mocked modules
// Firebase Admin
const mockVerifyIdToken = vi.fn();
const mockGetAdminAuth = vi.fn(() => ({
  verifyIdToken: mockVerifyIdToken,
}));
vi.mock('~/server/utils/firebaseAdmin', () => ({
  getAdminAuth: mockGetAdminAuth,
}));

// AI SDK - OpenAI model
const mockOpenaiChat = vi.fn();
vi.mock('@ai-sdk/openai', () => ({
  openai: { chat: mockOpenaiChat },
}));

// AI SDK - streamText
const mockStreamText = vi.fn();
vi.mock('ai', () => ({
  streamText: mockStreamText,
}));

// H3 utilities
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

vi.mock('h3', async (importOriginal: () => Promise<typeof import('h3')>) => {
  const original = await importOriginal();
  return {
    ...original, // Spread original exports
    getHeader: mockH3GetHeader,
    readBody: mockH3ReadBody,
    sendStream: mockH3SendStream,
    setResponseHeader: mockH3SetResponseHeader,
    createError: mockH3CreateError,
  };
});

// Global $fetch
// global.$fetch will be assigned vi.fn() directly later.
// The `declare global` for $fetch has been removed to avoid conflict with Nuxt's global type.
// We will cast the mock specifically during assignment.
const mockDollarFetchImplementation = vi.fn();
// biome-ignore lint/suspicious/noExplicitAny: Mocking a complex global like $fetch often requires this type of casting.
global.$fetch = mockDollarFetchImplementation as any; // Cast to 'any' for the global assignment to bypass strict type checking for $fetch's complex type. The mockDollarFetchImplementation variable itself is still a Vitest mock.


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
    mockOpenaiChat.mockReturnValue({});
    mockStreamText.mockResolvedValue({
      textStream: new ReadableStream({
        start(controller) {
          controller.enqueue('Hello from AI');
          controller.close();
        }
      }),
      toolCalls: Promise.resolve([]),
      text: Promise.resolve('Hello from AI'),
    });
    mockDollarFetchImplementation.mockResolvedValue({});

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


  // --- Streaming Path (Direct AI Text Reply) ---
  describe('Streaming Path (Direct AI Text Reply)', () => {
    it('should stream text response and set correct headers when no tool calls', async () => {
      const mockTextStream = new ReadableStream({
        start(controller) {
          controller.enqueue('This is a streamed AI reply.');
          controller.close();
        }
      });
      mockStreamText.mockResolvedValueOnce({
        textStream: mockTextStream,
        toolCalls: Promise.resolve(null),
        text: Promise.resolve('This is a streamed AI reply.'),
      });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello AI' });
      // mockH3SendStream is configured by createMockEvent to return consumed stream
      
      const result = await handler(mockEvent);

      expect(result).toBe('This is a streamed AI reply.');
      
      expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Content-Type', 'text/plain; charset=utf-8');
      expect(mockH3SetResponseHeader).toHaveBeenCalledWith(mockEvent, 'Cache-Control', 'no-cache');
      expect(mockStreamText).toHaveBeenCalledWith({
        model: expect.anything(),
        system: expect.any(String),
        prompt: 'Hello AI',
      });
    });
  });

  // --- Non-Streaming Path (Tool Use) ---
  describe('Non-Streaming Path (Tool Use)', () => {
    it('list_applications: should call $fetch and return formatted app list', async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        textStream: new ReadableStream({ start(c){ c.enqueue(aiToolCallResponseText); c.close(); } }),
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} }]),
        text: Promise.resolve(aiToolCallResponseText),
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

    it('list_applications: should handle no applications found', async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ apps: [] });

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: 'No applications found.' });
    });
    
    it('list_applications: should handle $fetch error', async () => {
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'list_applications' } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockRejectedValueOnce(new Error('Network error'));

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token-123' }, { message: 'list apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "Sorry, I understood you want to list apps, but I couldn't fetch them at the moment." });
    });

    // get_application_details
    it('get_application_details: should fetch and return app details', async () => {
        const appId = 'app123';
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: { appId } } });
        mockStreamText.mockResolvedValueOnce({
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: { appId } }]),
            text: Promise.resolve(aiToolCallResponseText),
            textStream: new ReadableStream({start(c){c.close()}})
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

    it('get_application_details: should handle missing appId from AI', async () => {
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: {} } });
        mockStreamText.mockResolvedValueOnce({
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: {} }]),
            text: Promise.resolve(aiToolCallResponseText),
            textStream: new ReadableStream({start(c){c.close()}})
        });
        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'details for an app' });
        const result = await handler(mockEvent) as { reply: string };
        expect(result).toEqual({ reply: "I understood you want details for an app, but I couldn't identify which one. Please specify the App ID." });
    });
    
    it('get_application_details: should handle app not found (404)', async () => {
        const appId = 'nonexistent';
        const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'get_application_details', parameters: { appId } } });
        mockStreamText.mockResolvedValueOnce({
            toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'get_application_details', args: { appId } }]),
            text: Promise.resolve(aiToolCallResponseText),
            textStream: new ReadableStream({start(c){c.close()}})
        });
        const fetchError = new Error('Not Found') as H3Error;
        fetchError.statusCode = 404;
        mockDollarFetchImplementation.mockRejectedValueOnce(fetchError);

        mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `details for ${appId}` });
        const result = await handler(mockEvent) as { reply: string };
        expect(result).toEqual({ reply: `Sorry, I couldn't find an application with ID "${appId}". Please check the ID and try again.` });
    });
  });

  // --- AI Service and Other Error Handling ---
  describe('AI Service and Other Errors', () => {
    it('should return error if streamText itself throws', async () => {
      mockStreamText.mockRejectedValueOnce(new Error('AI service unavailable'));
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'Hello' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I'm having trouble understanding that request or connecting to the AI service." });
    });

    it('should handle AI response with toolCalls but invalid JSON text', async () => {
      const invalidJsonText = "{ tool_use: { name: 'list_applications' }";
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'list_applications', args: {} }]),
        text: Promise.resolve(invalidJsonText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'list my apps' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I tried to use a tool, but the response format was incorrect. Please try again." });
    });

    it('should return AI text if JSON is valid but not a recognized tool_use structure', async () => {
      const unknownToolJson = JSON.stringify({ some_other_action: { detail: "do something else" } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'call1', toolName: 'unknown_tool_from_sdk_perspective', args: {} }]),
        text: Promise.resolve(unknownToolJson),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'perform unknown action' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: unknownToolJson });
    });
  });

  // --- generate_application_copy Tests ---
  describe('Tool Use: generate_application_copy', () => {
    const appId = 'appGenCopy1';
    const appDescription = 'Original description';
    const targetAudience = 'Young adults';
    const tone = 'Playful';

    it('should call /api/ai/generate-copy and return generated copy', async () => {
      const aiParams = { appId, appDescription, targetAudience, tone };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: aiParams } });
      const generatedCopy = "This is fresh, playful copy!";

      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockResolvedValueOnce(generatedCopy); // $fetch to /api/ai/generate-copy returns string

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
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: { appDescription } }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: 'generate copy' });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I understood you want to generate copy for an app, but I couldn't identify which one. Please specify the App ID." });
    });

    it('should handle 404 when app not found for generate_application_copy', async () => {
      const aiParams = { appId: 'unknownApp', appDescription };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_copy', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
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
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_copy', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockResolvedValueOnce("  "); // Empty or whitespace string

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate copy for ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `I tried to generate copy for app "${appId}", but it seems I couldn't come up with anything right now.` });
    });
  });

  // --- generate_application_logo Tests ---
  describe('Tool Use: generate_application_logo', () => {
    const appId = 'appGenLogo1';
    const stylePrompt = 'minimalist';

    it('should call /api/ai/generate-logo and return logo URL', async () => {
      const aiParams = { appId, stylePrompt };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_application_logo', parameters: aiParams } });
      const logoUrl = 'https://example.com/logo.png';

      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_logo', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
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
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_application_logo', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ notLogoUrl: 'something' }); // Invalid response

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `generate logo for ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `I tried to generate a logo for app "${appId}", but it seems I couldn't get a valid URL back.` });
    });
  });

  // --- generate_review_reply Tests ---
  describe('Tool Use: generate_review_reply', () => {
    const appId = 'appReviewReply1';
    const reviewId = 'review123';

    it('should fetch review, call /api/ai/generate-review-reply, and return suggestion', async () => {
      const aiParams = { appId, reviewId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      const reviewDetails = { reviewBody: 'Great app!', rating: 5 };
      const suggestedReply = 'Thank you for your positive feedback!';

      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      // First $fetch for review details
      mockDollarFetchImplementation.mockResolvedValueOnce(reviewDetails);
      // Second $fetch for generating reply
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
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: { appId } } }); // Missing reviewId
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: { appId } }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: "I understood you want to generate a review reply, but I couldn't identify the app or review. Please specify both the App ID and Review ID." });
    });

    it('should handle 404 when review details not found', async () => {
      const aiParams = { appId, reviewId: 'unknownReview' };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      const fetchError = new Error('Not Found') as H3Error;
      fetchError.statusCode = 404;
      mockDollarFetchImplementation.mockRejectedValueOnce(fetchError); // For /api/reviews/detail

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review unknownReview for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `Sorry, I couldn't find review "unknownReview" for app "${appId}". Please check the IDs.` });
    });
    
    it('should handle incomplete review details from service', async () => {
      const aiParams = { appId, reviewId };
      const aiToolCallResponseText = JSON.stringify({ tool_use: { name: 'generate_review_reply', parameters: aiParams } });
      mockStreamText.mockResolvedValueOnce({
        toolCalls: Promise.resolve([{ toolCallId: 'tc1', toolName: 'generate_review_reply', args: aiParams }]),
        text: Promise.resolve(aiToolCallResponseText),
        textStream: new ReadableStream({start(c){c.close()}})
      });
      mockDollarFetchImplementation.mockResolvedValueOnce({ reviewBody: 'Only body' }); // Missing rating

      mockEvent = createMockEvent({ 'Authorization': 'Bearer admin-token' }, { message: `reply to review ${reviewId} for app ${appId}` });
      const result = await handler(mockEvent) as { reply: string };
      expect(result).toEqual({ reply: `Sorry, I couldn't fetch the necessary details for review "${reviewId}". The data might be incomplete.` });
    });
  });
});