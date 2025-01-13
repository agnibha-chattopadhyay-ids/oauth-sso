import { NextResponse, type NextRequest } from 'next/server';
import { getDapp, DAPP_IDS } from '@/lib/auth/dapps';
import { isTokenExpired } from '@/lib/auth/token';

// Add more specific auth-related paths
const PUBLIC_PATHS = [
	'/auth/login',
	'/auth/register',
	'/auth/error',
	'/auth/callback/google',
	'/auth/google',
	'/auth/logout'
];

function isPublicPath(path: string): boolean {
	return (
		PUBLIC_PATHS.includes(path) ||
		path.startsWith('/_next') ||
		path.startsWith('/api') ||
		path.includes('/favicon.ico') ||
		path.includes('.png') ||
		path.includes('.jpg') ||
		path.includes('.svg')
	);
}

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Skip middleware for public paths
	if (isPublicPath(path)) {
		return NextResponse.next();
	}

	// Get dapp configuration
	const dappId = request.headers.get('x-dapp-id') || process.env.NEXT_PUBLIC_DAPP_ID || DAPP_IDS.DEFAULT;
	const dapp = getDapp(dappId);

	if (!dapp) {
		return NextResponse.redirect(new URL('/auth/error?error=invalid_dapp', request.url));
	}

	// Check for authentication token
	const token = request.cookies.get('auth_token')?.value;

	// Handle authentication
	if (!token || isTokenExpired(token)) {
		const loginUrl = new URL('/auth/login', request.url);
		loginUrl.searchParams.set('dapp_id', dappId);
		loginUrl.searchParams.set('redirect_uri', path);

		const response = NextResponse.redirect(loginUrl);

		// Clear expired token if it exists
		if (token) {
			response.cookies.delete('auth_token');
		}

		return response;
	}

	// Add security headers
	const response = NextResponse.next();
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
}; 