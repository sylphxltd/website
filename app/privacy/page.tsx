export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
					<p className="text-sm text-gray-500 mb-8">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<div className="prose prose-lg max-w-none">
						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h2>
						<p className="text-gray-600 leading-relaxed">
							SylphX ("we," "our," or "us") is committed to protecting your privacy. This Privacy
							Policy explains how we collect, use, disclose, and safeguard your information when you
							use our applications and services.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
						<p className="text-gray-600 leading-relaxed">
							We collect information that you provide directly to us, including:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-gray-600">
							<li>Account information (name, email address, password)</li>
							<li>Profile information</li>
							<li>User-generated content</li>
							<li>Communications with us</li>
						</ul>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
							How We Use Your Information
						</h2>
						<p className="text-gray-600 leading-relaxed">We use the information we collect to:</p>
						<ul className="list-disc pl-6 space-y-2 text-gray-600">
							<li>Provide, maintain, and improve our services</li>
							<li>Process transactions and send related information</li>
							<li>Send technical notices and support messages</li>
							<li>Respond to your comments and questions</li>
							<li>Protect against fraudulent or illegal activity</li>
						</ul>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
						<p className="text-gray-600 leading-relaxed">
							We implement appropriate technical and organizational measures to protect your
							personal information against unauthorized access, alteration, disclosure, or
							destruction.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights</h2>
						<p className="text-gray-600 leading-relaxed">You have the right to:</p>
						<ul className="list-disc pl-6 space-y-2 text-gray-600">
							<li>Access and update your personal information</li>
							<li>Request deletion of your data</li>
							<li>Opt-out of marketing communications</li>
							<li>Lodge a complaint with a supervisory authority</li>
						</ul>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
						<p className="text-gray-600 leading-relaxed">
							If you have questions about this Privacy Policy, please contact us at
							privacy@sylphx.com
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
