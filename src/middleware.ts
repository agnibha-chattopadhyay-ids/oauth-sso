import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const isAuth = !!req.nextauth.token;
		const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

		if (isAuthPage) {
			if (isAuth) {
				return NextResponse.redirect(new URL("/dashboard", req.url));
			}
			return null;
		}

		if (!isAuth) {
			let callbackUrl = req.nextUrl.pathname;
			if (req.nextUrl.search) {
				callbackUrl += req.nextUrl.search;
			}
			const encodedCallbackUrl = encodeURIComponent(callbackUrl);
			return NextResponse.redirect(
				new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, req.url)
			);
		}
	},
	{
		callbacks: {
			authorized: () => true,
		},
	}
);

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/auth/:path*",
	],
}; 