export default function AdminUsersPage() {
	const users = [
		{
			id: "1",
			name: "John Doe",
			email: "john@example.com",
			role: "user",
			status: "active",
			joined: "2024-01-15",
		},
		{
			id: "2",
			name: "Jane Smith",
			email: "jane@example.com",
			role: "admin",
			status: "active",
			joined: "2024-01-10",
		},
		{
			id: "3",
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "user",
			status: "inactive",
			joined: "2024-02-01",
		},
	];

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
				<p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Role
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Joined
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900">{user.name}</div>
										<div className="text-sm text-gray-500">{user.email}</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											user.role === "admin"
												? "bg-purple-100 text-purple-800"
												: "bg-gray-100 text-gray-800"
										}`}
									>
										{user.role}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											user.status === "active"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{user.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(user.joined).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button type="button" className="text-indigo-600 hover:text-indigo-900 mr-4">
										Edit
									</button>
									<button type="button" className="text-red-600 hover:text-red-900">
										Suspend
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
