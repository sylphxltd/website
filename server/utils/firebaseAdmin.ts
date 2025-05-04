import * as admin from 'firebase-admin';
import { useRuntimeConfig } from '#imports';

let adminAuthInstance: admin.auth.Auth | null = null;
let adminDbInstance: admin.firestore.Firestore | null = null;
let isInitialized = false;

function initializeAdminApp() {
  // Only initialize once
  if (isInitialized || (admin.apps && admin.apps.length > 0)) {
    if (!adminAuthInstance) adminAuthInstance = admin.auth();
    if (!adminDbInstance) adminDbInstance = admin.firestore();
    isInitialized = true;
    return;
  }

  console.log('Attempting Firebase Admin SDK initialization (lazy in util)...');
  const config = useRuntimeConfig();
  const googleAppCreds = config.googleApplicationCredentials;

  if (!googleAppCreds) {
    throw new Error('Firebase Admin SDK init failed: googleApplicationCredentials runtime config is not set.');
  }

  let credential: admin.credential.Credential | undefined;
  let initError: unknown = null;

  // Priority 1: Try parsing GOOGLE_APPLICATION_CREDENTIALS as JSON content
  try {
    const serviceAccount = JSON.parse(googleAppCreds);
    credential = admin.credential.cert(serviceAccount);
    console.log('Attempting Admin SDK init via parsed JSON content...');
  } catch (parseError) {
    console.warn(`Parsing JSON content failed: ${parseError instanceof Error ? parseError.message : parseError}. Falling back to ADC...`);
    initError = parseError;
    // Priority 2: Try standard Application Default Credentials (ADC)
    try {
      credential = admin.credential.applicationDefault();
      console.log('Attempting Admin SDK init via ADC...');
      initError = null; // Clear previous error if ADC is attempted
    } catch (adcError) {
      console.error('ADC initialization also failed:', adcError);
      initError = initError || adcError;
    }
  }

  if (!credential) {
    throw new Error(`Firebase Admin SDK init failed. Could not obtain credential. Last error: ${initError instanceof Error ? initError.message : initError}`);
  }

  // Initialize the app
  try {
    // Check again if already initialized by a concurrent request perhaps
    if (!admin.apps || !admin.apps.length) {
        admin.initializeApp({ credential });
        console.log('Firebase Admin SDK initialized successfully (lazy in util).');
        isInitialized = true;
        adminAuthInstance = admin.auth();
        adminDbInstance = admin.firestore();
    } else {
        console.log('Firebase Admin SDK already initialized (checked before final init).');
        isInitialized = true; // Assume initialized if apps exist
        if (!adminAuthInstance) adminAuthInstance = admin.auth();
        if (!adminDbInstance) adminDbInstance = admin.firestore();
    }
  } catch (finalInitError) {
    console.error('Firebase Admin SDK initializeApp failed (lazy in util):', finalInitError);
    throw new Error(`Firebase Admin SDK initializeApp failed (lazy in util). Error: ${finalInitError instanceof Error ? finalInitError.message : finalInitError}`);
  }
}

// Getter function for Admin Auth, ensures initialization
export function getAdminAuth(): admin.auth.Auth {
    if (!isInitialized) {
        initializeAdminApp();
    }
    if (!adminAuthInstance) {
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