"use client";

import Link from "next/link";

export default function AdminAppsPage() {
	const apps = [
		{
			id: "1",
			name: "SylphxNote",
			status: "published",
			downloads: 12345,
			rating: 4.5,
		},
		{
			id: "2",
			name: "Vortex VR",
			status: "published",
			downloads: 8900,
			rating: 4.8,
		},
		{
			id: "3",
			name: "SylphxChat",
			status: "draft",
			downloads: 0,
			rating: 0,
		},
	];

	return (
		<div>
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Apps Management</h1>
					<p className="text-gray-600 mt-2">Manage your applications</p>
				</div>
				<button
					type="button"
					className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
				>
					Add New App
				</button>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Downloads
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Rating
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{apps.map((app) => (
							<tr key={app.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">{app.name}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											app.status === "published"
												? "bg-green-100 text-green-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{app.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{app.downloads.toLocaleString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{app.rating > 0 ? `⭐ ${app.rating}` : "N/A"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<Link
										href={`/admin/apps/${app.id}`}
										className="text-indigo-600 hover:text-indigo-900 mr-4"
									>
										Edit
									</Link>
									<button type="button" className="text-red-600 hover:text-red-900">
										Delete
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
