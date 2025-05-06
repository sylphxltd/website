import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount, type VueWrapper, type DOMWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import AdminChat from './AdminChat.vue';

interface Message {
  id: number;
  sender: 'user' | 'ai' | 'error';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

// Mock Firebase Auth
import { getAuth, type Auth } from 'firebase/auth'; // Import normally, vi.mock will handle it

const mockGetIdToken = vi.fn(); // Define a persistent mock for getIdToken

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    getAuth: vi.fn(() => ({ // This is the mock for the getAuth EXPORT
      currentUser: {
        getIdToken: mockGetIdToken, // Use the persistent mock instance
      },
    })),
  };
});

// Mock Toast Store
const mockToastStore = {
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
};
vi.mock('~/stores/toast', () => ({
  useToastStore: () => mockToastStore,
}));

// Global fetch mock
const mockFetch = vi.fn() as Mock;
vi.stubGlobal('fetch', mockFetch);

// Helper to create a mock ReadableStream
function createMockReadableStream(chunks: string[], errorAfterChunk?: number): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let chunkIndex = 0;
  return new ReadableStream({
    async pull(controller) {
      await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async nature & delay

      if (errorAfterChunk !== undefined && chunkIndex >= errorAfterChunk) {
        controller.error(new Error('Simulated stream error'));
        return;
      }
      if (chunkIndex < chunks.length) {
        controller.enqueue(encoder.encode(chunks[chunkIndex]));
        chunkIndex++;
      } else {
        controller.close();
      }
    },
  });
}

