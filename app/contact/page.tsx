"use client";

import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("loading");

		// Simulate API call
		setTimeout(() => {
			setStatus("success");
			setFormData({ name: "", email: "", subject: "", message: "" });
		}, 1000);
	};

	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
						Contact Us
					</h1>
					<p className="text-xl text-gray-600 mb-12 text-center">
						Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll
						respond as soon as possible.
					</p>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Name
							</label>
							<input
								type="text"
								id="name"
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
								required
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
								Subject
							</label>
							<input
								type="text"
								id="subject"
								required
								value={formData.subject}
								onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
								Message
							</label>
							<textarea
								id="message"
								required
								rows={6}
								value={formData.message}
								onChange={(e) => setFormData({ ...formData, message: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>

						{status === "success" && (
							<div className="p-4 bg-green-50 border border-green-200 rounded-md">
								<p className="text-green-800">
									Message sent successfully! We&apos;ll be in touch soon.
								</p>
							</div>
						)}

						{status === "error" && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-800">Failed to send message. Please try again.</p>
							</div>
						)}

						<button
							type="submit"
							disabled={status === "loading"}
							className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{status === "loading" ? "Sending..." : "Send Message"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
