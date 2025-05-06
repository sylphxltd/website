import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount, type VueWrapper, type DOMWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import AdminChat from './AdminChat.vue';

// Mock Firebase Auth
import { getAuth as actualGetAuth } from 'firebase/auth';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    getAuth: vi.fn(() => ({
      currentUser: {
        getIdToken: vi.fn().mockResolvedValue('mock-firebase-token'),
      },
    })),
  };
});
const getAuth = actualGetAuth as Mock;

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
    (getAuth().currentUser?.getIdToken as Mock).mockClear();


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

    expect(findLastMessageText()).toBe('Hello AI');
    expect(findLastMessageSender()).toBe('user');
    expect((input.element as HTMLInputElement).value).toBe('');
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

    await new Promise(resolve => setTimeout(resolve, streamChunks.length * 20 + 50));
    await nextTick();
    
    aiBubble = findMessageBubbles()[findMessageBubbles().length -1]; // Re-fetch bubble
    expect(aiBubble.find('.animate-pulse').exists()).toBe(false);
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
      json: async () => ({}), // Should not be called
      text: async () => errorResponseText,
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


  it('displays an error if user is not authenticated', async () => {
    (getAuth().currentUser?.getIdToken as Mock).mockRejectedValueOnce(new Error('Auth failed'));
    // Or alternatively, mock getAuth() to return currentUser as null
    // vi.mocked(getAuth).mockReturnValueOnce({ currentUser: null } as any);
    // For this test, let's assume getIdToken fails

    await wrapper.find('input[type="text"]').setValue('Test Auth Error');
    await wrapper.find('button').trigger('click');
    await nextTick(); // User message might not even be added if auth fails early
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick();

    expect(mockToastStore.error).toHaveBeenCalledWith('Could not authenticate. Please try again.');
    expect(findLastMessageText()).toContain('Failed to get authentication token.');
    expect(findLastMessageSender()).toBe('error');
    expect(wrapper.vm.isSending).toBe(false);
  });

  it('styles user messages correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ reply: 'AI reply' }),
    });
    await wrapper.find('input[type="text"]').setValue('User message style test');
    await wrapper.find('button').trigger('click');
    await nextTick(); // User message
    await new Promise(resolve => setTimeout(resolve, 50));
    await nextTick(); // AI message

    const userMessageBubble = wrapper.findAllComponents({ name: 'div' }).filter((div: DOMWrapper<HTMLDivElement>) =>
        div.element.parentElement?.classList.contains('messages-area') && // Ensure it's a direct child message div
        div.find('div[class*="inline-block"]').classes().includes('bg-blue-600')
    ).at(0)?.find('div[class*="inline-block"]');

    expect(userMessageBubble?.exists()).toBe(true);
    expect(userMessageBubble?.classes()).toContain('bg-blue-600');
    expect(userMessageBubble?.classes()).toContain('text-white');
    expect(userMessageBubble?.classes()).toContain('ml-auto'); // items-end on parent
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