describe('AdminChat.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof AdminChat>>;

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockReset();
    mockToastStore.error.mockReset();
    mockToastStore.warning.mockReset();
    mockGetIdToken.mockClear().mockResolvedValue('mock-firebase-token'); // Reset the shared mock
    // Reset the main getAuth mock to its default behavior for most tests
    vi.mocked(getAuth).mockImplementation(() => ({
        currentUser: {
            getIdToken: mockGetIdToken,
        },
    } as unknown as Auth));


    wrapper = mount(AdminChat, {
      global: {
        stubs: {
          // Stub any child components if necessary, though AdminChat is mostly self-contained
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  const findMessageBubbles = () => wrapper.findAll('.messages-area > div > div[class*="inline-block"]');
  const findLastMessageText = () => {
    const bubbles = findMessageBubbles();
    if (bubbles.length === 0) return '';
    return bubbles[bubbles.length - 1].find('span.whitespace-pre-wrap').text();
  };
   const findLastMessageSender = () => {
    const messageElements = wrapper.findAll('.messages-area > div');
    if (messageElements.length === 0) return null;
    const lastMessageDiv = messageElements[messageElements.length - 1];
    if (lastMessageDiv.classes().some((cls: string) => cls.includes('items-end'))) return 'user';
    if (lastMessageDiv.classes().some((cls: string) => cls.includes('items-start'))) {
        const bubble = lastMessageDiv.find('div[class*="inline-block"]');
        if (bubble.classes().some((cls: string) => cls.includes('bg-red-100'))) return 'error';
        return 'ai';
    }
    return null;
  };


  it('renders the chat interface correctly', () => {
    expect(wrapper.find('h3').text()).toBe('Admin Chat');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Send');
    expect(wrapper.find('.resize-handle').exists()).toBe(true);
  });

  it('adds a user message and clears input on send', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ reply: 'AI response' }),
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Hello AI');
    await wrapper.find('button').trigger('click');
    await nextTick(); // Wait for optimistic UI update

    // Assert that a message with sender 'user' and text 'Hello AI' exists
    const userMessages = wrapper.vm.messages.filter((m: Message) => m.sender === 'user');
    expect(userMessages.length).toBeGreaterThan(0);
    expect(userMessages[userMessages.length - 1].text).toBe('Hello AI'); // Check last user message

    expect((input.element as HTMLInputElement).value).toBe(''); // Input cleared

    // Wait for AI response processing if fetch mock is synchronous
    await nextTick(); // For AI message from mock
  });

  it('handles non-streamed JSON AI response', async () => {
    const aiReply = 'This is a JSON AI reply.';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ reply: aiReply }),
    });

    await wrapper.find('input[type="text"]').setValue('Test JSON');
    await wrapper.find('button').trigger('click');

    // Wait for fetch and subsequent UI updates
    await new Promise(resolve => setTimeout(resolve, 50)); // Allow promises to resolve
    await nextTick();
    await nextTick();


    const bubbles = findMessageBubbles();
    expect(bubbles.length).toBeGreaterThanOrEqual(2); // User + AI
    expect(bubbles[bubbles.length - 1].text()).toContain(aiReply);
    expect(bubbles[bubbles.length - 1].classes()).toContain('bg-gray-200'); // AI message style
    expect(wrapper.vm.isSending).toBe(false);
  });

  it('handles streamed text AI response (text/plain)', async () => {
    const streamChunks = ['Hello, ', 'this is ', 'a streamed response.'];
    const fullStreamedResponse = streamChunks.join('');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
      body: createMockReadableStream([...streamChunks]), // Pass a copy
      getReader: () => createMockReadableStream([...streamChunks]).getReader(), // Ensure fresh stream for getReader
    });

    await wrapper.find('input[type="text"]').setValue('Test Stream');
    await wrapper.find('button').trigger('click');
    await nextTick(); // User message added
    
    // Check isStreaming during streaming
    expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].isStreaming).toBe(true);


    // Wait for all stream chunks to be processed
    // This needs to be long enough for the simulated stream delays
    await new Promise(resolve => setTimeout(resolve, streamChunks.length * 20 + 50));
    await nextTick();

    const bubbles = findMessageBubbles();
    expect(bubbles.length).toBeGreaterThanOrEqual(2);
    const aiBubble = bubbles[bubbles.length - 1];
    expect(aiBubble.text()).toContain(fullStreamedResponse);
    expect(aiBubble.classes()).toContain('bg-gray-200');
    expect(wrapper.vm.isSending).toBe(false);
    expect(aiBubble.find('.animate-pulse').exists()).toBe(false); // Streaming indicator should be gone
    // Check isStreaming after streaming
    expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].isStreaming).toBe(false);
  });

   it('handles streamed text AI response (text/event-stream)', async () => {
    const streamChunks = ['Event stream: ', 'chunk 1, ', 'chunk 2.'];
    const fullStreamedResponse = streamChunks.join('');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      body: createMockReadableStream([...streamChunks]),
      getReader: () => createMockReadableStream([...streamChunks]).getReader(),
    });

    await wrapper.find('input[type="text"]').setValue('Test Event Stream');
    await wrapper.find('button').trigger('click');
    await nextTick();

    await new Promise(resolve => setTimeout(resolve, streamChunks.length * 20 + 50));
    await nextTick();

    const bubbles = findMessageBubbles();
    const aiBubble = bubbles[bubbles.length - 1];
    expect(aiBubble.text()).toContain(fullStreamedResponse);
    expect(wrapper.vm.isSending).toBe(false);
  });


  it('displays streaming indicator and removes it after stream ends', async () => {
    const streamChunks = ['Streaming...'];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      body: createMockReadableStream([...streamChunks]),
      getReader: () => createMockReadableStream([...streamChunks]).getReader(),
    });

    await wrapper.find('input[type="text"]').setValue('Test Indicator');
    await wrapper.find('button').trigger('click');
    await nextTick(); // User message + initial AI message shell

    let aiBubble = findMessageBubbles()[findMessageBubbles().length -1];
    expect(aiBubble.find('.animate-pulse').exists()).toBe(true);
    // Check isStreaming during streaming
    expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].isStreaming).toBe(true);


    await new Promise(resolve => setTimeout(resolve, streamChunks.length * 20 + 50));
    await nextTick();
    
    aiBubble = findMessageBubbles()[findMessageBubbles().length -1]; // Re-fetch bubble
    expect(aiBubble.find('.animate-pulse').exists()).toBe(false);
    // Check isStreaming after streaming
    expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].isStreaming).toBe(false);
  });


  it('handles fetch error during send message', async () => {
    const errorMessage = 'Network failed';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    await wrapper.find('input[type="text"]').setValue('Test Error');
    await wrapper.find('button').trigger('click');
    await nextTick(); // User message
    await new Promise(resolve => setTimeout(resolve, 50)); // Allow promises to resolve
    await nextTick(); // Error message

    expect(mockToastStore.error).toHaveBeenCalledWith(`Chat Error: ${errorMessage}`);
    const bubbles = findMessageBubbles();
    const errorBubble = bubbles[bubbles.length - 1];
    expect(errorBubble.text()).toContain(`Error: ${errorMessage}`);
    expect(errorBubble.classes()).toContain('bg-red-100'); // Error message style
    expect(wrapper.vm.isSending).toBe(false);
  });

  it('handles server error (response not ok) with JSON message', async () => {
    const errorResponseMessage = 'Server validation failed';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ message: errorResponseMessage }),
    });

    await wrapper.find('input[type="text"]').setValue('Test Server Error');
    await wrapper.find('button').trigger('click');
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(mockToastStore.error).toHaveBeenCalledWith(`Chat Error: ${errorResponseMessage}`);
    const bubbles = findMessageBubbles();
    const errorBubble = bubbles[bubbles.length - 1];
    expect(errorBubble.text()).toContain(`Error: ${errorResponseMessage}`);
    expect(wrapper.vm.isSending).toBe(false);
  });

  it('handles server error (response not ok) with text message', async () => {
    const errorResponseText = 'Plain text server error';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      json: vi.fn().mockRejectedValueOnce(new Error('Simulated JSON parse error')),
      text: vi.fn().mockResolvedValueOnce(errorResponseText),
    });

    await wrapper.find('input[type="text"]').setValue('Test Text Server Error');
    await wrapper.find('button').trigger('click');
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();
    
    expect(mockToastStore.error).toHaveBeenCalledWith(`Chat Error: ${errorResponseText}`);
    const bubbles = findMessageBubbles();
    const errorBubble = bubbles[bubbles.length - 1];
    expect(errorBubble.text()).toContain(`Error: ${errorResponseText}`);
  });


  it('displays an error if user is not authenticated (getIdToken fails)', async () => {
    // Ensure currentUser exists but getIdToken is the one failing
    mockGetIdToken.mockRejectedValueOnce(new Error('Auth failed'));
    // The global getAuth mock by default returns a currentUser object with mockGetIdToken.
    // We only need to change the behavior of mockGetIdToken for this test.

    await wrapper.find('input[type="text"]').setValue('Test Auth Error');
    await wrapper.find('button').trigger('click');
    await nextTick(); 
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(mockToastStore.error).toHaveBeenCalledWith('Could not authenticate. Please try again.');
    expect(findLastMessageText()).toContain('Failed to get authentication token.');
    expect(findLastMessageSender()).toBe('error');
    expect(wrapper.vm.isSending).toBe(false);
  });

  it('handles message sending attempt when user is not authenticated (currentUser is null)', async () => {
    // If a global wrapper was mounted by beforeEach, unmount it first.
    wrapper?.unmount(); // Biome suggestion: optional chain

    // 1. Configure getAuth for this specific test case BEFORE mounting

    // 1. Configure getAuth for this specific test case BEFORE mounting
    //    This ensures the component initializes with currentUser as null.
    vi.mocked(getAuth).mockImplementationOnce(() => ({
      currentUser: null,
    } as unknown as Auth));

    // 2. Configure fetch mock for this test case to throw if called.
    //    mockFetch is reset in the global beforeEach.
    mockFetch.mockImplementationOnce(() => {
      throw new Error("Fetch should NOT have been called when currentUser is null!");
    });

    // 3. Mount the component specifically for this test
    const localWrapper = mount(AdminChat, {
      global: {
        stubs: {
          // Stub any child components if necessary
        },
      },
    });

    // Local helper functions adapted for localWrapper
    const findLastMessageTextLocal = () => {
      const bubbles = localWrapper.findAll('.messages-area > div > div[class*="inline-block"]');
      if (bubbles.length === 0) return '';
      const textSpan = bubbles[bubbles.length - 1].find('span.whitespace-pre-wrap');
      return textSpan.exists() ? textSpan.text() : bubbles[bubbles.length - 1].text(); // Fallback if span not found but bubble exists
    };
    const findLastMessageSenderLocal = () => {
      const messageElements = localWrapper.findAll('.messages-area > div');
      if (messageElements.length === 0) return null;
      const lastMessageDiv = messageElements[messageElements.length - 1];
      if (lastMessageDiv.classes().some((cls: string) => cls.includes('items-end'))) return 'user'; // Should not happen for error
      if (lastMessageDiv.classes().some((cls: string) => cls.includes('items-start'))) {
        const bubble = lastMessageDiv.find('div[class*="inline-block"]');
        if (bubble.classes().some((cls: string) => cls.includes('bg-red-100'))) return 'error';
        return 'ai'; // Should not happen for this error
      }
      return null;
    };

    try {
      await localWrapper.find('input[type="text"]').setValue('Test auth null');
      await localWrapper.find('button').trigger('click');
      await nextTick(); // Allow component reaction (e.g., adding message to vm.messages)
      // The error message should be added synchronously by the component if currentUser is null
      // No need for new Promise(setTimeout) if the logic is synchronous post-click.
      await nextTick(); // Ensure UI updates with the error message if any part was async

      expect(mockToastStore.error).toHaveBeenCalledWith('You must be logged in to chat.');
      
      const vmMessages = localWrapper.vm.messages;
      expect(vmMessages.length).toBeGreaterThan(0); // Ensure there's at least one message
      const lastVmMessage = vmMessages[vmMessages.length - 1];
      expect(lastVmMessage.text).toBe('Authentication error. Please log in again.');
      expect(lastVmMessage.sender).toBe('error');
      
      // Check UI using local helpers
      expect(findLastMessageTextLocal()).toContain('Authentication error. Please log in again.');
      expect(findLastMessageSenderLocal()).toBe('error');
      
      expect(localWrapper.vm.isSending).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled(); // This assertion is key. If fetch was called, the mockImplementation would throw.
    } finally {
      localWrapper.unmount();
    }
  });


  it('styles user messages correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ reply: 'AI reply' }),
    });
    // Simulate user input and button click
    const input = wrapper.find('input[type="text"]');
    await input.setValue('A styled user message');
    
    const sendButton = wrapper.find('button.bg-blue-600'); // Selector for the send button
    await sendButton.trigger('click');
    
    await nextTick(); // Allow for user message to be added optimistically and DOM update
    await nextTick(); // Allow for AI response processing and further DOM updates if any

    // After UI interaction and nextTick(s), try to find the user message bubble directly.
    // User messages are expected to have 'ml-auto', 'bg-blue-600', and 'text-white'.
    const userMessageBubble = wrapper.find('div.ml-auto.bg-blue-600.text-white');
    expect(userMessageBubble.exists(), 'User message bubble with specific classes (ml-auto bg-blue-600 text-white) should exist').toBe(true);

    // Optional: further class assertions if the bubble is found.
    // These are somewhat redundant if the combined selector works, but confirm individual classes.
    if (userMessageBubble.exists()) {
      expect(userMessageBubble.classes()).toContain('bg-blue-600');
      expect(userMessageBubble.classes()).toContain('text-white');
      expect(userMessageBubble.classes()).toContain('ml-auto');
    }
  });

  it('displays timestamps for messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ reply: 'AI reply for timestamp' }),
    });
    await wrapper.find('input[type="text"]').setValue('Timestamp test');
    await wrapper.find('button').trigger('click');
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    const messageElements = wrapper.findAll('.messages-area > div');
    expect(messageElements.length).toBeGreaterThanOrEqual(2);
    const lastMessageDiv = messageElements[messageElements.length - 1]; // AI message
    const timestampSpan = lastMessageDiv.find('span.text-xs');
    expect(timestampSpan.exists()).toBe(true);
    // Regex for HH:MM format
    expect(timestampSpan.text()).toMatch(/^\d{2}:\d{2}$/);
  });

  // Resizability tests (limited in JSDOM)
  it('has initial dimensions set', () => {
    const container = wrapper.find('.admin-chat-container');
    expect(container.attributes('style')).toContain(`width: ${wrapper.vm.chatWidth}px`);
    expect(container.attributes('style')).toContain(`height: ${wrapper.vm.chatHeight}px`);
  });

  it('resize handle is present', () => {
    expect(wrapper.find('.resize-handle').exists()).toBe(true);
  });

  // Manual verification steps for resizability would be:
  // 1. Load the component in a browser.
  // 2. Locate the resize handle at the bottom-right corner.
  // 3. Click and drag the handle.
  // 4. Observe that the chat window resizes horizontally and vertically.
  // 5. Observe that the content within the chat window (messages area, input area) adapts correctly.
  // 6. Observe that the messages area becomes scrollable if content exceeds its height.
  // 7. Verify that resizing does not go below min-width and min-height.

  // Manual verification for dragging window:
  // 1. Load the component in a browser.
  // 2. Click and drag the header "Admin Chat".
  // 3. Observe that the entire chat window moves with the mouse.
  // 4. Release the mouse button and confirm the window stays in the new position.

  it('disables send button when message is empty or sending', async () => {
    const sendButton = wrapper.find('button');
    const input = wrapper.find('input[type="text"]');

    // Initially empty, should be disabled
    expect(sendButton.attributes('disabled')).toBeDefined();

    await input.setValue(' '); // Still effectively empty after trim
    expect(sendButton.attributes('disabled')).toBeDefined();

    await input.setValue('Not empty');
    expect(sendButton.attributes('disabled')).toBeUndefined();

    // Simulate sending
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ reply: 'Done' }),
    }), 50)));
    await sendButton.trigger('click');
    await nextTick();
    expect(wrapper.vm.isSending).toBe(true);
    expect(sendButton.attributes('disabled')).toBeDefined();
    expect(sendButton.text()).toBe('Sending...');

    // Wait for send to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    await nextTick();
    expect(wrapper.vm.isSending).toBe(false);
    expect(sendButton.attributes('disabled')).toBeDefined(); // Because input is now empty
    expect(sendButton.text()).toBe('Send');
  });

});