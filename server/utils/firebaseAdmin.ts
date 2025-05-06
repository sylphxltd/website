import { initializeApp, cert, type ServiceAccount, getApps, getApp as getFirebaseDefaultAppInstance, type App as AdminApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { Bucket } from '@google-cloud/storage';
import { useRuntimeConfig } from '#imports';
import { readFileSync, existsSync } from 'node:fs';

let adminApp: AdminApp | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminBucket: Bucket | null = null;

function _ensureFirebaseAdminApp(): AdminApp {
  if (adminApp) {
    return adminApp;
  }

  console.log('Attempting to get or initialize Firebase Admin App (defensive)...');

  if (getApps().length > 0) {
    console.log('SDK reports existing apps. Attempting to retrieve default app.');
    try {
      adminApp = getFirebaseDefaultAppInstance();
      console.log('Successfully retrieved existing default Firebase Admin App.');
      return adminApp;
    } catch (error) {
      console.warn(`Inconsistent State: SDK reports apps exist, but cannot retrieve the default app. Error: ${error instanceof Error ? error.message : String(error)}. Proceeding to initialize.`);
      // Do not return, proceed to initialization block
    }
  }

  // If getApps().length === 0 OR if the inconsistent state above occurred
  console.log('Attempting to initialize a new default Firebase Admin App...');
  try {
    const config = useRuntimeConfig();
    const googleAppCreds = config.googleApplicationCredentials;

    if (!googleAppCreds) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set in runtimeConfig');
    }

    let serviceAccount: ServiceAccount;
    if (googleAppCreds.toString().trim().startsWith('{')) {
      try {
        serviceAccount = JSON.parse(googleAppCreds.toString()) as ServiceAccount;
        console.log('Using service account JSON from GOOGLE_APPLICATION_CREDENTIALS for new app.');
      } catch (parseError) {
        throw new Error(`Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    } else {
      const credPath = googleAppCreds.toString();
      console.log(`Checking service account file at path for new app: ${credPath}`);
      if (!existsSync(credPath)) {
        throw new Error(`Service account file not found at path: ${credPath}`);
      }
      try {
        const fileContent = readFileSync(credPath, 'utf8');
        serviceAccount = JSON.parse(fileContent) as ServiceAccount;
        console.log('Using service account from file content for new app.');
      } catch (fileError) {
        throw new Error(`Failed to read or parse service account file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
      }
    }
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('New Firebase Admin SDK default app initialized successfully.');
    return adminApp;
  } catch (e: unknown) {
    const error = e as { code?: string; message?: string }; // Type assertion for cleaner access
    if (error.code === 'app/duplicate-app' || (error.message?.includes('duplicate'))) {
      console.warn('Initialization failed due to duplicate app. Attempting to retrieve default app again.');
      try {
        adminApp = getFirebaseDefaultAppInstance();
        console.log('Successfully retrieved default app after duplicate error.');
        return adminApp;
      } catch (finalGetError) {
        const criticalMsg = `CRITICAL FAILURE: Cannot initialize or retrieve default app after duplicate error. Initial error: ${error?.message}. Final get error: ${finalGetError instanceof Error ? finalGetError.message : String(finalGetError)}`;
        console.error(criticalMsg);
        throw new Error(criticalMsg);
      }
    }
    const detailedErrorMsg = `Firebase Admin App initialization failed: ${error?.message}`;
    console.error(detailedErrorMsg, error);
    adminApp = null; // Ensure instance is not partially set
    throw new Error(detailedErrorMsg);
  }
}

/**
 * Gets the Firebase Admin Auth instance.
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const app = _ensureFirebaseAdminApp();
    try {
      adminAuth = getAuth(app);
      console.log('Firebase Admin Auth service retrieved/initialized successfully.');
    } catch (serviceError) {
      const errorMessage = `Failed to retrieve Firebase Admin Auth service: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`;
      console.error(errorMessage, serviceError);
      adminAuth = null; // Ensure not partially set
      throw new Error(errorMessage);
    }
  }
  return adminAuth;
}

/**
 * Gets the Firebase Admin Firestore instance.
 */
export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = _ensureFirebaseAdminApp();
    try {
      adminDb = getFirestore(app);
      console.log('Firebase Admin Firestore service retrieved/initialized successfully.');
    } catch (serviceError) {
      const errorMessage = `Failed to retrieve Firebase Admin Firestore service: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`;
      console.error(errorMessage, serviceError);
      adminDb = null; // Ensure not partially set
      throw new Error(errorMessage);
    }
  }
  return adminDb;
}

/**
 * Gets the Firebase Admin Storage Bucket instance.
 */
export function getStorageBucket(): Bucket {
  if (!adminBucket) {
    const app = _ensureFirebaseAdminApp();
    try {
      adminBucket = getStorage(app).bucket(); // Assumes default bucket
      console.log('Firebase Admin Storage Bucket service retrieved/initialized successfully.');
    } catch (serviceError) {
      const errorMessage = `Failed to retrieve Firebase Admin Storage Bucket service: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`;
      console.error(errorMessage, serviceError);
      adminBucket = null; // Ensure not partially set
      throw new Error(errorMessage);
    }
  }
  return adminBucket;
}