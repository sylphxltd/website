export default function CommunityPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto mb-16 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Join Our Community</h1>
					<p className="text-xl text-gray-600">
						Connect with other users, share ideas, and get help from our community.
					</p>
				</div>

				<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
						<div className="text-4xl mb-4">💬</div>
						<h3 className="text-2xl font-bold mb-4">Discussion Forums</h3>
						<p className="text-indigo-100 mb-6">
							Join discussions about features, share tips, and get help from other users.
						</p>
						<button
							type="button"
							className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors"
						>
							Visit Forums
						</button>
					</div>

					<div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-8 text-white">
						<div className="text-4xl mb-4">📱</div>
						<h3 className="text-2xl font-bold mb-4">Discord Server</h3>
						<p className="text-blue-100 mb-6">
							Chat in real-time with other community members and the SylphX team.
						</p>
						<button
							type="button"
							className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors"
						>
							Join Discord
						</button>
					</div>

					<div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-8 text-white">
						<div className="text-4xl mb-4">🎓</div>
						<h3 className="text-2xl font-bold mb-4">Learning Resources</h3>
						<p className="text-green-100 mb-6">
							Access tutorials, guides, and documentation to get the most out of our products.
						</p>
						<button
							type="button"
							className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors"
						>
							View Resources
						</button>
					</div>

					<div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-8 text-white">
						<div className="text-4xl mb-4">🎉</div>
						<h3 className="text-2xl font-bold mb-4">Events & Webinars</h3>
						<p className="text-orange-100 mb-6">
							Participate in community events, webinars, and product launches.
						</p>
						<button
							type="button"
							className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors"
						>
							See Events
						</button>
					</div>
				</div>

				<div className="max-w-4xl mx-auto mt-16 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
					<p className="text-gray-600 mb-6">
						We strive to maintain a welcoming and inclusive community. Please be respectful,
						helpful, and constructive in all interactions.
					</p>
				</div>
			</div>
		</div>
	);
}
