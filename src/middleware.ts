import { NextResponse, type NextRequest } from 'next/server';
import { createTokenStore, isTokenExpired, parseToken } from '@/lib/auth/token';
import { clientRegistry } from '@/lib/auth/clients';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Path configurations
const authPaths = [ '/auth/login', '/auth/register', '/auth/callback' ];
const publicPaths = [ '/', '/auth/error' ];

function isAuthPath(pathname: string): boolean {
	return authPaths.some(path => pathname.startsWith(path));
}

function isPublicPath(pathname: string): boolean {
	return publicPaths.some(path => pathname.startsWith(path));
}

// Rate limiting function
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const windowData = rateLimitMap.get(ip);

	if (!windowData) {
		rateLimitMap.set(ip, { count: 1, timestamp: now });
		return true;
	}

	if (now - windowData.timestamp > RATE_LIMIT_WINDOW) {
		rateLimitMap.set(ip, { count: 1, timestamp: now });
		return true;
	}

	if (windowData.count >= MAX_REQUESTS) {
		return false;
	}

	windowData.count++;
	return true;
}

// CSRF token validation
function validateCsrfToken(request: NextRequest): boolean {
	const csrfToken = request.headers.get('x-csrf-token');
	const csrfCookie = request.cookies.get('csrf-token')?.value;

	if (!csrfToken || !csrfCookie) {
		return false;
	}

	return csrfToken === csrfCookie;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const clientId = request.headers.get('x-client-id') ||
		request.nextUrl.searchParams.get('client_id') ||
		process.env.NEXT_PUBLIC_CLIENT_ID ||
		'default';

	// Check client validity
	const client = clientRegistry.getClient(clientId);
	if (!client) {
		return NextResponse.redirect(new URL('/auth/error?error=invalid_client', request.url));
	}

	// Rate limiting
	const ip = request.headers.get('x-forwarded-for')?.split(',')[ 0 ] || '';
	if (!checkRateLimit(ip)) {
		return new NextResponse('Too Many Requests', { status: 429 });
	}

	// CSRF protection for mutations
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		if (!validateCsrfToken(request)) {
			return new NextResponse('Invalid CSRF Token', { status: 403 });
		}
	}

	// Get token from cookies
	const tokenStore = createTokenStore(clientId);
	const token = request.cookies.get(`auth_token_${clientId}`)?.value;

	// Handle SSO authentication flow
	if (isAuthPath(pathname)) {
		// If user is already authenticated and has a valid token
		if (token && !isTokenExpired(token)) {
			const redirectUri = request.nextUrl.searchParams.get('redirect_uri');
			if (redirectUri && client.allowedRedirectUrls.includes(redirectUri)) {
				// Generate authorization code or token based on the flow
				// For this example, we'll use the token directly
				const searchParams = new URLSearchParams();
				searchParams.set('access_token', token);
				searchParams.set('token_type', 'Bearer');
				return NextResponse.redirect(`${redirectUri}?${searchParams.toString()}`);
			}
		}

		// For login/register pages, validate redirect_uri
		const redirectUri = request.nextUrl.searchParams.get('redirect_uri');
		if (redirectUri && !client.allowedRedirectUrls.includes(redirectUri)) {
			return NextResponse.redirect(new URL('/auth/error?error=invalid_redirect_uri', request.url));
		}
	}

	// Set security headers
	const response = NextResponse.next();
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	if (!isPublicPath(pathname)) {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
}

export const config = {
	matcher: [
		// Match all auth-related routes
		'/auth/:path*',
		// Match all protected routes
		'/dashboard/:path*',
		'/profile/:path*',
		// Match root page
		'/'
	]
}; 