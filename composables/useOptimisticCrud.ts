import { ref, type Ref } from 'vue';
import { useToastStore } from '~/stores/toast';
import { generateTempId, deepClone, getCurrentISOTimestamp } from '~/utils/optimisticUpdateHelpers';

// Base item structure enforced by the composable
export interface OptimisticItemBase {
  id: string; // Changed to string only
  createdAt?: string;
  updatedAt?: string;
}

export interface OptimisticCrudOptions<
  TItem extends OptimisticItemBase,
  TCreateDto extends Omit<Partial<TItem>, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdateDto extends Omit<Partial<TItem>, 'id' | 'createdAt' | 'updatedAt'>,
  TApiCreateResponse,
  TApiUpdateResponse
> {
  itemsRef: Ref<TItem[]>;
  apiCreate: (data: TCreateDto) => Promise<TApiCreateResponse>;
  apiUpdate: (id: string, data: TUpdateDto) => Promise<TApiUpdateResponse>; // Changed id to string
  apiDelete: (id: string) => Promise<void>; // Changed id to string
  transformCreateResponse?: (optimisticItem: TItem, response: TApiCreateResponse, tempId: string) => TItem; // Changed tempId to string
  transformUpdateResponse?: (itemInState: TItem, response: TApiUpdateResponse) => TItem;
  itemIdKey?: keyof TItem & string; // Added itemIdKey back, ensuring it's a string key
  tempIdPrefix?: string;
}

export interface OptimisticCrudCreateItemResult<TItem, TApiCreateResponse> {
  item: TItem | null;
  apiResponse: TApiCreateResponse | null; // Include the raw API response
}

export interface OptimisticCrudResult<TItem extends OptimisticItemBase, TCreateDto, TUpdateDto, TApiCreateResponse> {
  createItem: (data: TCreateDto) => Promise<OptimisticCrudCreateItemResult<TItem, TApiCreateResponse>>; // Updated return type
  updateItem: (id: string, data: TUpdateDto) => Promise<TItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  isLoadingCreate: Ref<boolean>;
  isLoadingUpdate: Ref<Record<string, boolean>>; // Changed key to string
  isLoadingDelete: Ref<Record<string, boolean>>; // Changed key to string
  error: Ref<Error | null>;
}

// Helper types for error parsing
interface BaseErrorWithMessage { message: string; }
interface ErrorWithOptionalData { data?: BaseErrorWithMessage; } // data can be optional
interface ErrorWithStatusMessage { statusMessage: string; }


export function useOptimisticCrud<
  // biome-ignore lint/suspicious/noExplicitAny: TItem needs to be flexible for various user-defined types extending OptimisticItemBase
  TItem extends OptimisticItemBase & Record<string, any>,
  TCreateDto extends Omit<Partial<TItem>, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdateDto extends Omit<Partial<TItem>, 'id' | 'createdAt' | 'updatedAt'>,
  TApiCreateResponse = Partial<TItem> | string,
  TApiUpdateResponse = Partial<TItem>
