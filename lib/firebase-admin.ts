import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
const initAdmin = () => {
	if (getApps().length === 0) {
		const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

		if (!serviceAccount) {
			throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
		}

		return initializeApp({
			credential: cert(JSON.parse(serviceAccount)),
			storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		});
	}
	return getApp();
};

const adminApp = initAdmin();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

export default adminApp;
