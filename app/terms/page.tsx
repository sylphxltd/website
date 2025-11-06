export default function TermsPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
					<p className="text-sm text-gray-500 mb-8">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<div className="prose prose-lg max-w-none">
						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
						<p className="text-gray-600 leading-relaxed">
							By accessing and using SylphX services, you accept and agree to be bound by the terms
							and provision of this agreement.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Use License</h2>
						<p className="text-gray-600 leading-relaxed">
							Permission is granted to temporarily download one copy of our applications for
							personal, non-commercial transitory viewing only. This is the grant of a license, not
							a transfer of title.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Accounts</h2>
						<p className="text-gray-600 leading-relaxed">
							When you create an account with us, you must provide accurate and complete
							information. You are responsible for safeguarding your password and for all activities
							that occur under your account.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Prohibited Uses</h2>
						<p className="text-gray-600 leading-relaxed">You may not use our services:</p>
						<ul className="list-disc pl-6 space-y-2 text-gray-600">
							<li>For any unlawful purpose</li>
							<li>To solicit others to perform unlawful acts</li>
							<li>To violate any international, federal, provincial or state regulations</li>
							<li>To infringe upon our intellectual property rights</li>
							<li>To harass, abuse, or harm another person</li>
						</ul>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
						<p className="text-gray-600 leading-relaxed">
							In no event shall SylphX be liable for any damages arising out of the use or inability
							to use our services.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
						<p className="text-gray-600 leading-relaxed">
							For questions about these Terms, please contact us at legal@sylphx.com
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
