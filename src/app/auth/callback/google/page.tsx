"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { GOOGLE_AUTH_CALLBACK } from "@/graphql/auth.operations";
import { useAuth } from "@/lib/auth/AuthContext";
import { clientRegistry } from "@/lib/auth/clients";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [handleCallback] = useMutation(GOOGLE_AUTH_CALLBACK);

  useEffect(() => {
    async function handleGoogleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const clientId = searchParams.get("client_id") || process.env.NEXT_PUBLIC_CLIENT_ID || "default";
      const redirectUri = searchParams.get("redirect_uri");

      // Get client configuration
      const client = clientRegistry.getClient(clientId);
      if (!client) {
        router.push("/auth/error?error=invalid_client");
        return;
      }

      // Handle Google OAuth errors
      if (error) {
        const errorDescription = searchParams.get("error_description") || "Google authentication failed";
        router.push(`/auth/error?error=${error}&error_description=${errorDescription}`);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        router.push("/auth/error?error=invalid_request&error_description=Missing required parameters");
        return;
      }

      try {
        // Exchange code for tokens
        const { data } = await handleCallback({
          variables: {
            code,
            state,
            clientId,
          },
        });

        if (data?.googleCallback?.token) {
          toast.success("Successfully logged in with Google!");
          login(data.googleCallback.token, data.googleCallback.refreshToken);

          // Handle redirect based on client configuration
          if (redirectUri && client.allowedRedirectUrls.includes(redirectUri)) {
            const params = new URLSearchParams({
              access_token: data.googleCallback.token,
              token_type: "Bearer",
            });
            window.location.href = `${redirectUri}?${params.toString()}`;
          } else {
            router.push(client.applicationUrl);
          }
        } else {
          throw new Error("Failed to authenticate with Google");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        router.push(`/auth/error?error=auth_failed&error_description=${encodeURIComponent(errorMessage)}`);
      }
    }

    handleGoogleCallback();
  }, [searchParams, router, login, handleCallback]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Completing Google Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>
    </div>
  );
} 