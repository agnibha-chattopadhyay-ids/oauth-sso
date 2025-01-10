"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { clientRegistry } from "@/lib/auth/clients";
import { toast } from "sonner";
import { useLazyQuery } from "@apollo/client";
import { GOOGLE_AUTH_URL } from "@/lib/graphql/auth.operations";
import { GlassCard } from "@/components/ui/glass-card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  // Get client ID from params or use default
  const clientId = searchParams.get("client_id") || process.env.NEXT_PUBLIC_CLIENT_ID || "default";
  const redirectUri = searchParams.get("redirect_uri");
  const client = clientRegistry.getClient(clientId);

  const [getGoogleAuthUrl] = useLazyQuery(GOOGLE_AUTH_URL);

  const handleSelect = async (method: "credentials" | "google") => {
    if (!client) {
      toast.error("Invalid application configuration");
      return;
    }

    try {
      setIsLoading(method);
      
      if (method === "google") {
        // Get Google auth URL from server
        const { data, error } = await getGoogleAuthUrl({
          variables: {
            clientId,
            redirectUri,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data?.googleAuthUrl) {
          window.location.href = data.googleAuthUrl;
        } else {
          throw new Error("Failed to get authentication URL");
        }
      } else {
        // Handle credentials login
        const params = new URLSearchParams({ client_id: clientId });
        if (redirectUri) params.set("redirect_uri", redirectUri);
        router.push(`/auth/login/credentials?${params.toString()}`);
      }
    } catch (error) {
      console.error("Auth selection error:", error);
      toast.error("Failed to process authentication request");
    } finally {
      setIsLoading(null);
    }
  };

  if (!client) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[420px] space-y-6"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to sign in
        </p>
      </div>

      <GlassCard>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {client.authMethods.includes("credentials") && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full relative overflow-hidden bg-background/50 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect("credentials")}
                  disabled={!!isLoading}
                >
                  {isLoading === "credentials" ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.user className="mr-2 h-4 w-4" />
                  )}
                  Continue with Email
                </Button>
              </motion.div>
            )}
            
            {client.authMethods.includes("google") && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full relative overflow-hidden bg-background/50 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect("google")}
                  disabled={!!isLoading}
                >
                  {isLoading === "google" ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                  )}
                  Continue with Google
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
} 