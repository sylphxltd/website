import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud';
// generateTempId, deepClone, getCurrentISOTimestamp are used within useOptimisticCrud

// Interface for Resource Metadata (matching API response)
export interface Resource extends OptimisticItemBase {
  // id, createdAt, updatedAt are from OptimisticItemBase
  name: string; 
  path: string; 
  url?: string; 
  size: number; 
  contentType: string; 
  appId: string; 
  description?: string; 
  type?: string; 
  isPublic?: boolean; 
  filename?: string; 
  uploaderUid?: string; 
}

// Interface for metadata passed from component for upload
interface ResourceMetadata {
  name: string;
  description: string;
  type: string;
  isPublic: boolean;
}

// DTO for uploading a resource, used by the composable's createItem
interface ResourceUploadPayload {
  file: File;
  metadata: ResourceMetadata;
  appId: string; 
}

// Placeholder DTO for update operations (not yet refactored with composable)
type ResourceUpdateDto = Omit<Partial<Resource>, 'id' | 'createdAt' | 'updatedAt'>;


export const useResourcesStore = defineStore('resources', () => {
  // State
  const resources = ref<Resource[]>([]);
  const fetchLoading = ref(false); // For fetchResources and getDownloadUrl
  const fetchError = ref<string | null>(null);   // For fetchResources and getDownloadUrl
  const selectedAppId = ref<string | null>(null); 

  // Dependencies
  const userStore = useUserStore();
  const toastStore = useToastStore();
  // const auth = getAuth(); // Removed: Will call getAuth() inside functions that need it

  async function getIdToken(): Promise<string> {
    const auth = getAuth(); // Call getAuth() here
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error("Could not retrieve user token");
    }
    return idToken;
  }

  function getSafeErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
      if ('data' in error && (error as {data?: {message?: string}}).data && typeof (error as {data: {message: string}}).data.message === 'string') {
        return (error as {data: {message: string}}).data.message;
      }
      if ('statusMessage' in error && typeof (error as {statusMessage: string}).statusMessage === 'string') {
        return (error as {statusMessage: string}).statusMessage;
      }
      if ('message' in error && typeof (error as {message: string}).message === 'string') {
        return (error as {message: string}).message;
      }
    }
    return 'An unknown error occurred';
  }

  // API call wrappers for the composable
  const _apiUploadResource = async (data: ResourceUploadPayload): Promise<{ success: boolean, filename: string, newId?: string, newPath?: string }> => {
    const token = await getIdToken();
    const formDataObj = new FormData();
    formDataObj.append('file', data.file);
    formDataObj.append('name', data.metadata.name);
    formDataObj.append('description', data.metadata.description || '');
    formDataObj.append('type', data.metadata.type);
    formDataObj.append('isPublic', data.metadata.isPublic.toString());
    
    const queryParams = new URLSearchParams({ appId: data.appId });

    const responseFromApi = await $fetch<{ success?: boolean, id?: string, path?: string }>(`/api/resources/upload?${queryParams.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataObj,
    });
    const success = !!responseFromApi.id || responseFromApi.success === true;
    return { success, filename: data.file.name, newId: responseFromApi.id, newPath: responseFromApi.path };
  };

  const _apiDeleteResource = async (id: string): Promise<void> => {
    const token = await getIdToken();
    await $fetch('/api/resources/delete', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: { resourceId: id },
    });
  };

  const _transformUploadResponse = (
    optimisticItem: Resource, 
    response: { success: boolean, filename: string, newId?: string, newPath?: string },
    tempId: string 
  ): Resource => {
    if (!response.success) {
      throw new Error(`Upload API call indicated failure for ${response.filename}`);
    }
    return { 
      ...optimisticItem,
      id: response.newId || tempId, 
      path: response.newPath || optimisticItem.path, 
      // Ensure other fields from optimisticItem are preserved if not in response
      name: optimisticItem.name,
      size: optimisticItem.size,
      contentType: optimisticItem.contentType,
      appId: optimisticItem.appId,
      description: optimisticItem.description,
      type: optimisticItem.type,
      isPublic: optimisticItem.isPublic,
      filename: optimisticItem.filename,
      uploaderUid: optimisticItem.uploaderUid,
      // createdAt and updatedAt are handled by the composable initially
    }; 
  };
  
  const _dummyApiUpdate = async (id: string, data: ResourceUpdateDto): Promise<Partial<Resource>> => {
    throw new Error('Update operation for resources not implemented.');
  };

  const {
    createItem: createResourceOptimistic,
    deleteItem: deleteResourceOptimistic,
    isLoadingCreate,
    isLoadingUpdate, 
    isLoadingDelete,
    error: crudError,
  } = useOptimisticCrud<
    Resource, 
    ResourceUploadPayload, 
    ResourceUpdateDto, 
    { success: boolean, filename: string, newId?: string, newPath?: string }, 
    Partial<Resource> 
  >({
    itemsRef: resources,
    apiCreate: _apiUploadResource,
    apiUpdate: _dummyApiUpdate, 
    apiDelete: _apiDeleteResource,
    transformCreateResponse: _transformUploadResponse,
    tempIdPrefix: 'resource-temp',
  });

  const fetchResources = async (appId: string | null) => {
    if (!appId) {
      resources.value = [];
      selectedAppId.value = null;
      return;
    }
    if (!userStore.isAdmin) return; 

    selectedAppId.value = appId;
    fetchLoading.value = true;
    fetchError.value = null;
  
    try {
      const token = await getIdToken();
      const queryParams = new URLSearchParams({ appId });
      const response = await $fetch<{ resources: Resource[]; total?: number }>('/api/resources/list', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        query: queryParams,
      });
      resources.value = response.resources;
    } catch (err: unknown) { 
      console.error("Error fetching resources:", err);
      fetchError.value = getSafeErrorMessage(err); 
      if (fetchError.value) {
          toastStore.error(fetchError.value);
      }
      resources.value = []; 
    } finally {
      fetchLoading.value = false;
    }
  };

  const uploadResource = async (appId: string, file: File, metadata: ResourceMetadata): Promise<Resource | null> => {
    if (!appId || !file || !metadata || !userStore.isAdmin) return null;

    const uploadData: ResourceUploadPayload = { appId, file, metadata };
    const result = await createResourceOptimistic(uploadData);

    if (result.item) {
      const createdResourceItem = result.item; // Assign to a new const to help TS type narrowing
      // If the uploaded resource's appId is not the currently selected one,
      // remove it from the local `resources` ref as it was added by the composable.
      // This maintains the original behavior of only showing newly uploaded resources
      // if they belong to the currently viewed app.
      if (appId !== selectedAppId.value) {
        resources.value = resources.value.filter(r => r.id !== createdResourceItem.id);
      }
    }
    return result.item; // Return the Resource item from the result
  };

  const deleteResource = async (resourceId: string): Promise<boolean> => {
    if (!resourceId || !userStore.isAdmin) return false;
    // The composable handles the core optimistic removal from itemsRef.
    // The conditional removal based on selectedAppId for UI consistency is handled
    // by fetchResources clearing the list when selectedAppId changes.
    return await deleteResourceOptimistic(resourceId);
  };

  const getDownloadUrl = async (resourcePath: string): Promise<string | null> => {
      if (!resourcePath || !userStore.isAdmin) return null;
      fetchError.value = null; 
      try {
          const token = await getIdToken();
          const queryParams = new URLSearchParams({ path: resourcePath });
          const response = await $fetch<{ downloadUrl: string }>(`/api/resources/download?${queryParams.toString()}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          return response.downloadUrl;
      } catch (err: unknown) {
          console.error(`Error getting download URL for ${resourcePath}:`, err);
          fetchError.value = getSafeErrorMessage(err);
          toastStore.error(fetchError.value || 'Failed to get download link.');
          return null;
      }
  };

  return {
    resources,
    fetchLoading, 
    fetchError,   
    isLoadingCreate, 
    isLoadingDelete, 
    crudError,       
    selectedAppId,
    fetchResources,
    uploadResource,
    deleteResource,
    getDownloadUrl, 
  };
});