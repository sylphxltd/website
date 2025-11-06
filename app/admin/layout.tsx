"use client";

import { useUserStore } from "@/lib/stores/useUserStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const adminNav = [
	{ name: "Dashboard", path: "/admin", icon: "📊" },
	{ name: "Apps", path: "/admin/apps", icon: "📱" },
	{ name: "Users", path: "/admin/users", icon: "👥" },
	{ name: "Analytics", path: "/admin/analytics", icon: "📈" },
	{ name: "Reviews", path: "/admin/reviews", icon: "⭐" },
	{ name: "Media", path: "/admin/media", icon: "📸" },
	{ name: "Emails", path: "/admin/emails", icon: "✉️" },
	{ name: "Resources", path: "/admin/resources", icon: "📁" },
	{ name: "Settings", path: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user, isAdmin, loading } = useUserStore();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && (!user || !isAdmin)) {
			router.push("/login");
		}
	}, [user, isAdmin, loading, router]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!user || !isAdmin) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				{/* Sidebar */}
				<aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed">
					<div className="p-6">
						<h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
					</div>
					<nav className="px-4 space-y-1">
						{adminNav.map((item) => {
							const isActive =
								item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path);

							return (
								<Link
									key={item.path}
									href={item.path}
									className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
										isActive
											? "bg-indigo-50 text-indigo-600"
											: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<span className="text-xl">{item.icon}</span>
									{item.name}
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Main Content */}
				<main className="flex-1 ml-64 p-8">{children}</main>
			</div>
		</div>
	);
}
