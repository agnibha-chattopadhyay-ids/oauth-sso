"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { GOOGLE_AUTH_CALLBACK } from "@/graphql/auth.operations";
import { useAuth } from "@/lib/auth/AuthContext";
import { getDapp } from "@/lib/auth/dapps";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(true);

  const code = searchParams.get("code");
  const dappId = searchParams.get("state") || process.env.NEXT_PUBLIC_DAPP_ID || "default";
  const dapp = getDapp(dappId);

  const [googleCallback] = useMutation(GOOGLE_AUTH_CALLBACK);

  React.useEffect(() => {
    async function handleCallback() {
      if (!code || !dapp) {
        toast.error("Invalid authentication response");
        router.push("/auth/login");
        return;
      }

      try {
        const { data } = await googleCallback({
          variables: {
            code,
            dappId,
          },
        });

        if (data?.googleAuthCallback?.token) {
          toast.success("Successfully logged in with Google!");
          login(data.googleAuthCallback.token);
          router.push('/dashboard');
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
  }, [code, dapp, dappId, googleCallback, login, router]);

  if (!code || !dapp) {
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