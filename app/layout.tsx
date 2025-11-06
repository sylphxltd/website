import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
	title: "Sylphx - Simple, Elegant & Usable Software",
	description:
		"Sylphx creates digital products that empower without overwhelming. We believe technology should serve life, not disrupt it. Focused on simple, elegant and deeply usable experiences.",
	icons: {
		icon: "/images/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="font-sans antialiased">
				<AuthProvider>
					<Header />
					<main className="pt-16 md:pt-20">{children}</main>
					<Footer />
					<ToastContainer />
				</AuthProvider>
			</body>
		</html>
	);
}
