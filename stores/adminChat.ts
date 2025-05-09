import { defineStore } from 'pinia';
import type { Message } from 'ai'; // From Vercel AI SDK
import { getAuth } from 'firebase/auth';
import { useToastStore } from '~/stores/toast';
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud';
import { getCurrentISOTimestamp } from '~/utils/optimisticUpdateHelpers';

// Client-side representation of SessionSummary from backend
export interface SessionSummaryClient extends OptimisticItemBase {
  id: string; 
  title?: string;
  firstUserMessageSnippet: string;
  lastUpdatedAt: string; // ISO string
  messageCount: number;
}

// DTO for the actual API call
interface ApiCreateChatSessionPayload {
  firstMessageContent: string;
}

// DTO for creating an optimistic SessionSummaryClient, passed to useOptimisticCrud's createItem
interface ChatSessionComposableDto { 
  firstUserMessageSnippet: string;
  title?: string;
  messageCount: number; 
  lastUpdatedAt: string; 
  rawFirstMessageContent: string; 
}

// API response type for creating a session
interface ApiCreateChatSessionResponse {
  sessionId: string; 
  initialMessage: Message;
  newSessionSummary?: { 
    sessionId: string;
    title?: string;
    firstUserMessageSnippet: string;
    lastUpdatedAt: string | { seconds: number, nanoseconds: number }; 
    messageCount: number;
  };
}

