<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-12">
    <div v-if="!user" class="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 class="text-xl font-semibold mb-4">You need to be logged in to access settings</h1>
      <NuxtLink 
        to="/login" 
        class="inline-flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-md shadow-md shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span class="i-carbon-login mr-1"></span>
        Login to your account
      </NuxtLink>
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-8">Account Settings</h1>
      
      <!-- Settings Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        <button 
          @click="activeTab = 'profile'" 
          class="px-4 py-2 font-medium transition-colors relative"
          :class="activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          Profile
        </button>
        <button 
          @click="activeTab = 'connections'" 
          class="px-4 py-2 font-medium transition-colors relative"
          :class="activeTab === 'connections' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          Connected Accounts
        </button>
        <button 
          @click="activeTab = 'security'" 
          class="px-4 py-2 font-medium transition-colors relative"
          :class="activeTab === 'security' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          Security
        </button>
      </div>
      
      <!-- Success/Error Alert -->
      <div v-if="successMessage" class="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
        {{ successMessage }}
      </div>
      
      <div v-if="error" class="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
        {{ formatErrorMessage(error) }}
      </div>
      
      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Profile Information</h2>
        
        <div class="flex items-center mb-6">
          <div v-if="profileImageUrl" class="relative">
            <img :src="profileImageUrl" alt="Profile picture" class="w-20 h-20 rounded-full object-cover mr-6" />
            <button 
              @click="profileImageUrl = ''" 
              class="absolute top-0 right-5 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
              title="Remove image"
            >×</button>
          </div>
          <div v-else class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-6">
            <span class="text-3xl text-gray-400 dark:text-gray-500">{{ (displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase() }}</span>
          </div>
          
          <button 
            @click="uploadProfileImage"
            class="inline-flex items-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <span class="i-carbon-upload mr-2"></span>
            Change Picture
          </button>
        </div>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input 
              id="displayName" 
              v-model="displayName" 
              type="text" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <div class="flex items-center">
              <input 
                type="email" 
                :value="user.email" 
                readonly
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
              <div class="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs py-1 px-2 rounded">
                Verified
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4">
            <button 
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      <!-- Connected Accounts Tab -->
      <div v-if="activeTab === 'connections'" class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-6">Connected Social Accounts</h2>
          
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Link your accounts to enable seamless sign-in across different platforms.
          </p>
          
          <!-- Connected Account Item -->
          <div class="space-y-4">
            <!-- Google -->
            <div class="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                  <span class="i-carbon-logo-google text-xl text-red-500"></span>
                </div>
                <div>
                  <h3 class="font-medium">Google</h3>
                  <p v-if="googleConnected" class="text-xs text-gray-500 dark:text-gray-400">
                    Connected as {{ googleEmail }}
                  </p>
                  <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                    Not connected
                  </p>
                </div>
              </div>
              <button 
                v-if="googleConnected"
                @click="unlinkProvider('google')"
                :disabled="loading"
                class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
              >
                Disconnect
              </button>
              <button 
                v-else
                @click="linkProvider('google')"
                :disabled="loading"
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Connect
              </button>
            </div>
            
            <!-- GitHub (placeholder) -->
            <div class="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                  <span class="i-carbon-logo-github text-xl"></span>
                </div>
                <div>
                  <h3 class="font-medium">GitHub</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                </div>
              </div>
              <button 
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-md opacity-50 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
            
            <!-- Apple (placeholder) -->
            <div class="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                  <span class="i-carbon-logo-apple text-xl"></span>
                </div>
                <div>
                  <h3 class="font-medium">Apple</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                </div>
              </div>
              <button 
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-md opacity-50 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Sign-in Preferences</h2>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="social-preferred"
                type="checkbox"
                v-model="socialPreferred"
                class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="social-preferred" class="font-medium text-gray-700 dark:text-gray-300">Prefer social login</label>
              <p class="text-gray-500 dark:text-gray-400">
                Always recommend social login methods first when signing in
              </p>
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <button 
              @click="savePreferences"
              :disabled="loading"
              class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
      
      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="space-y-6">
        <!-- Change Password -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Change Password</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input 
                id="currentPassword" 
                v-model="currentPassword" 
                type="password" 
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                :disabled="!emailPasswordProvider"
              />
            </div>
            
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input 
                id="newPassword" 
                v-model="newPassword" 
                type="password" 
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Minimum 6 characters"
                :disabled="!emailPasswordProvider"
              />
            </div>
            
            <div>
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input 
                id="confirmNewPassword" 
                v-model="confirmNewPassword" 
                type="password" 
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Re-enter new password"
                :disabled="!emailPasswordProvider"
              />
            </div>
            
            <div v-if="!emailPasswordProvider" class="mt-2 text-sm text-amber-600 dark:text-amber-400">
              <p>Password change is only available for accounts using email/password authentication.</p>
              <p class="mt-1">You are currently using social login.</p>
            </div>
            
            <div class="flex justify-end pt-4">
              <button 
                type="submit"
                :disabled="loading || !emailPasswordProvider"
                class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
                Update Password
              </button>
            </div>
          </form>
        </div>
        
        <!-- Account Deletion -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <h2 class="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Delete Account</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <button 
            @click="showDeleteConfirm = true"
            class="inline-flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            Delete my account
          </button>
          
          <!-- Delete Account Confirmation Modal -->
          <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <h3 class="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Confirm Account Deletion</h3>
              <p class="mb-6 text-gray-700 dark:text-gray-300">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <div class="flex justify-end space-x-3">
                <button 
                  @click="showDeleteConfirm = false"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  @click="deleteAccount"
                  :disabled="loading"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAuth, 
  updateProfile as firebaseUpdateProfile, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  unlink,
  deleteUser,
  AuthErrorCodes
} from 'firebase/auth'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = useCurrentUser()
const auth = getAuth()

