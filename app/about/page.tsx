import Link from "next/link";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="max-w-4xl mx-auto mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
						About SylphX
					</h1>
				</div>

				{/* Company Description */}
				<div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 mb-12 border border-gray-100">
					<div className="prose max-w-none">
						<p className="text-lg text-gray-600 leading-relaxed">
							SylphX is a forward-thinking technology company dedicated to creating innovative digital
							experiences that push the boundaries of what&apos;s possible. We specialize in developing
							high-quality, high-performance applications, games, and immersive experiences across
							multiple platforms.
						</p>

						<p className="text-lg text-gray-600 leading-relaxed">
							Founded by a team of passionate developers and designers, our mission is to blend
							cutting-edge technology with intuitive design to create products that are not only
							powerful but also a joy to use.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>

						<p className="text-lg text-gray-600 leading-relaxed">
							We envision a future where technology enhances human creativity and connection. Our goal
							is to develop tools and experiences that empower users, spark imagination, and create
							meaningful interactions in both digital and augmented realities.
						</p>

						<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Approach</h2>

						<p className="text-lg text-gray-600 leading-relaxed">
							At SylphX, we believe in a thoughtful, user-centered approach to product development. We
							combine technical excellence with creative innovation, constantly exploring new
							technologies and methodologies to create exceptional digital experiences.
						</p>

						<ul className="list-disc pl-6 space-y-2">
							<li className="text-gray-600">
								<strong className="text-gray-900">Innovation:</strong> Constantly exploring emerging
								technologies like AI, VR, and AR
							</li>
							<li className="text-gray-600">
								<strong className="text-gray-900">Quality:</strong> Rigorous testing and optimization for
								flawless performance
							</li>
							<li className="text-gray-600">
								<strong className="text-gray-900">User Experience:</strong> Intuitive design with
								thoughtful attention to detail
							</li>
							<li className="text-gray-600">
								<strong className="text-gray-900">Accessibility:</strong> Creating products that work for
								everyone
							</li>
						</ul>
					</div>
				</div>

				{/* Contact CTA */}
				<div className="max-w-4xl mx-auto mt-20 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
					<p className="text-xl text-gray-600 mb-8">
						Interested in learning more about SylphX or exploring partnership opportunities?
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
					>
						Contact Us →
					</Link>
				</div>
			</div>
		</div>
	);
}
