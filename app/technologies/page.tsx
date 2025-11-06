export default function TechnologiesPage() {
	const techStack = [
		{
			category: "Frontend",
			technologies: [
				{ name: "React", description: "Building interactive user interfaces" },
				{ name: "Next.js", description: "Server-side rendering and static site generation" },
				{ name: "TypeScript", description: "Type-safe development" },
				{ name: "Tailwind CSS", description: "Utility-first CSS framework" },
			],
		},
		{
			category: "Backend",
			technologies: [
				{ name: "Node.js", description: "JavaScript runtime for server-side development" },
				{ name: "Firebase", description: "Backend-as-a-Service platform" },
				{ name: "PostgreSQL", description: "Relational database management" },
				{ name: "Redis", description: "In-memory data structure store" },
			],
		},
		{
			category: "AI & ML",
			technologies: [
				{ name: "OpenAI GPT", description: "Natural language processing and generation" },
				{ name: "TensorFlow", description: "Machine learning framework" },
				{ name: "PyTorch", description: "Deep learning platform" },
				{ name: "Hugging Face", description: "Transformer models and datasets" },
			],
		},
		{
			category: "Cloud & DevOps",
			technologies: [
				{ name: "Vercel", description: "Deployment and hosting platform" },
				{ name: "Google Cloud", description: "Cloud computing services" },
				{ name: "Docker", description: "Containerization platform" },
				{ name: "GitHub Actions", description: "CI/CD automation" },
			],
		},
	];

	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto mb-16 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
						Our Technology Stack
					</h1>
					<p className="text-xl text-gray-600">
						We leverage cutting-edge technologies to build scalable, performant, and innovative
						applications.
					</p>
				</div>

				<div className="max-w-6xl mx-auto space-y-12">
					{techStack.map((stack, index) => (
						<div key={index}>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">{stack.category}</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{stack.technologies.map((tech, techIndex) => (
									<div
										key={techIndex}
										className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
									>
										<h3 className="text-lg font-bold text-gray-900 mb-2">{tech.name}</h3>
										<p className="text-gray-600">{tech.description}</p>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-8 text-white text-center">
					<h2 className="text-2xl font-bold mb-4">Innovation at Our Core</h2>
					<p className="text-indigo-100 mb-6">
						We&apos;re constantly exploring new technologies and methodologies to stay at the
						forefront of digital innovation.
					</p>
				</div>
			</div>
		</div>
	);
}