>(
  options: OptimisticCrudOptions<TItem, TCreateDto, TUpdateDto, TApiCreateResponse, TApiUpdateResponse>
): OptimisticCrudResult<TItem, TCreateDto, TUpdateDto, TApiCreateResponse> { // Added TApiCreateResponse to result
  const toastStore = useToastStore();
  const {
    itemsRef,
    apiCreate,
    apiUpdate,
    apiDelete,
    transformCreateResponse,
    transformUpdateResponse,
    itemIdKey = 'id' as keyof TItem & string, // Default to 'id' if not provided
    tempIdPrefix = 'temp'
  } = options;

  const isLoadingCreate = ref(false);
  const isLoadingUpdate = ref<Record<string, boolean>>({}); // Changed key to string
  const isLoadingDelete = ref<Record<string, boolean>>({}); // Changed key to string
  const error = ref<Error | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err;
  
    if (typeof err === 'object' && err !== null) {
      // Check for Nuxt $fetch error structure (err.data.message)
      if ('data' in err) {
        const errorWithData = err as ErrorWithOptionalData;
        if (errorWithData.data && typeof errorWithData.data.message === 'string') {
          return errorWithData.data.message;
        }
      }
      // Check for H3Error structure (err.statusMessage)
      if ('statusMessage' in err && typeof (err as ErrorWithStatusMessage).statusMessage === 'string') {
        return (err as ErrorWithStatusMessage).statusMessage;
      }
      // Check for standard Error object message or other direct message properties
      if ('message' in err && typeof (err as BaseErrorWithMessage).message === 'string') {
        return (err as BaseErrorWithMessage).message;
      }
    }
    if (err instanceof Error) return err.message;
    
    return 'An unexpected error occurred';
  };

  const createItem = async (data: TCreateDto): Promise<OptimisticCrudCreateItemResult<TItem, TApiCreateResponse>> => {
    isLoadingCreate.value = true;
    error.value = null;
    const tempId = generateTempId(tempIdPrefix);
    const now = getCurrentISOTimestamp();

    const optimisticItem = {
      ...data,
      [itemIdKey]: tempId, // Use itemIdKey
      createdAt: now,
      updatedAt: now,
    } as TItem;

    itemsRef.value.unshift(optimisticItem);
    let finalItemInArray = optimisticItem;

    try {
      const response = await apiCreate(data);
      const itemIndex = itemsRef.value.findIndex(item => item[itemIdKey] === tempId); // Use itemIdKey

      if (itemIndex !== -1) {
        let updatedItem: TItem;
        if (transformCreateResponse) {
          updatedItem = transformCreateResponse(itemsRef.value[itemIndex], response, tempId);
        } else {
          const baseItem = itemsRef.value[itemIndex];
          let newId: string = String(baseItem[itemIdKey]); // Ensure string from itemIdKey
          let responseDataPart: Partial<TItem> = {};

          if (typeof response === 'object' && response !== null) {
            responseDataPart = response as Partial<TItem>;
            const responseAsIdProvider = response as { [key: string]: string | number | undefined };
            if (responseAsIdProvider[itemIdKey] !== undefined) {
              newId = String(responseAsIdProvider[itemIdKey]);
            } else if (responseAsIdProvider.id !== undefined) {
              newId = String(responseAsIdProvider.id);
            }
          } else if (typeof response === 'string') {
            newId = response;
          } else if (typeof response === 'number') {
            newId = String(response);
          }
          
          updatedItem = {
            ...baseItem,
            ...responseDataPart,
            [itemIdKey]: newId, // Use itemIdKey
          } as TItem;
        }
        itemsRef.value.splice(itemIndex, 1, updatedItem);
        finalItemInArray = updatedItem;
      } else {
        console.warn(`Optimistic item with tempId ${tempId} not found after API success. Constructing new item from response.`);
        let newItem: TItem;
        if (transformCreateResponse) {
          newItem = transformCreateResponse(optimisticItem, response, tempId);
        } else {
          let idFromResponse: string = tempId;
          let responseDataPart: Partial<TItem> = {};
          if (typeof response === 'object' && response !== null) {
            responseDataPart = response as Partial<TItem>;
            const responseAsIdProvider = response as { [key: string]: string | number | undefined };
            if (responseAsIdProvider[itemIdKey] !== undefined) {
              idFromResponse = String(responseAsIdProvider[itemIdKey]);
            } else if (responseAsIdProvider.id !== undefined) {
              idFromResponse = String(responseAsIdProvider.id);
            }
          } else if (typeof response === 'string') {
            idFromResponse = response;
          } else if (typeof response === 'number') {
            idFromResponse = String(response);
          }
          newItem = { ...optimisticItem, ...responseDataPart, [itemIdKey]: idFromResponse } as TItem;
        }
        itemsRef.value.unshift(newItem);
        finalItemInArray = newItem;
      }
      toastStore.success('Item created successfully!');
      // Assuming `response` here is the raw API response
      return { item: finalItemInArray, apiResponse: response as TApiCreateResponse };
    } catch (err: unknown) {
      itemsRef.value = itemsRef.value.filter(item => item[itemIdKey] !== tempId);
      const message = getErrorMessage(err);
      error.value = new Error(message);
      toastStore.error(message);
      return { item: null, apiResponse: null };
    } finally {
      isLoadingCreate.value = false;
    }
  };

  const updateItem = async (id: string, data: TUpdateDto): Promise<TItem | null> => {
    isLoadingUpdate.value = { ...isLoadingUpdate.value, [id]: true };
    error.value = null;
    const itemIndex = itemsRef.value.findIndex(item => item[itemIdKey] === id); // Use itemIdKey

    if (itemIndex === -1) {
      const message = `Item with ID ${id} not found for update.`;
      error.value = new Error(message);
      toastStore.error(message);
      isLoadingUpdate.value = { ...isLoadingUpdate.value, [id]: false };
      return null;
    }

    const originalItem = deepClone(itemsRef.value[itemIndex]);
    const now = getCurrentISOTimestamp();
    const updatedItemInState = {
      ...itemsRef.value[itemIndex],
      ...data,
      updatedAt: now,
    } as TItem;
    
    itemsRef.value.splice(itemIndex, 1, updatedItemInState);

    try {
      const response = await apiUpdate(id, data);
      let finalPersistedItem = updatedItemInState;

      if (transformUpdateResponse) {
        finalPersistedItem = transformUpdateResponse(itemsRef.value[itemIndex], response);
      } else if (typeof response === 'object' && response !== null) {
        finalPersistedItem = { ...itemsRef.value[itemIndex], ...(response as Partial<TItem>) } as TItem;
      }
      itemsRef.value.splice(itemIndex, 1, finalPersistedItem);
      toastStore.success(`Item ${id} updated successfully!`);
      return finalPersistedItem;
    } catch (err: unknown) {
      itemsRef.value.splice(itemIndex, 1, originalItem); // Rollback
      const message = getErrorMessage(err);
      error.value = new Error(message);
      toastStore.error(message);
      return null;
    } finally {
      isLoadingUpdate.value = { ...isLoadingUpdate.value, [id]: false };
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    isLoadingDelete.value = { ...isLoadingDelete.value, [id]: true };
    error.value = null;
    const itemIndex = itemsRef.value.findIndex(item => item[itemIdKey] === id); // Use itemIdKey

    if (itemIndex === -1) {
      const message = `Item with ID ${id} not found for deletion.`;
      error.value = new Error(message);
      toastStore.error(message);
      isLoadingDelete.value = { ...isLoadingDelete.value, [id]: false };
      return false;
    }

    const originalItem = deepClone(itemsRef.value[itemIndex]);
    itemsRef.value.splice(itemIndex, 1); // Optimistic delete

    try {
      await apiDelete(id);
      toastStore.success(`Item ${id} deleted successfully!`);
      return true;
    } catch (err: unknown) {
      itemsRef.value.splice(itemIndex, 0, originalItem); // Rollback
      const message = getErrorMessage(err);
      error.value = new Error(message);
      toastStore.error(message);
      return false;
    } finally {
      isLoadingDelete.value = { ...isLoadingDelete.value, [id]: false };
    }
  };

  return {
    createItem,
    updateItem,
    deleteItem,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    error,
  };
}