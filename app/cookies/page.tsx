export default function CookiesPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
					<p className="text-sm text-gray-500 mb-8">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<div className="prose prose-lg max-w-none">
						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
						<p className="text-gray-600 leading-relaxed">
							Cookies are small text files that are placed on your device when you visit our
							website. They help us provide you with a better experience and allow certain features
							to work.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
						<p className="text-gray-600 leading-relaxed">We use cookies for:</p>
						<ul className="list-disc pl-6 space-y-2 text-gray-600">
							<li>
								<strong>Essential Cookies:</strong> Required for the website to function properly
							</li>
							<li>
								<strong>Analytics Cookies:</strong> Help us understand how visitors use our website
							</li>
							<li>
								<strong>Preference Cookies:</strong> Remember your settings and preferences
							</li>
							<li>
								<strong>Authentication Cookies:</strong> Keep you logged in
							</li>
						</ul>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
						<p className="text-gray-600 leading-relaxed">
							We may use third-party services like Google Analytics that also use cookies to collect
							information about your use of our services.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
						<p className="text-gray-600 leading-relaxed">
							You can control and manage cookies in your browser settings. Please note that removing
							or blocking cookies may impact your user experience and some features may not function
							properly.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">More Information</h2>
						<p className="text-gray-600 leading-relaxed">
							If you have questions about our use of cookies, please contact us at
							privacy@sylphx.com
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
