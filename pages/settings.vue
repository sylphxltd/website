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
        <button 
          @click="activeTab = 'privacy'" 
          class="px-4 py-2 font-medium transition-colors relative"
          :class="activeTab === 'privacy' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >
          Privacy & Data
        </button>
      </div>
      
      <!-- In-page Notification System -->
      <Transition name="notification">
        <div v-if="successMessage" class="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md flex items-start">
          <div class="i-carbon-checkmark-outline text-lg mr-2 mt-0.5"></div>
          <div class="flex-1">{{ successMessage }}</div>
          <button @click="successMessage = ''" class="text-green-700/80 dark:text-green-300/80 hover:text-green-700 dark:hover:text-green-300">
            <div class="i-carbon-close text-lg"></div>
          </button>
        </div>
      </Transition>
      
      <Transition name="notification">
        <div v-if="error" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
          <div class="i-carbon-warning text-lg mr-2 mt-0.5"></div>
          <div class="flex-1">{{ formatErrorMessage(error) }}</div>
          <button @click="error = null" class="text-red-700/80 dark:text-red-300/80 hover:text-red-700 dark:hover:text-red-300">
            <div class="i-carbon-close text-lg"></div>
          </button>
        </div>
      </Transition>
      
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
        <!-- Two-Factor Authentication -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs py-1 px-2 rounded-full">
              Recommended
            </div>
          </div>
          
          <div class="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 mb-4">
            <div class="flex items-start space-x-3">
              <div class="mt-1 text-xl text-blue-600 dark:text-blue-400">
                <span class="i-carbon-two-factor-authentication"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white mb-1">Authenticator App</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Use Google Authenticator, Microsoft Authenticator or any other TOTP app
                </p>
                <button 
                  @click="setupTwoFactor"
                  :disabled="loading"
                  class="mt-3 inline-flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
                >
                  <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
                  Set Up
                </button>
              </div>
            </div>
          </div>
          
          <div class="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
            <div class="flex items-start space-x-3">
              <div class="mt-1 text-xl text-blue-600 dark:text-blue-400">
                <span class="i-carbon-phone"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white mb-1">SMS Verification</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Receive verification codes via SMS when signing in
                </p>
                <button 
                  class="mt-3 inline-flex items-center justify-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      
        <!-- Recent Login Activity -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Login Activity</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Review your recent login activity. If you notice any suspicious activity, change your password immediately.
          </p>
          
          <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="relative overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th class="px-4 py-3 text-left">Device / Location</th>
                    <th class="px-4 py-3 text-left">Time</th>
                    <th class="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr class="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-4 py-3">
                      <div class="flex items-center">
                        <span class="i-carbon-laptop mr-2 text-lg"></span>
                        <div>
                          <div class="font-medium">Chrome - Windows</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">Hong Kong (Current device)</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div>Now</div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs py-0.5 px-2 rounded-full">
                        <span class="i-carbon-circle-filled text-[10px] mr-1"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr class="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-4 py-3">
                      <div class="flex items-center">
                        <span class="i-carbon-phone mr-2 text-lg"></span>
                        <div>
                          <div class="font-medium">Safari - iOS</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">Hong Kong</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div>Today 14:25</div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full">
                        Ended
                      </span>
                    </td>
                  </tr>
                  <tr class="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-4 py-3">
                      <div class="flex items-center">
                        <span class="i-carbon-tablet mr-2 text-lg"></span>
                        <div>
                          <div class="font-medium">Chrome - iPad OS</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">Taiwan</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div>Yesterday 20:13</div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full">
                        Ended
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
              <span class="i-carbon-view mr-1"></span>
              View All Activity
            </button>
          </div>
        </div>
        
        <!-- Connected Devices Management -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Connected Devices</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all devices where you're currently logged in
              </p>
            </div>
            <div>
              <button 
                @click="logoutAllDevices"
                :disabled="loading"
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
                <span class="i-carbon-logout mr-1"></span>
                Log Out All Devices
              </button>
            </div>
          </div>
          
          <div class="space-y-4">
            <!-- Current Device -->
            <div class="relative p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <div class="absolute top-3 right-3 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs py-0.5 px-2 rounded-full">
                Current Device
              </div>
              
              <div class="flex items-start space-x-3 mt-4">
                <div class="p-3 bg-white dark:bg-gray-800 rounded-md">
                  <span class="i-carbon-laptop text-2xl text-blue-600 dark:text-blue-400"></span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Windows - Chrome</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last active: Now
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Location: Hong Kong
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    IP Address: 192.168.1.1
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Other Devices -->
            <div v-for="(device, index) in connectedDevices" :key="index" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-between">
                <div class="flex items-start space-x-3">
                  <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <span :class="device.icon + ' text-2xl text-gray-600 dark:text-gray-400'"></span>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ device.name }}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last active: {{ device.lastActive }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Location: {{ device.location }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      IP Address: {{ device.ip }}
                    </p>
                  </div>
                </div>
                <button 
                  @click="logoutDevice(device.id)"
                  class="mt-3 h-8 inline-flex items-center justify-center px-3 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  <span class="i-carbon-logout mr-1"></span>
                  Log Out
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-start">
              <div class="i-carbon-information text-lg text-blue-600 dark:text-blue-400 mr-2 mt-0.5"></div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                If you see any unfamiliar devices in your login history, change your password immediately and consider enabling two-factor authentication for increased security.
              </p>
            </div>
          </div>
        </div>
        
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
      
      <!-- Privacy and Data Tab -->
      <div v-if="activeTab === 'privacy'" class="space-y-6">
        <!-- Data Authorizations -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Data Usage Authorization</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Control how your personal data is collected and used
          </p>
          
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex items-center h-5 mt-1">
                <input
                  id="data-consent-personalization"
                  type="checkbox"
                  v-model="dataConsent.personalization"
                  class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div class="ml-3">
                <label for="data-consent-personalization" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Personalized Content
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow us to use your browsing and interaction data to provide personalized content and recommendations
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex items-center h-5 mt-1">
                <input
                  id="data-consent-analytics"
                  type="checkbox"
                  v-model="dataConsent.analytics"
                  class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div class="ml-3">
                <label for="data-consent-analytics" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Analytics & Improvements
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow us to collect usage data to improve our products and services
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex items-center h-5 mt-1">
                <input
                  id="data-consent-marketing"
                  type="checkbox"
                  v-model="dataConsent.marketing"
                  class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div class="ml-3">
                <label for="data-consent-marketing" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Marketing Communications
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive marketing messages about new products, features, and promotions
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button 
              @click="saveDataConsent"
              :disabled="loading"
              class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
              Save Settings
            </button>
          </div>
        </div>
        
        <!-- Connected Third-party Apps -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Authorized Third-party Applications</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            These applications have been authorized to access your account data
          </p>
          
          <div v-if="connectedApps.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div class="i-carbon-application-web mx-auto mb-3 text-3xl text-gray-400 dark:text-gray-500"></div>
            <p class="text-gray-500 dark:text-gray-400">You haven't authorized any third-party applications yet</p>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="(app, index) in connectedApps" :key="index" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-between">
                <div class="flex items-center">
                  <img :src="app.icon" alt="App icon" class="w-10 h-10 rounded-md mr-3" />
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ app.name }}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Authorized on {{ app.authorizedDate }}
                    </p>
                  </div>
                </div>
                <button 
                  @click="revokeAppAccess(app.id)"
                  class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Revoke Access
                </button>
              </div>
              
              <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Access permissions:</h4>
                <div class="space-y-1">
                  <div v-for="(permission, permIndex) in app.permissions" :key="permIndex" class="flex items-center text-xs">
                    <span class="i-carbon-checkmark-outline text-green-600 dark:text-green-400 mr-1"></span>
                    <span class="text-gray-600 dark:text-gray-400">{{ permission }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Data Export / Delete -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4">Data Download & Deletion</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Download a copy of your data or request deletion of your account data
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div class="i-carbon-document-export text-2xl text-blue-600 dark:text-blue-400 mb-2"></div>
              <h3 class="font-medium text-gray-900 dark:text-white mb-1">Data Download</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Download all your personal data, content, and activity records from the platform
              </p>
              <button 
                @click="requestDataExport"
                :disabled="loading"
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
                Export Data
              </button>
            </div>
            
            <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/20">
              <div class="i-carbon-trash-can text-2xl text-red-600 dark:text-red-400 mb-2"></div>
              <h3 class="font-medium text-red-700 dark:text-red-400 mb-1">Delete All Data</h3>
              <p class="text-xs text-red-600/80 dark:text-red-400/80 mb-3">
                Request permanent deletion of all data associated with your account. This action cannot be undone.
              </p>
              <button 
                @click="requestDataDeletion"
                :disabled="loading"
                class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-red-600 dark:bg-red-700 text-white font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Data Deletion
              </button>
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

// Data privacy consent settings
const dataConsent = ref({
  personalization: true,
  analytics: true,
  marketing: false
})

// Connected third-party apps
const connectedApps = ref([
  {
    id: '1',
    name: 'Example App',
    icon: 'https://placehold.co/100x100/4F46E5/FFFFFF.png?text=App',
    authorizedDate: '2023-10-15',
    permissions: [
      'Read your profile information',
      'Access your photos',
      'View your activity log'
    ]
  }
])

// Connected devices
const connectedDevices = ref([
  {
    id: 'device1',
    name: 'iPhone 13 - Safari',
    icon: 'i-carbon-phone',
    lastActive: 'Today 16:32',
    location: 'Hong Kong',
    ip: '192.168.1.2'
  },
  {
    id: 'device2',
    name: 'MacBook Pro - Chrome',
    icon: 'i-carbon-laptop',
    lastActive: 'Yesterday 21:45',
    location: 'Hong Kong',
    ip: '192.168.1.3'
  },
  {
    id: 'device3',
    name: 'iPad - Safari',
    icon: 'i-carbon-tablet',
    lastActive: '3 days ago',
    location: 'Taiwan',
    ip: '192.168.1.4'
  }
])

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

async function uploadProfileImage() {
  // In a real app, this would open a file picker and upload to Firebase Storage
  // For now, we'll simulate the process
  loading.value = true
  successMessage.value = ''
  error.value = null
  
  try {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Assign a random avatar from a public API
    profileImageUrl.value = `https://i.pravatar.cc/300?u=${Date.now()}`
    successMessage.value = 'Profile picture updated successfully'
  } catch (err) {
    error.value = err as Error
    console.error('Profile Image Upload Error:', err)
  } finally {
    loading.value = false
  }
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

// Data privacy functions
function saveDataConsent() {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    successMessage.value = 'Privacy settings updated successfully'
  }, 800)
}

