import type { User } from "firebase/auth";
import {
	GoogleAuthProvider,
	browserLocalPersistence,
	browserSessionPersistence,
	createUserWithEmailAndPassword,
	getIdTokenResult,
	onIdTokenChanged,
	sendPasswordResetEmail,
	sendSignInLinkToEmail,
	setPersistence,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../firebase";

interface UserState {
	user: User | null;
	isAdmin: boolean;
	loading: boolean;
	error: string | null;

	// Actions
	setUser: (user: User | null) => void;
	setIsAdmin: (isAdmin: boolean) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	signInWithGoogle: () => Promise<void>;
	signInWithEmailPassword: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
	registerUser: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	sendMagicLink: (email: string) => Promise<void>;
	signOutUser: () => Promise<void>;
	initAuthListener: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
	user: null,
	isAdmin: false,
	loading: false,
	error: null,

	setUser: (user) => set({ user }),
	setIsAdmin: (isAdmin) => set({ isAdmin }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),

	initAuthListener: () => {
		onIdTokenChanged(auth, async (user) => {
			set({ user });
			if (user) {
				try {
					const tokenResult = await getIdTokenResult(user);
					set({ isAdmin: tokenResult.claims.admin === true });
				} catch (err) {
					console.error("Error getting ID token result:", err);
					set({ isAdmin: false, error: "Failed to get user claims" });
				}
			} else {
				set({ isAdmin: false });
			}
		});
	},

	signInWithGoogle: async () => {
		set({ loading: true, error: null });
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "An error occurred during Google sign-in";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},

	signInWithEmailPassword: async (email: string, password: string, rememberMe = false) => {
		set({ loading: true, error: null });
		try {
			await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An error occurred during email sign-in";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},

	registerUser: async (email: string, password: string, rememberMe = false) => {
		set({ loading: true, error: null });
		try {
			await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
			await createUserWithEmailAndPassword(auth, email, password);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An error occurred during registration";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},

	resetPassword: async (email: string) => {
		set({ loading: true, error: null });
		try {
			await sendPasswordResetEmail(auth, email);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "An error occurred during password reset";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},

	sendMagicLink: async (email: string) => {
		set({ loading: true, error: null });
		try {
			const actionCodeSettings = {
				url: `${window.location.origin}/magic-link?email=${email}`,
				handleCodeInApp: true,
			};
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			window.localStorage.setItem("emailForSignIn", email);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An error occurred sending magic link";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},

	signOutUser: async () => {
		set({ loading: true, error: null });
		try {
			await signOut(auth);
			set({ user: null, isAdmin: false });
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An error occurred during sign-out";
			set({ error: message });
			throw err;
		} finally {
			set({ loading: false });
		}
	},
}));
