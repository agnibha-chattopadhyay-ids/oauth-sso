"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientRegistry } from "@/lib/auth/clients";

export default function GoogleAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const clientId = searchParams.get("client_id") || process.env.NEXT_PUBLIC_CLIENT_ID || "default";
    const redirectUri = searchParams.get("redirect_uri");

    // Get client configuration
    const client = clientRegistry.getClient(clientId);
    if (!client) {
      router.push("/auth/error?error=invalid_client");
      return;
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session storage for validation
    sessionStorage.setItem("google_oauth_state", state);

    // Construct Google OAuth URL
    const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const oauthParams = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/callback/google`,
      response_type: "code",
      scope: "openid email profile",
      state,
      client_id_param: clientId, // Pass the application client ID
      ...(redirectUri && { redirect_uri_param: redirectUri }), // Pass the final redirect URI
    });

    // Redirect to Google OAuth
    window.location.href = `${googleOAuthUrl}?${oauthParams.toString()}`;
  }, [router, searchParams]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Redirecting to Google
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we redirect you to Google sign in...
          </p>
        </div>
      </div>
    </div>
  );
} 