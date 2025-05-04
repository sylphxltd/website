import * as admin from 'firebase-admin';
import { useRuntimeConfig } from '#imports';

// Store initialized instances globally within this module
let adminAuthInstance: admin.auth.Auth | null = null;
let adminDbInstance: admin.firestore.Firestore | null = null;
let isInitialized = false; // Flag to track initialization status

// Function to initialize the Admin SDK (only runs once)
function initializeAdminApp() {
    // Check the flag first, then admin.apps as a fallback
    if (isInitialized || (admin.apps && admin.apps.length > 0)) {
        if (!adminAuthInstance) adminAuthInstance = admin.auth();
        if (!adminDbInstance) adminDbInstance = admin.firestore();
        isInitialized = true; // Ensure flag is set if admin.apps check passed
        return;
    }

    console.log('Attempting Firebase Admin SDK initialization...');
    const config = useRuntimeConfig();
    const googleAppCreds = config.googleApplicationCredentials;

    if (!googleAppCreds) {
        throw new Error('Firebase Admin SDK initialization failed: googleApplicationCredentials runtime config is not set.');
    }

    let credential: admin.credential.Credential | undefined;
    let initError: unknown = null;

    // Try ADC first
    try {
        credential = admin.credential.applicationDefault();
        admin.initializeApp({ credential });
        console.log('Firebase Admin SDK initialized via ADC.');
        isInitialized = true; // Set flag on success
    } catch (adcError) {
        console.warn(`ADC init failed: ${adcError instanceof Error ? adcError.message : adcError}. Falling back to parsing content...`);
        initError = adcError;
        // Try parsing content ONLY if ADC failed
        try {
            const serviceAccount = JSON.parse(googleAppCreds);
            credential = admin.credential.cert(serviceAccount);
            // Check again if already initialized by a concurrent request perhaps
            if (!admin.apps || !admin.apps.length) {
                 admin.initializeApp({ credential });
                 console.log('Firebase Admin SDK initialized via parsed content.');
                 isInitialized = true; // Set flag on success
                 initError = null; // Clear error
            } else {
                 console.log('Firebase Admin SDK already initialized (checked before parsing content init).');
                 isInitialized = true; // Set flag
                 initError = null; // Clear error
            }
        } catch (parseError) {
            console.error('Parsing content failed:', parseError);
            initError = initError || parseError; // Keep the first error encountered
        }
    }

    // Final check after all attempts
    if (!isInitialized) {
         console.error('Final Firebase Admin SDK initialization check failed.', initError);
        throw new Error(`Firebase Admin SDK final init check failed. Last error: ${initError instanceof Error ? initError.message : initError}`);
    }

    // Assign instances after successful initialization
    adminAuthInstance = admin.auth();
    adminDbInstance = admin.firestore();
}

// Getter function for Admin Auth, ensures initialization
export function getAdminAuth(): admin.auth.Auth {
    if (!isInitialized) {
        initializeAdminApp();
    }
    if (!adminAuthInstance) {
        // This should not happen if initializeAdminApp succeeded or threw
        throw new Error("Failed to get adminAuth instance after initialization attempt.");
    }
    return adminAuthInstance;
}

// Getter function for Admin Firestore, ensures initialization
export function getAdminDb(): admin.firestore.Firestore {
     if (!isInitialized) {
        initializeAdminApp();
    }
    if (!adminDbInstance) {
        throw new Error("Failed to get adminDb instance after initialization attempt.");
    }
    return adminDbInstance;
}

// Optionally export the raw admin object, but prefer getters
// export const firebaseAdmin = admin;