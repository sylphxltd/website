"use client";

import { useToastStore } from "@/lib/stores/useToastStore";

export default function ToastContainer() {
	const { toasts, removeToast } = useToastStore();

	const getToastStyles = (type: string) => {
		switch (type) {
			case "success":
				return "bg-green-50 border-green-200 text-green-800";
			case "error":
				return "bg-red-50 border-red-200 text-red-800";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800";
			case "info":
			default:
				return "bg-blue-50 border-blue-200 text-blue-800";
		}
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "success":
				return "✓";
			case "error":
				return "✕";
			case "warning":
				return "⚠";
			case "info":
			default:
				return "ℹ";
		}
	};

	return (
		<div className="fixed top-20 right-4 z-50 space-y-2">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`flex items-center gap-3 min-w-80 p-4 rounded-lg border shadow-lg animate-slide-in ${getToastStyles(
						toast.type,
					)}`}
				>
					<span className="text-xl">{getIcon(toast.type)}</span>
					<p className="flex-1 text-sm font-medium">{toast.message}</p>
					<button
						type="button"
						onClick={() => removeToast(toast.id)}
						className="text-lg hover:opacity-70"
					>
						×
					</button>
				</div>
			))}
		</div>
	);
}
