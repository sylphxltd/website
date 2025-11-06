import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Get the pathname of the request
	const path = request.nextUrl.pathname;

	// Define protected admin routes
	const isAdminRoute = path.startsWith("/admin");

	// For admin routes, we'll handle auth check on the client side
	// This middleware just ensures the route exists
	if (isAdminRoute) {
		// Let the admin layout handle the auth check
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
