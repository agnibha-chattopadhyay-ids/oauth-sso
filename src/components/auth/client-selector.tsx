"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { clientRegistry } from "@/lib/auth/clients";
import type { AuthMethod } from "@/lib/auth/clients";
import { toast } from "sonner";

interface ClientSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  onClientSelect?: (clientId: string, method: AuthMethod) => void;
}

export function ClientSelector({ className, onClientSelect, ...props }: ClientSelectorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  // Get only the default client
  const defaultClient = clientRegistry.getClient(process.env.NEXT_PUBLIC_CLIENT_ID || 'default');

  const handleSelect = async (method: AuthMethod) => {
    if (!defaultClient) {
      toast.error("Application configuration error");
      return;
    }

    try {
      setIsLoading(method);
      
      if (onClientSelect) {
        await onClientSelect(defaultClient.clientId, method);
      } else {
        const searchParams = new URLSearchParams();
        searchParams.set("client_id", defaultClient.clientId);
        
        if (method === "google") {
          router.push(`/auth/google?${searchParams.toString()}`);
        } else {
          searchParams.set("method", method);
          router.push(`/auth/login?${searchParams.toString()}`);
        }
      }
    } catch (error) {
      console.error("Auth selection error:", error);
      toast.error("Failed to process authentication request");
    } finally {
      setIsLoading(null);
    }
  };

  if (!defaultClient) {
    return null;
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-[420px] space-y-6"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to sign in
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {defaultClient.authMethods.includes("credentials") && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full relative overflow-hidden bg-background hover:bg-accent hover:text-accent-foreground"
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
              
              {defaultClient.authMethods.includes("google") && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full relative overflow-hidden bg-background hover:bg-accent hover:text-accent-foreground"
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
        </Card>
      </motion.div>
    </div>
  );
} 