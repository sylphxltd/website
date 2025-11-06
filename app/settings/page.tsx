"use client";

import { useUserStore } from "@/lib/stores/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
	const { user, loading } = useUserStore();
	const router = useRouter();
	const [profile, setProfile] = useState({
		displayName: "",
		email: "",
		notifications: true,
		newsletter: false,
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
		if (user) {
			setProfile({
				displayName: user.displayName || "",
				email: user.email || "",
				notifications: true,
				newsletter: false,
			});
		}
	}, [user, loading, router]);

	const handleSave = () => {
		// Save settings logic here
		alert("Settings saved!");
	};

	if (loading || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

					<div className="space-y-8">
						{/* Profile Section */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="displayName"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Display Name
									</label>
									<input
										type="text"
										id="displayName"
										value={profile.displayName}
										onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
										Email
									</label>
									<input
										type="email"
										id="email"
										value={profile.email}
										disabled
										className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
									/>
									<p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
								</div>
							</div>
						</div>

						{/* Notifications Section */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-gray-900">Email Notifications</p>
										<p className="text-sm text-gray-500">Receive updates about your account</p>
									</div>
									<input
										type="checkbox"
										checked={profile.notifications}
										onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
										className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-gray-900">Newsletter</p>
										<p className="text-sm text-gray-500">Receive our monthly newsletter</p>
									</div>
									<input
										type="checkbox"
										checked={profile.newsletter}
										onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
										className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									/>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-4">
							<button
								type="button"
								onClick={handleSave}
								className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
							>
								Save Changes
							</button>
							<button
								type="button"
								onClick={() => router.push("/")}
								className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