export const useAdminChatStore = defineStore('adminChat', () => {
  const sessions = ref<SessionSummaryClient[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isLoadingSessions = ref(false);
  const isLoadingMessages = ref(false);

  const toastStore = useToastStore();
  const lastCreateApiResponse = ref<ApiCreateChatSessionResponse | null>(null);

  async function getIdToken(): Promise<string> {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const token = await currentUser.getIdToken();
    if (!token) throw new Error('Could not retrieve user token.');
    return token;
  }

  function getSafeErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
      const errObj = error as {data?: {message?:string}, statusMessage?: string, message?: string};
      if (errObj.data && typeof errObj.data.message === 'string') return errObj.data.message;
      if (typeof errObj.statusMessage === 'string') return errObj.statusMessage;
      if (typeof errObj.message === 'string') return errObj.message;
    }
    return 'An unexpected error occurred';
  }
  
  const _apiCreateNewChatSessionInternal = async (payload: ApiCreateChatSessionPayload): Promise<ApiCreateChatSessionResponse> => {
    const token = await getIdToken();
    const response = await $fetch<ApiCreateChatSessionResponse>('/api/admin/chat/sessions', {
      method: 'POST',
      body: { firstUserMessage: payload.firstMessageContent }, 
      headers: { 'Authorization': `Bearer ${token}` },
    });
    lastCreateApiResponse.value = response; 
    return response;
  };

  const _transformCreateResponseForChatSession = (
    optimisticItem: SessionSummaryClient, 
    response: ApiCreateChatSessionResponse,
    _tempId: string 
  ): SessionSummaryClient => {
    const baseItem = { 
      ...optimisticItem, 
      id: response.sessionId,
    };

    if (response.newSessionSummary) {
      return {
        ...baseItem,
        id: response.newSessionSummary.sessionId,
        title: response.newSessionSummary.title || baseItem.title,
        firstUserMessageSnippet: response.newSessionSummary.firstUserMessageSnippet || baseItem.firstUserMessageSnippet,
        lastUpdatedAt: typeof response.newSessionSummary.lastUpdatedAt === 'string'
          ? response.newSessionSummary.lastUpdatedAt
          : new Date(response.newSessionSummary.lastUpdatedAt.seconds * 1000 + response.newSessionSummary.lastUpdatedAt.nanoseconds / 1000000).toISOString(),
        messageCount: response.newSessionSummary.messageCount || baseItem.messageCount,
        createdAt: baseItem.createdAt, 
        updatedAt: getCurrentISOTimestamp(), 
      };
    } 
    
    // This block executes if response.newSessionSummary is not present
    if (response.initialMessage?.createdAt) {
        const initialMessageTs = new Date(response.initialMessage.createdAt).toISOString();
        return {
            ...baseItem,
            lastUpdatedAt: initialMessageTs,
            createdAt: baseItem.createdAt || initialMessageTs,
            updatedAt: getCurrentISOTimestamp(),
        };
    }
    
    // Fallback: ensure essential fields are from the response if possible, or keep optimistic
    return {
        ...baseItem,
        updatedAt: getCurrentISOTimestamp(),
    };
  };

  const {
    createItem: createSessionOptimistic,
    isLoadingCreate: isLoadingCreateSession, 
    error: crudError, 
  } = useOptimisticCrud<
    SessionSummaryClient,
    ChatSessionComposableDto, 
    Record<string, never>, 
    ApiCreateChatSessionResponse,
    unknown 
  >({
    itemsRef: sessions,
    apiCreate: async (dto: ChatSessionComposableDto) => { 
      return _apiCreateNewChatSessionInternal({ firstMessageContent: dto.rawFirstMessageContent });
    },
    apiUpdate: async () => { throw new Error('Update not implemented for chat sessions.'); },
    apiDelete: async () => { throw new Error('Delete not implemented for chat sessions.'); },
    transformCreateResponse: _transformCreateResponseForChatSession, 
    itemIdKey: 'id', 
    tempIdPrefix: 'chat-session-temp',
  });

  async function fetchSessions() {
    isLoadingSessions.value = true;
    try {
      const token = await getIdToken();
      const response = await $fetch<{ sessions: Array<{ sessionId: string, title?: string, firstUserMessageSnippet: string, lastUpdatedAt: { seconds: number, nanoseconds: number }, messageCount: number }> }>('/api/admin/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

     const safeConvertToISOString = (timestamp: { seconds: number; nanoseconds: number } | string | null | undefined): string => {
       if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
         try {
           return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toISOString();
         } catch (e) {
           console.error("Invalid timestamp object for conversion:", timestamp, e);
           return new Date(0).toISOString(); // Fallback to epoch
         }
       }
       if (typeof timestamp === 'string') {
           try {
               // Use Number.isNaN for safer NaN check
               if (!Number.isNaN(new Date(timestamp).getTime())) {
                   return timestamp;
               }
           } catch (e) { /* fall through */ }
       }
       console.warn("Invalid or missing lastUpdatedAt, falling back to epoch:", timestamp);
       return new Date(0).toISOString();
     };
      
     sessions.value = response.sessions.map(s => ({
       id: s.sessionId,
       title: s.title,
       firstUserMessageSnippet: s.firstUserMessageSnippet,
       lastUpdatedAt: safeConvertToISOString(s.lastUpdatedAt),
       messageCount: s.messageCount,
       // Assuming createdAt and updatedAt should also be robustly handled if they come from the same potentially problematic source
       // For now, focusing on lastUpdatedAt as per the error. If createdAt/updatedAt are separate fields from API, they might need their own safe conversion.
       // If they are meant to be the same as lastUpdatedAt, this is fine.
       createdAt: safeConvertToISOString(s.lastUpdatedAt),
       updatedAt: safeConvertToISOString(s.lastUpdatedAt),
     })).sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());

   } catch (error: unknown) {
      console.error('Error fetching chat sessions:', error);
      toastStore.error(`Failed to load chat sessions: ${getSafeErrorMessage(error)}`);
      sessions.value = [];
    } finally {
      isLoadingSessions.value = false;
    }
  }

  function setCurrentSessionId(sessionId: string | null) {
    currentSessionId.value = sessionId;
  }

  async function loadMessagesForCurrentSession(setMessagesFn: (messages: Message[]) => void) {
    if (!currentSessionId.value || isLoadingMessages.value) {
      if (!currentSessionId.value) setMessagesFn([]);
      return;
    }
    isLoadingMessages.value = true;
    try {
      const token = await getIdToken();
      const response = await $fetch<{ messages: Message[] }>(`/api/admin/chat/sessions/${currentSessionId.value}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const formattedMessages = response.messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(), 
      }));
      setMessagesFn(formattedMessages);
    } catch (error: unknown) {
      console.error(`Error loading messages for session ${currentSessionId.value}:`, error);
      toastStore.error(`Failed to load messages: ${getSafeErrorMessage(error)}`);
      setMessagesFn([]);
    } finally {
      isLoadingMessages.value = false;
    }
  }
  
  async function createNewSession(firstMessageContent: string): Promise<{ id: string, initialMessage: Message } | null> {
    const snippetMaxLength = 50;
    const titleMaxLength = 30;
    const snippet = firstMessageContent.length > snippetMaxLength 
                    ? `${firstMessageContent.substring(0, snippetMaxLength)}...` 
                    : firstMessageContent;
    const title = snippet.length > titleMaxLength ? `${snippet.substring(0, titleMaxLength)}...` : snippet;

    const dto: ChatSessionComposableDto = { 
        firstUserMessageSnippet: snippet,
        title: title,
        messageCount: 1, 
        lastUpdatedAt: getCurrentISOTimestamp(), 
        rawFirstMessageContent: firstMessageContent,
    };
    
    lastCreateApiResponse.value = null;
    const result = await createSessionOptimistic(dto);

    // Access item and apiResponse from the result object
    const createdItem = result.item;
    const apiResponse = result.apiResponse;

    if (createdItem?.id && apiResponse?.initialMessage) {
      return { id: createdItem.id, initialMessage: apiResponse.initialMessage };
    }
    if (createdItem && (!apiResponse || !apiResponse.initialMessage)) {
        console.warn('createNewSession: Optimistic session created/updated, but initialMessage from API response cache is missing or undefined.');
    }
    return null;
  }

  const activeSessionTitle = computed((): string | null => {
    if (!currentSessionId.value) return 'Admin Chat';
    const current = sessions.value.find(s => s.id === currentSessionId.value);
    return current?.title || current?.firstUserMessageSnippet || 'Chat Session';
  });

  const hasSessions = computed((): boolean => {
    return sessions.value.length > 0;
  });

  return {
    sessions,
    currentSessionId,
    isLoadingSessions,
    isLoadingMessages,
    isLoadingCreateSession, 
    crudError, 
    activeSessionTitle,
    hasSessions,
    fetchSessions,
    setCurrentSessionId,
    loadMessagesForCurrentSession,
    createNewSession,
  };
});