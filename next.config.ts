import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "firebasestorage.googleapis.com",
			},
		],
	},
	// Experimental features
	experimental: {
		// Enable React Server Components
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
};

export default nextConfig;
