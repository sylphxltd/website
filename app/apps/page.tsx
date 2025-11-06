export default function AppsPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto mb-16 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Applications</h1>
					<p className="text-xl text-gray-600">
						Explore our suite of innovative products designed to enhance your digital experience.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Apps will be listed here */}
					<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Apps Coming Soon</h3>
						<p className="text-gray-600">
							We&apos;re working hard to bring you amazing applications. Check back soon!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
