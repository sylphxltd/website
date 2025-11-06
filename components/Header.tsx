"use client";

import { coreNavigationLinks } from "@/lib/navigation";
import { useUserStore } from "@/lib/stores/useUserStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
	const pathname = usePathname();
	const { user, isAdmin, signOutUser } = useUserStore();
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const isActiveRoute = (path: string) => {
		if (path === "/") return pathname === "/";
		return pathname.startsWith(path);
	};

	const filteredLinks = coreNavigationLinks.filter((link) => {
		if (link.authRequired && !user) return false;
		if (link.adminOnly && !isAdmin) return false;
		return true;
	});

	return (
		<header
			className={`fixed w-full z-50 transition-all duration-300 ${
				scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 md:h-20">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div
							className={`relative h-9 w-9 flex items-center justify-center rounded overflow-hidden transition-colors ${
								scrolled ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-white"
							}`}
						>
							<img src="/images/logo.png" alt="SylphX Logo" className="h-6 w-6" />
						</div>
						<span
							className={`text-xl font-bold transition-colors ${
								scrolled ? "text-gray-900" : "text-gray-900"
							}`}
						>
							Sylphx
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex space-x-1">
						{filteredLinks.map((link) => (
							<Link
								key={link.path}
								href={link.path}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									isActiveRoute(link.path)
										? "text-indigo-600 bg-indigo-50"
										: scrolled
											? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
											: "text-gray-800 hover:text-gray-900 hover:bg-white/20"
								}`}
							>
								{link.name}
							</Link>
						))}

						{/* Auth Buttons */}
						{!user ? (
							<>
								<Link
									href="/login"
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										scrolled
											? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
											: "text-gray-800 hover:text-gray-900 hover:bg-white/20"
									}`}
								>
									Sign In
								</Link>
								<Link
									href="/register"
									className={`ml-2 px-4 py-2 rounded-md text-sm font-medium ${
										scrolled
											? "bg-indigo-600 text-white hover:bg-indigo-700"
											: "bg-white text-indigo-600 hover:bg-gray-100"
									}`}
								>
									Sign Up
								</Link>
							</>
						) : (
							<button
								type="button"
								onClick={() => signOutUser()}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									scrolled
										? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
										: "text-gray-800 hover:text-gray-900 hover:bg-white/20"
								}`}
							>
								Sign Out
							</button>
						)}
					</nav>

					{/* Mobile Menu Button */}
					<button
						type="button"
						className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<span className="sr-only">Toggle menu</span>
						{mobileMenuOpen ? "✕" : "☰"}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-white border-t">
					<nav className="px-4 py-2 space-y-1">
						{filteredLinks.map((link) => (
							<Link
								key={link.path}
								href={link.path}
								className={`block px-4 py-2 rounded-md text-sm font-medium ${
									isActiveRoute(link.path)
										? "text-indigo-600 bg-indigo-50"
										: "text-gray-700 hover:bg-gray-100"
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								{link.name}
							</Link>
						))}
						{!user ? (
							<>
								<Link
									href="/login"
									className="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign In
								</Link>
								<Link
									href="/register"
									className="block px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign Up
								</Link>
							</>
						) : (
							<button
								type="button"
								onClick={() => {
									signOutUser();
									setMobileMenuOpen(false);
								}}
								className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
							>
								Sign Out
							</button>
						)}
					</nav>
				</div>
			)}
		</header>
	);
}
