<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Application Management</h1>

    <div v-if="userStore.loading || loadingApps" class="text-center py-10">
      <p>Loading data...</p>
      <!-- Add a spinner or loading indicator here -->
    </div>

    <div v-else-if="!userStore.isAuthenticated" class="text-center py-10">
      <p class="text-red-500">Please log in to manage applications.</p>
      <NuxtLink to="/login" class="text-blue-500 hover:underline">Go to Login</NuxtLink>
    </div>

    <div v-else>
      <p class="mb-4">Welcome, {{ userStore.userDisplayName }}!</p>
      <p class="mb-4">Is Admin: {{ userStore.isAdmin ? 'Yes' : 'No' }}</p>

      <!-- Admin-only actions -->
      <div v-if="userStore.isAdmin" class="mb-6">
        <button
          @click="showAddAppModal = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Application
        </button>
      </div>

      <!-- Application List -->
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-3">Application List</h2>
        <div v-if="fetchError" class="text-red-500 mb-4">
          Error loading applications: {{ fetchError }}
        </div>
        <ul v-if="apps.length > 0" class="space-y-3">
          <li v-for="app in apps" :key="app.id" class="p-3 bg-white dark:bg-gray-700 rounded shadow-sm flex justify-between items-center">
            <div>
              <h3 class="font-medium">{{ app.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ app.description || 'No description' }}</p>
              <!-- Display links later -->
            </div>
            <div v-if="userStore.isAdmin" class="space-x-2">
               <button @click="editApp(app)" class="text-sm text-blue-500 hover:underline">Edit</button>
               <button @click="deleteApp(app.id)" class="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          </li>
        </ul>
        <p v-else class="text-gray-600 dark:text-gray-400">
          No applications found.
        </p>
      </div>

      <!-- Add/Edit Application Modal (Combined - Placeholder Structure) -->
      <div v-if="showAddAppModal || editingApp" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-900">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            {{ editingApp ? 'Edit Application' : 'Add New Application' }}
          </h3>
          <form @submit.prevent="handleSaveApp">
             <div class="mb-4">
               <label for="appName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
               <input type="text" id="appName" v-model="appForm.name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
             </div>
             <div class="mb-4">
               <label for="appDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
               <textarea id="appDescription" v-model="appForm.description" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
             </div>
             <!-- TODO: Add fields for links (Google Play, App Store, GitHub, etc.) -->
             <p class="text-sm text-gray-500 mb-4">(Fields for store links will go here)</p>

             <div class="items-center px-4 py-3 text-right">
               <button
                 type="button"
                 @click="closeModal"
                 class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
               >
                 {{ editingApp ? 'Update' : 'Save' }}
               </button>
             </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '~/stores/user'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore' // Removed Timestamp value import
import type { Timestamp } from 'firebase/firestore' // Added Timestamp type import
import { useFirestore } from 'vuefire'

// Define the Application interface
interface Application {
  id: string; // Firestore document ID
  name: string;
  description?: string;
  // Add other fields like store links, etc.
  // e.g., googlePlayUrl?: string;
  // e.g., appStoreUrl?: string;
  // e.g., githubUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Define the structure for the form data (without ID initially)
interface AppFormData {
  name: string;
  description?: string;
  // Add corresponding fields from Application interface
}

definePageMeta({
  middleware: ['auth']
})

const userStore = useUserStore()
const db = useFirestore() // Initialize Firestore
const apps = ref<Application[]>([]) // Typed array for applications
const loadingApps = ref(false)
const fetchError = ref<string | null>(null)

const showAddAppModal = ref(false)
const editingApp = ref<Application | null>(null) // Store the app being edited
const appForm = reactive<AppFormData>({ // Reactive form data
  name: '',
  description: '',
})

// Fetch apps from Firestore
const fetchApps = async () => {
  if (!userStore.isAuthenticated || !db) {
      // If db is not ready yet, wait a bit and retry or handle appropriately
      // This basic check might not be sufficient if db initialization is slow
      console.warn("FetchApps: User not authenticated or DB not ready.");
      return;
  }
  loadingApps.value = true;
  fetchError.value = null;
  try {
    const appsCollection = collection(db, "apps");
    const querySnapshot = await getDocs(appsCollection);
    apps.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure timestamps are handled correctly if needed, Firestore might return them directly
    } as Application)); // Cast to Application type
  } catch (error: unknown) { // Changed to unknown
    console.error("Error fetching apps: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load applications.';
    fetchError.value = errorMessage;
    // Only show toast if fetchError has a value (is not null)
    if (fetchError.value) {
        userStore.showToast(fetchError.value, 'error');
    }
  } finally {
    loadingApps.value = false;
  }
}