function revokeAppAccess(appId: string) {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    connectedApps.value = connectedApps.value.filter(app => app.id !== appId)
    loading.value = false
    successMessage.value = 'Application access successfully revoked'
  }, 800)
}

function requestDataExport() {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    successMessage.value = 'Data export request submitted. You will receive a download link within 24 hours.'
  }, 1500)
}

function requestDataDeletion() {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    successMessage.value = 'Data deletion request submitted. We will process your request within 7 days.'
  }, 1500)
}

// Device management functions
function logoutDevice(deviceId: string) {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    connectedDevices.value = connectedDevices.value.filter(device => device.id !== deviceId)
    loading.value = false
    successMessage.value = 'Device successfully logged out'
  }, 800)
}

function logoutAllDevices() {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    connectedDevices.value = []
    loading.value = false
    successMessage.value = 'All devices successfully logged out'
  }, 1200)
}

// Two-factor authentication setup (simulated for now)
async function setupTwoFactor() {
  loading.value = true
  successMessage.value = ''
  error.value = null
  
  try {
    // In a real app, this would generate a QR code and secret key
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message
    successMessage.value = 'Two-factor authentication set up successfully. You will now be asked for a verification code when signing in.'
  } catch (err) {
    error.value = err as Error
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

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease-out;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style> 