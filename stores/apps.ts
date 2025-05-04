import { defineStore } from 'pinia'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useUserStore } from '~/stores/user'
import { createError } from '#imports'

// Define the interface for an Application
export interface Application {
  id: string
  name: string
  description?: string
  links?: { [key: string]: string }
  logoUrl?: string // Added logoUrl field
  createdAt: string
  updatedAt: string
}

// Define the structure for form data (without ID)
export interface AppFormData {
  name: string
  description?: string
  links?: { [key: string]: string }
  logoUrl?: string // Added logoUrl field
}

export const useAppsStore = defineStore('apps', () => {
  // State
  const apps = ref<Application[]>([])
  const loading = ref(false)
  const error = ref<Error | { message: string } | null>(null)
  
  // Get dependencies
  const db = useFirestore()
  const userStore = useUserStore()

  // Fetch apps from Firestore
  const fetchApps = async () => {
    // Skip if not authenticated or DB not ready
    if (!userStore.isAuthenticated || !db) {
      console.warn("AppsStore: User not authenticated or DB not ready")
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const appsCollection = collection(db, "apps")
      // Add ordering by name
      const q = query(appsCollection, orderBy("name", "asc"))
      const querySnapshot = await getDocs(q)
      
      // Map documents to Application objects with serializable timestamps
      apps.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        links: doc.data().links || {}, // Ensure links is always an object
        // Convert Timestamps to ISO strings for serialization
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date(0).toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date(0).toISOString(),
      } as Application))
    } catch (err) {
      console.error("Error fetching apps:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      error.value = { message: errorMessage }
      userStore.showToast(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }

  // Create a new application
  const createApp = async (formData: AppFormData) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }
    
    try {
      const appsCollection = collection(db, "apps")
      const appData = {
        name: formData.name,
        description: formData.description || '',
        links: formData.links || {},
        logoUrl: formData.logoUrl || '', // Save logoUrl
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(appsCollection, appData)
      userStore.showToast('Application created successfully!', 'success')
      
      // Refresh the list
      await fetchApps()
      return docRef.id
    } catch (err) {
      console.error("Error creating app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Update an existing application
  const updateApp = async (appId: string, formData: AppFormData) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }
    
    try {
      const appRef = doc(db, "apps", appId)
      // Construct the update payload directly, letting TypeScript infer the type
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        links: formData.links || {},
        logoUrl: formData.logoUrl || '', // Update logoUrl
        updatedAt: serverTimestamp()
      }
      
      // Pass the object to updateDoc
      await updateDoc(appRef, updateData)
      userStore.showToast('Application updated successfully!', 'success')
      
      // Refresh the list
      await fetchApps()
    } catch (err) {
      console.error("Error updating app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Delete an application
  const deleteApp = async (appId: string) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }
    
    try {
      const appRef = doc(db, "apps", appId)
      await deleteDoc(appRef)
      userStore.showToast('Application deleted successfully!', 'success')
      
      // Refresh the list
      await fetchApps()
    } catch (err) {
      console.error("Error deleting app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Return state and methods
  return {
    apps,
    loading,
    error,
    fetchApps,
    createApp,
    updateApp,
    deleteApp
  }
})