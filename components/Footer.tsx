"use client";

import Link from "next/link";
import { footerLinks } from "@/lib/navigation";

export default function Footer() {
	const companyLinks = footerLinks.filter((link) =>
		["/about", "/contact", "/careers"].includes(link.path),
	);
	const legalLinks = footerLinks.filter((link) =>
		["/privacy", "/terms", "/cookies"].includes(link.path),
	);

	return (
		<footer className="bg-white border-t border-gray-200">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Logo and about section */}
					<div className="col-span-1">
						<div className="flex items-center space-x-2 mb-4">
							<div className="h-9 w-9 flex items-center justify-center rounded overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
								<img src="/images/logo.png" alt="SylphX Logo" className="h-6 w-6" />
							</div>
							<span className="text-xl font-bold text-gray-900">SylphX</span>
						</div>
						<p className="text-gray-600 text-sm mb-4">
							Innovative cross-platform applications and immersive experiences powered by
							cutting-edge technologies.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-gray-500 hover:text-indigo-600 transition-colors"
								aria-label="Twitter"
							>
								𝕏
							</a>
							<a
								href="#"
								className="text-gray-500 hover:text-indigo-600 transition-colors"
								aria-label="Facebook"
							>
								f
							</a>
							<a
								href="#"
								className="text-gray-500 hover:text-indigo-600 transition-colors"
								aria-label="Instagram"
							>
								📷
							</a>
							<a
								href="#"
								className="text-gray-500 hover:text-indigo-600 transition-colors"
								aria-label="GitHub"
							>
								⚙
							</a>
						</div>
					</div>

					{/* Products section */}
					<div className="col-span-1">
						<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
							Products
						</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/apps"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									All Products
								</Link>
							</li>
							<li>
								<Link
									href="/apps/sylph-note"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									SylphNote
								</Link>
							</li>
							<li>
								<Link
									href="/apps/vortex-vr"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									VortexVR
								</Link>
							</li>
							<li>
								<Link
									href="/apps/sylph-chat"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									SylphChat
								</Link>
							</li>
						</ul>
					</div>

					{/* Company section */}
					<div className="col-span-1">
						<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
							Company
						</h3>
						<ul className="space-y-3">
							{companyLinks.map((link) => (
								<li key={link.path}>
									<Link
										href={link.path}
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
							<li>
								<Link
									href="/technologies"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									Technologies
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal section */}
					<div className="col-span-1">
						<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
							Legal
						</h3>
						<ul className="space-y-3">
							{legalLinks.map((link) => (
								<li key={link.path}>
									<Link
										href={link.path}
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom section with copyright */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-gray-600">
							© {new Date().getFullYear()} SylphX. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
