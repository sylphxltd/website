"use client";

import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				<div className="text-6xl mb-4">⚠️</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
				<p className="text-gray-600 mb-6">We encountered an unexpected error. Please try again.</p>
				<button
					type="button"
					onClick={reset}
					className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
