export default function CareersPage() {
	const positions = [
		{
			title: "Senior Full-Stack Developer",
			department: "Engineering",
			location: "Remote",
			type: "Full-time",
			description:
				"We're looking for an experienced full-stack developer to help build our next-generation applications.",
		},
		{
			title: "Product Designer",
			department: "Design",
			location: "Remote",
			type: "Full-time",
			description:
				"Join our design team to create beautiful and intuitive user experiences for our products.",
		},
		{
			title: "DevOps Engineer",
			department: "Infrastructure",
			location: "Remote",
			type: "Full-time",
			description:
				"Help us build and maintain scalable infrastructure for millions of users worldwide.",
		},
	];

	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto mb-16 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Join Our Team</h1>
					<p className="text-xl text-gray-600">
						We&apos;re always looking for talented individuals to help us build the future of
						digital experiences.
					</p>
				</div>

				<div className="max-w-4xl mx-auto space-y-6">
					{positions.map((position, index) => (
						<div
							key={index}
							className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
								<div>
									<h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
									<div className="flex flex-wrap gap-2 mt-2">
										<span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
											{position.department}
										</span>
										<span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
											{position.location}
										</span>
										<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
											{position.type}
										</span>
									</div>
								</div>
							</div>
							<p className="text-gray-600 mb-4">{position.description}</p>
							<button
								type="button"
								className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
							>
								Apply Now
							</button>
						</div>
					))}
				</div>

				<div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Don&apos;t See a Perfect Fit?</h2>
					<p className="text-gray-600 mb-6">
						We&apos;re always interested in meeting talented people. Send us your resume and
						we&apos;ll keep you in mind for future opportunities.
					</p>
					<button
						type="button"
						className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
					>
						Send Your Resume
					</button>
				</div>
			</div>
		</div>
	);
}
