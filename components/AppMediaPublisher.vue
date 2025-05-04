<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded shadow">
    <h3 class="text-xl font-semibold mb-4">Publish Post for {{ app.name }}</h3>
    <form @submit.prevent="submitPost">
      <!-- Title -->
      <div class="mb-4">
        <label for="postTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          id="postTitle"
          v-model="post.title"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter post title"
        />
      </div>

      <!-- Content -->
      <div class="mb-4">
        <label for="postContent" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
        <textarea
          id="postContent"
          v-model="post.content"
          required
          rows="10"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Write your main post content here..."
        ></textarea>
        <!-- TODO: Consider using a rich text editor -->
      </div>

      <!-- Platforms -->
      <div class="mb-6">
         <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publish to:</label>
         <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2">
               <input type="checkbox" v-model="post.platforms" value="medium" class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500">
               <span>Medium</span>
            </label>
            <label class="flex items-center gap-2">
               <input type="checkbox" v-model="post.platforms" value="x" class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500">
               <span>X (Twitter)</span>
            </label>
            <label class="flex items-center gap-2">
               <input type="checkbox" v-model="post.platforms" value="facebook" class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500">
               <span>Facebook</span>
            </label>
         </div>
         <p v-if="!post.platforms || post.platforms.length === 0" class="text-xs text-red-500 mt-1">Please select at least one platform.</p>
      </div>

      <!-- Submit Button -->
      <div class="text-right">
         <button
           type="submit"
           :disabled="isSubmitting || !post.title || !post.content || !post.platforms || post.platforms.length === 0"
           class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {{ isSubmitting ? 'Publishing...' : 'Publish Post' }}
         </button>
      </div>
    </form>

    <!-- Submission Results -->
     <div v-if="submissionResult" class="mt-6 p-4 border rounded" :class="submissionResult.success ? 'bg-green-50 border-green-300 dark:bg-green-900 dark:border-green-700' : 'bg-red-50 border-red-300 dark:bg-red-900 dark:border-red-700'">
        <h4 class="font-semibold mb-2" :class="submissionResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
           {{ submissionResult.message }}
        </h4>
        <ul v-if="submissionResult.results" class="list-disc list-inside text-sm">
           <li v-for="res in submissionResult.results" :key="res.platform" :class="res.success ? 'text-gray-700 dark:text-gray-300' : 'text-red-700 dark:text-red-300'">
              <span class="font-medium capitalize">{{ res.platform }}:</span> {{ res.message }}
           </li>
        </ul>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import type { Application } from '~/stores/apps'; // Import Application type

// Define Post structure
interface PostData {
  title: string;
  content: string;
  platforms: ('medium' | 'x' | 'facebook')[];
  // Add appId for context if needed by backend
  // appId?: string;
}

// Define API response structure
interface SubmissionResult {
    success: boolean;
    message: string;
    results?: { platform: string; success: boolean; message: string }[];
}

const props = defineProps<{
  app: Application // Receive the app object
}>();

const userStore = useUserStore();
const post = reactive<PostData>({
  title: '',
  content: '',
  platforms: [],
});
const isSubmitting = ref(false);
const submissionResult = ref<SubmissionResult | null>(null);

const submitPost = async () => {
  if (!post.title || !post.content || !post.platforms || post.platforms.length === 0 || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  submissionResult.value = null;

  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    // Include app context if needed by backend API
    const payload = { ...post, appId: props.app.id };

    const response = await $fetch<SubmissionResult>('/api/media/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Send payload with appId
    });

    submissionResult.value = response;
    userStore.showToast(response.message, response.success ? 'success' : 'warning');
    if (response.success) {
        // Optionally clear form
        // post.title = '';
        // post.content = '';
        // post.platforms = [];
    }

  } catch (err: unknown) {
    console.error("Error submitting post:", err);
    let errorMsg = "Failed to submit post.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
         errorMsg = err.message;
    }
    submissionResult.value = { success: false, message: errorMsg };
    userStore.showToast(errorMsg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>