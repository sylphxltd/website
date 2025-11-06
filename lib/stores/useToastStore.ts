import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

interface ToastState {
	toasts: Toast[];
	addToast: (message: string, type: ToastType) => void;
	removeToast: (id: string) => void;
	success: (message: string) => void;
	error: (message: string) => void;
	info: (message: string) => void;
	warning: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
	toasts: [],

	addToast: (message, type) => {
		const id = Math.random().toString(36).substr(2, 9);
		set((state) => ({
			toasts: [...state.toasts, { id, message, type }],
		}));

		// Auto remove after 5 seconds
		setTimeout(() => {
			set((state) => ({
				toasts: state.toasts.filter((toast) => toast.id !== id),
			}));
		}, 5000);
	},

	removeToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		})),

	success: (message) =>
		set((state) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newToast = { id, message, type: "success" as ToastType };
			setTimeout(() => {
				set((s) => ({
					toasts: s.toasts.filter((t) => t.id !== id),
				}));
			}, 5000);
			return { toasts: [...state.toasts, newToast] };
		}),

	error: (message) =>
		set((state) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newToast = { id, message, type: "error" as ToastType };
			setTimeout(() => {
				set((s) => ({
					toasts: s.toasts.filter((t) => t.id !== id),
				}));
			}, 5000);
			return { toasts: [...state.toasts, newToast] };
		}),

	info: (message) =>
		set((state) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newToast = { id, message, type: "info" as ToastType };
			setTimeout(() => {
				set((s) => ({
					toasts: s.toasts.filter((t) => t.id !== id),
				}));
			}, 5000);
			return { toasts: [...state.toasts, newToast] };
		}),

	warning: (message) =>
		set((state) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newToast = { id, message, type: "warning" as ToastType };
			setTimeout(() => {
				set((s) => ({
					toasts: s.toasts.filter((t) => t.id !== id),
				}));
			}, 5000);
			return { toasts: [...state.toasts, newToast] };
		}),
}));
