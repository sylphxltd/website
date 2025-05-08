import { defineStore } from 'pinia';
import type { Message } from 'ai'; // From Vercel AI SDK
// No longer need firebase-admin/firestore Timestamp here, client uses Date
// import type { Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase/auth'; // For client-side auth token
import { useToastStore } from '~/stores/toast'; // Ensure toast store is imported

// Client-side representation of SessionSummary from backend
export interface SessionSummaryClient {
  sessionId: string;
  title?: string;
  firstUserMessageSnippet: string;
  lastUpdatedAt: Date | string; // Convert Timestamp to Date or string for client
  messageCount: number;
}

interface AdminChatState {
  sessions: SessionSummaryClient[];
  currentSessionId: string | null;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  // chatTitle: string | null; // Can be derived from currentSession or stored if editable
}

export const useAdminChatStore = defineStore('adminChat', {
  state: (): AdminChatState => ({
    sessions: [],
    currentSessionId: null,
    isLoadingSessions: false,
    isLoadingMessages: false,
    // chatTitle: null,
  }),
  getters: {
    activeSessionTitle(state): string | null {
      if (!state.currentSessionId) return 'Admin Chat';
      const current = state.sessions.find(s => s.sessionId === state.currentSessionId);
      return current?.title || current?.firstUserMessageSnippet || 'Chat Session';
    },
    hasSessions(state): boolean {
      return state.sessions.length > 0;
    }
  },
  actions: {
    async fetchSessions() {
      if (this.isLoadingSessions) return;
      this.isLoadingSessions = true;
      const toastStore = useToastStore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toastStore.error('Authentication required to fetch sessions.');
        this.isLoadingSessions = false;
        return;
      }
      let token: string;
      try {
        token = await currentUser.getIdToken();
      } catch (tokenError) {
        console.error('Error getting ID token for fetchSessions:', tokenError);
        toastStore.error('Authentication token error.');
        this.isLoadingSessions = false;
        return;
      }

      try {
        const response = await $fetch<{ sessions: Array<{ sessionId: string, title?: string, firstUserMessageSnippet: string, lastUpdatedAt: { seconds: number, nanoseconds: number }, messageCount: number }> }>('/api/admin/chat/sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        this.sessions = response.sessions.map(s => ({
          ...s,
          // Convert Firestore Timestamp (seconds, nanoseconds) to JavaScript Date object
          lastUpdatedAt: new Date(s.lastUpdatedAt.seconds * 1000 + s.lastUpdatedAt.nanoseconds / 1000000),
        })).sort((a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime()); // Ensure client-side sort after mapping

      } catch (error: unknown) {
        console.error('Error fetching chat sessions:', error);
        let errorMessage = 'Unknown error fetching sessions.'; // Default detailed message
        if (error instanceof Error) {
          errorMessage = error.message; // Base error message from Error instance
          // Check for Nuxt $fetch error structure more safely
          // Ensure 'error' is an object and 'data' property exists before trying to access it.
          if (typeof error === 'object' && error !== null && 'data' in error) {
            const errorWithData = error as { data?: unknown }; // Type assertion for 'data'
            if (typeof errorWithData.data === 'object' && errorWithData.data !== null && 'message' in errorWithData.data && typeof (errorWithData.data as { message: string }).message === 'string') {
              errorMessage = (errorWithData.data as { message: string }).message; // Use message from error.data
            }
          }
        }
        toastStore.error(`Failed to load chat sessions: ${errorMessage}`);
        this.sessions = []; // Clear sessions on error
      } finally {
        this.isLoadingSessions = false;
      }
    },

    setCurrentSessionId(sessionId: string | null) {
      this.currentSessionId = sessionId;
      // When session changes, messages should be loaded for this session
      // This will be handled by the component watching currentSessionId
    },

    // Action to be called by component to load messages for currentSessionId
    async loadMessagesForCurrentSession(setMessagesFn: (messages: Message[]) => void) {
      if (!this.currentSessionId || this.isLoadingMessages) {
        if (!this.currentSessionId) { // If no session ID, ensure messages are cleared
            setMessagesFn([]);
        }
        return;
      }
      this.isLoadingMessages = true;
      const toastStore = useToastStore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!this.currentSessionId) { // Should be caught by the first if, but double check
        this.isLoadingMessages = false;
        setMessagesFn([]);
        return;
      }
      if (!currentUser) {
        toastStore.error('Authentication required to load messages.');
        this.isLoadingMessages = false;
        setMessagesFn([]);
        return;
      }
      let token: string;
      try {
        token = await currentUser.getIdToken();
      } catch (tokenError) {
        console.error(`Error getting ID token for loadMessages (session ${this.currentSessionId}):`, tokenError);
        toastStore.error('Authentication token error.');
        this.isLoadingMessages = false;
        setMessagesFn([]);
        return;
      }

      try {
        const response = await $fetch<{ messages: Message[] }>(`/api/admin/chat/sessions/${this.currentSessionId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Ensure createdAt is a Date object if the API returns strings or Firestore Timestamps
        const formattedMessages = response.messages.map(msg => ({
          ...msg,
          // Assuming msg.createdAt from API is either a Date object, a valid date string, or a number (timestamp)
          createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
        }));
        setMessagesFn(formattedMessages);
      } catch (error: unknown) {
        console.error(`Error loading messages for session ${this.currentSessionId}:`, error);
        let errorMessage = 'Unknown error loading messages.';
        if (error instanceof Error) {
          errorMessage = error.message;
          if (typeof error === 'object' && error !== null && 'data' in error) {
            const errorWithData = error as { data?: unknown };
            if (typeof errorWithData.data === 'object' && errorWithData.data !== null && 'message' in errorWithData.data && typeof (errorWithData.data as { message: string }).message === 'string') {
              errorMessage = (errorWithData.data as { message: string }).message;
            }
          }
        }
        toastStore.error(`Failed to load messages: ${errorMessage}`);
        setMessagesFn([]); // Clear messages on error
      } finally {
        this.isLoadingMessages = false;
      }
    },
    
    // Creates a new session and returns its ID and the initial message object
    async createNewSession(firstMessageContent: string): Promise<{ sessionId: string, initialMessage: Message } | null> {
      const toastStore = useToastStore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toastStore.error('Authentication required to create a new session.');
        return null;
      }
      let token: string;
      try {
        token = await currentUser.getIdToken();
      } catch (tokenError) {
        console.error('Error getting ID token for createNewSession:', tokenError);
        toastStore.error('Authentication token error.');
        return null;
      }

      try {
        const response = await $fetch<{ sessionId: string, initialMessage: Message }>('/api/admin/chat/sessions', {
          method: 'POST',
          body: { firstUserMessage: firstMessageContent },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // After creating, refresh the session list to include the new one
        // The caller will be responsible for setting it active and updating UI messages
        await this.fetchSessions();
        return response;
      } catch (error: unknown) {
        console.error('Error creating new session:', error);
        let errorMessage = 'Unknown error creating session.';
        if (error instanceof Error) {
          errorMessage = error.message;
          if (typeof error === 'object' && error !== null && 'data' in error) {
            const errorWithData = error as { data?: unknown };
            if (typeof errorWithData.data === 'object' && errorWithData.data !== null && 'message' in errorWithData.data && typeof (errorWithData.data as { message: string }).message === 'string') {
              errorMessage = (errorWithData.data as { message: string }).message;
            }
          }
        }
        toastStore.error(`Failed to create new chat session: ${errorMessage}`);
        return null;
      }
    }
  },
});