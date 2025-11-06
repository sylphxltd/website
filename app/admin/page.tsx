export default function AdminDashboard() {
	const stats = [
		{ label: "Total Users", value: "1,234", change: "+12%", color: "bg-blue-500" },
		{ label: "Active Apps", value: "12", change: "+2", color: "bg-green-500" },
		{ label: "Total Reviews", value: "456", change: "+23%", color: "bg-purple-500" },
		{ label: "Monthly Revenue", value: "$12.3K", change: "+15%", color: "bg-orange-500" },
	];

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600 mt-2">Welcome to the admin dashboard</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{stats.map((stat, index) => (
					<div key={index} className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">{stat.label}</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
								<p className="text-sm text-green-600 mt-1">{stat.change}</p>
							</div>
							<div className={`w-12 h-12 ${stat.color} rounded-lg`} />
						</div>
					</div>
				))}
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-lg shadow">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
				</div>
				<div className="p-6">
					<div className="space-y-4">
						<div className="flex items-start gap-4">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
							<div>
								<p className="text-sm font-medium text-gray-900">New user registered</p>
								<p className="text-sm text-gray-500">2 minutes ago</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
							<div>
								<p className="text-sm font-medium text-gray-900">App published</p>
								<p className="text-sm text-gray-500">1 hour ago</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
							<div>
								<p className="text-sm font-medium text-gray-900">New review submitted</p>
								<p className="text-sm text-gray-500">3 hours ago</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