// UI state
const activeTab = ref('profile')
const loading = ref(false)
const error = ref<Error | null>(null)
const successMessage = ref('')
const showDeleteConfirm = ref(false)

// Form fields
const displayName = ref('')
const profileImageUrl = ref('')
const socialPreferred = ref(true)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

// Provider states
const googleConnected = ref(false)
const googleEmail = ref('')

// Initialize form values from user data
onMounted(() => {
  if (user.value) {
    displayName.value = user.value.displayName || ''
    profileImageUrl.value = user.value.photoURL || ''
    
    // Check providers
    const providerData = user.value.providerData || []
    for (const provider of providerData) {
      if (provider.providerId === 'google.com') {
        googleConnected.value = true
        googleEmail.value = provider.email || ''
      }
    }
  }
})

// Check if user has email/password provider
const emailPasswordProvider = computed(() => {
  if (!user.value?.providerData) return false
  return user.value.providerData.some(provider => provider.providerId === 'password')
})

function formatErrorMessage(err: Error): string {
  if (!err) return '';
  
  // Extract Firebase error code
  const errorMessage = err.message || '';
  const isFirebaseError = errorMessage.includes('auth/');
  
  if (isFirebaseError) {
    // Handle common Firebase auth errors with user-friendly messages
    if (errorMessage.includes('auth/requires-recent-login')) {
      return 'For security reasons, this action requires you to log in again. Please sign out and sign back in to perform this action.';
    }
    if (errorMessage.includes('auth/email-already-in-use')) {
      return 'This email address is already registered with another account.';
    }
    if (errorMessage.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (errorMessage.includes('auth/wrong-password')) {
      return 'Incorrect current password. Please try again.';
    }
    if (errorMessage.includes('auth/too-many-requests')) {
      return 'Too many unsuccessful attempts. Please try again later.';
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (errorMessage.includes('auth/credential-already-in-use')) {
      return 'This social account is already linked to a different user.';
    }
    if (errorMessage.includes('auth/popup-closed-by-user')) {
      return 'The authentication popup was closed before completing. Please try again.';
    }
    if (errorMessage.includes('auth/account-exists-with-different-credential')) {
      return 'An account already exists with the same email address but different sign-in credentials.';
    }
    if (errorMessage.includes('auth/provider-already-linked')) {
      return 'This account is already linked to your profile.';
    }
  }
  
  // Fallback to the original error message or a generic message
  return errorMessage || 'An error occurred. Please try again.';
}

// Functions
async function updateProfile() {
  if (!user.value) return
  
  if (!displayName.value.trim()) {
    error.value = new Error('Display name cannot be empty.')
    return
  }
  
  loading.value = true
  error.value = null
  successMessage.value = ''
  
  try {
    await firebaseUpdateProfile(user.value, {
      displayName: displayName.value,
      photoURL: profileImageUrl.value
    })
    
    successMessage.value = 'Profile updated successfully'
  } catch (err) {
    error.value = err as Error
    console.error('Profile Update Error:', err)
  } finally {
    loading.value = false
  }
}

function uploadProfileImage() {
  // Placeholder - would typically open a file picker and upload to storage
  // For demo, we'll just use a random avatar URL
  profileImageUrl.value = `https://i.pravatar.cc/150?u=${Date.now()}`
}

async function changePassword() {
  if (!user.value || !emailPasswordProvider.value) return
  
  if (!currentPassword.value) {
    error.value = new Error('Please enter your current password.')
    return
  }
  
  if (!newPassword.value) {
    error.value = new Error('Please enter a new password.')
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = new Error('New password must be at least 6 characters long.')
    return
  }
  
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = new Error('New passwords do not match. Please make sure both passwords are identical.')
    return
  }
  
  loading.value = true
  error.value = null
  successMessage.value = ''
  
  try {
    // Re-authenticate user first
    const credential = EmailAuthProvider.credential(
      user.value.email || '',
      currentPassword.value
    )
    
    await reauthenticateWithCredential(user.value, credential)
    await updatePassword(user.value, newPassword.value)
    
    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    
    successMessage.value = 'Password updated successfully'
  } catch (err) {
    error.value = err as Error
    console.error('Password Change Error:', err)
  } finally {
    loading.value = false
  }
}

async function linkProvider(providerName: string) {
  if (!user.value) return
  
  loading.value = true
  error.value = null
  
  try {
    if (providerName === 'google') {
      const provider = new GoogleAuthProvider()
      await linkWithPopup(user.value, provider)
      googleConnected.value = true
      
      // Update the email
      const updatedUser = auth.currentUser
      if (updatedUser) {
        const googleProvider = updatedUser.providerData.find(p => p.providerId === 'google.com')
        if (googleProvider) {
          googleEmail.value = googleProvider.email || ''
        }
      }
      
      successMessage.value = 'Google account linked successfully'
    }
  } catch (err) {
    error.value = err as Error
    console.error('Link Provider Error:', err)
  } finally {
    loading.value = false
  }
}

async function unlinkProvider(providerName: string) {
  if (!user.value) return
  
  loading.value = true
  error.value = null
  
  try {
    if (providerName === 'google') {
      await unlink(user.value, 'google.com')
      googleConnected.value = false
      googleEmail.value = ''
      successMessage.value = 'Google account unlinked successfully'
    }
  } catch (err) {
    error.value = err as Error
    console.error('Unlink Provider Error:', err)
  } finally {
    loading.value = false
  }
}

function savePreferences() {
  // Placeholder - would typically save to a database
  successMessage.value = 'Preferences saved successfully'
}

async function deleteAccount() {
  if (!user.value) return
  
  loading.value = true
  error.value = null
  
  try {
    await deleteUser(user.value)
    showDeleteConfirm.value = false
    router.push('/')
  } catch (err) {
    error.value = err as Error
    console.error('Delete Account Error:', err)
  } finally {
    loading.value = false
  }
}

// Reset error and success messages when changing tabs
watch(activeTab, () => {
  error.value = null;
  successMessage.value = '';
});
</script> 