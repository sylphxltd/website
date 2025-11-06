"use client";

import { useUserStore } from "@/lib/stores/useUserStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const { registerUser, signInWithGoogle, loading, error } = useUserStore();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [validationError, setValidationError] = useState("");

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setValidationError("");

		if (password !== confirmPassword) {
			setValidationError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setValidationError("Password must be at least 6 characters");
			return;
		}

		try {
			await registerUser(email, password, rememberMe);
			router.push("/");
		} catch (err) {
			console.error("Registration error:", err);
		}
	};

	const handleGoogleRegister = async () => {
		try {
			await signInWithGoogle();
			router.push("/");
		} catch (err) {
			console.error("Google registration error:", err);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create your account</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Already have an account?{" "}
						<Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
							Sign in
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleRegister}>
					{(error || validationError) && (
						<div className="rounded-md bg-red-50 p-4">
							<p className="text-sm text-red-800">{validationError || error}</p>
						</div>
					)}

					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Password"
							/>
						</div>
						<div>
							<label htmlFor="confirm-password" className="sr-only">
								Confirm Password
							</label>
							<input
								id="confirm-password"
								name="confirm-password"
								type="password"
								autoComplete="new-password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Confirm password"
							/>
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="remember-me"
							name="remember-me"
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
						/>
						<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
							Remember me
						</label>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
						</div>
					</div>

					<div>
						<button
							type="button"
							onClick={handleGoogleRegister}
							disabled={loading}
							className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							Sign up with Google
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