// Fetch apps when component is mounted
// Use watchEffect or ensure user state/db is ready before fetching
onMounted(() => {
    // Declare stopWatch variable before the watch call
    let stopWatch: (() => void) | null = null;
    // Wait for user store to potentially initialize
    stopWatch = watch(() => userStore.isAuthenticated, (isAuth) => {
        if (isAuth && db) {
            fetchApps();
            // Check if stopWatch has been assigned before calling it
            if (stopWatch) stopWatch();
        } else if (!userStore.loading && !isAuth) {
            // If loading is finished and user is not authenticated, stop watching
             if (stopWatch) stopWatch();
        }
    }, { immediate: true }); // immediate: true to run check initially

    // Fallback in case db takes time to initialize after auth
    if (userStore.isAuthenticated && !db) {
        const dbWatch = watch(db, (newDb) => {
            if (newDb) {
                fetchApps();
                dbWatch();
            }
        })
    }
});


// Function to open the modal for editing
const editApp = (app: Application) => {
  editingApp.value = { ...app }; // Copy app data to avoid direct mutation
  // Populate form
  appForm.name = app.name;
  appForm.description = app.description || '';
  // Populate other fields...
  showAddAppModal.value = false; // Ensure add modal is closed if open
  // Need to set showAddAppModal to false and editingApp to the app to show the modal
  // The v-if condition is `showAddAppModal || editingApp`
  // Let's correct the logic:
  editingApp.value = { ...app };
  appForm.name = app.name;
  appForm.description = app.description || '';
  // showAddAppModal should remain false, editingApp being non-null triggers the modal
}

// Function to close the modal
const closeModal = () => {
  showAddAppModal.value = false;
  editingApp.value = null;
  // Reset form
  appForm.name = '';
  appForm.description = '';
  // Reset other fields...
}

// Function to handle saving (add or update)
const handleSaveApp = async () => {
  if (!db || !userStore.isAdmin) return; // Ensure admin
  const appData = {
    ...appForm,
    updatedAt: serverTimestamp() // Add/update timestamp
  };

  // Add loading state for save operation
  const saveLoading = ref(false);
  saveLoading.value = true;

  try {
    if (editingApp.value) {
      // Update existing app
      const appRef = doc(db, "apps", editingApp.value.id);
      // Ensure createdAt is not overwritten on update
      const updateData = { ...appData };
      // delete updateData.createdAt; // Firestore update shouldn't include createdAt
      await updateDoc(appRef, updateData);
      userStore.showToast('Application updated successfully!', 'success');
    } else {
      // Add new app
      const appsCollection = collection(db, "apps");
      await addDoc(appsCollection, {
        ...appData,
        createdAt: serverTimestamp() // Add createdAt timestamp for new docs
      });
      userStore.showToast('Application added successfully!', 'success');
    }
    closeModal();
    await fetchApps(); // Refresh the list
  } catch (error: unknown) { // Changed to unknown
    console.error("Error saving app: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save application.';
    userStore.showToast(errorMessage, 'error'); // Show toast with derived message
  } finally {
      saveLoading.value = false; // Reset loading state
  }
}

// Placeholder function for deleting an app
const deleteApp = async (appId: string) => {
   if (!db || !userStore.isAdmin) return;
   if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) {
     return;
   }
    // Add loading state for delete operation
   const deleteLoading = ref(false);
   deleteLoading.value = true;
   try {
     const appRef = doc(db, "apps", appId);
     await deleteDoc(appRef);
     userStore.showToast('Application deleted successfully!', 'success');
     await fetchApps(); // Refresh the list
   } catch (error: unknown) { // Changed to unknown
     console.error("Error deleting app: ", error);
     const errorMessage = error instanceof Error ? error.message : 'Failed to delete application.';
     userStore.showToast(errorMessage, 'error'); // Show toast with derived message
   } finally {
       deleteLoading.value = false; // Reset loading state
   }
}

</script>

<style scoped>
/* Add any page-specific styles here */
</style>