"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { GOOGLE_AUTH_CALLBACK } from "@/lib/graphql/auth.operations";
import { useAuth } from "@/lib/auth/AuthContext";
import { clientRegistry } from "@/lib/auth/clients";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(true);

  const code = searchParams.get("code");
  const clientId = searchParams.get("state") || process.env.NEXT_PUBLIC_CLIENT_ID || "default";
  const client = clientRegistry.getClient(clientId);

  const [googleCallback] = useMutation(GOOGLE_AUTH_CALLBACK);

  React.useEffect(() => {
    async function handleCallback() {
      if (!code || !client) {
        toast.error("Invalid authentication response");
        router.push("/auth/login");
        return;
      }

      try {
        const { data } = await googleCallback({
          variables: {
            code,
            clientId,
          },
        });

        if (data?.googleAuthCallback?.token) {
          toast.success("Successfully logged in with Google!");
          login(data.googleAuthCallback.token, data.googleAuthCallback.refreshToken);
          router.push(client.applicationUrl || "/dashboard");
        } else {
          throw new Error("Failed to authenticate with Google");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        toast.error(errorMessage);
        router.push("/auth/login");
      } finally {
        setIsProcessing(false);
      }
    }

    handleCallback();
  }, [code, client, clientId, googleCallback, login, router]);

  if (!code || !client) {
    return null;
  }

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="text-center">
        {isProcessing ? (
          <>
            <Icons.spinner className="mx-auto h-8 w-8 animate-spin" />
            <h2 className="mt-4 text-lg font-semibold">
              Completing your sign in...
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we verify your Google account.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Redirecting...
          </p>
        )}
      </div>
    </div>
  );
} 