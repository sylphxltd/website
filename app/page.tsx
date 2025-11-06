import Link from "next/link";

export default function HomePage() {
	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative h-screen flex items-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 z-0" />

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="max-w-3xl">
						<h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
							Innovative Digital Experiences for the Modern World
						</h1>
						<p className="text-xl md:text-2xl text-indigo-100 mb-8">
							We create cutting-edge applications and immersive software solutions that transform
							how people connect, work, and play.
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								href="/apps"
								className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
							>
								Explore Our Products
							</Link>
							<Link
								href="/contact"
								className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10"
							>
								Get in Touch
							</Link>
						</div>
					</div>
				</div>

				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
					<span className="text-white text-3xl">↓</span>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Featured Products
						</h2>
						<p className="max-w-3xl mx-auto text-xl text-gray-600">
							Discover our suite of innovative applications designed to enhance productivity,
							creativity, and entertainment.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* App Cards */}
						{[
							{
								name: "SylphxNote",
								description:
									"A powerful note-taking app with AI integration, cloud sync, and collaborative features.",
								gradient: "from-blue-500 to-indigo-600",
								icon: "📝",
								platforms: ["iOS", "Android", "Web"],
							},
							{
								name: "Vortex VR",
								description:
									"An immersive virtual reality platform that transforms how users experience digital content.",
								gradient: "from-purple-500 to-pink-600",
								icon: "🥽",
								platforms: ["Oculus", "SteamVR"],
							},
							{
								name: "SylphxChat",
								description:
									"A secure messaging platform with end-to-end encryption and AI assistants.",
								gradient: "from-green-500 to-teal-600",
								icon: "💬",
								platforms: ["iOS", "Android"],
							},
						].map((app) => (
							<div
								key={app.name}
								className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl"
							>
								<div
									className={`h-48 bg-gradient-to-br ${app.gradient} flex items-center justify-center`}
								>
									<div className="text-6xl">{app.icon}</div>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-gray-900 mb-2">{app.name}</h3>
									<p className="text-gray-600 mb-4">{app.description}</p>
									<div className="flex flex-wrap gap-2 mb-4">
										{app.platforms.map((platform) => (
											<span
												key={platform}
												className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
											>
												{platform}
											</span>
										))}
									</div>
									<Link
										href={`/apps/${app.name.toLowerCase().replace(" ", "-")}`}
										className="text-indigo-600 font-medium flex items-center hover:underline"
									>
										Learn More →
									</Link>
								</div>
							</div>
						))}
					</div>

					<div className="text-center mt-12">
						<Link
							href="/apps"
							className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
						>
							View All Products →
						</Link>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
							Ready to experience our cutting-edge applications?
						</h2>
						<p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
							Join thousands of users worldwide who are already enhancing their digital experiences
							with Sylphx products.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/apps"
								className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-indigo-700 bg-white hover:bg-gray-50"
							>
								Explore Our Products
							</Link>
							<Link
								href="/contact"
								className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10"
							>
								Contact Us
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
