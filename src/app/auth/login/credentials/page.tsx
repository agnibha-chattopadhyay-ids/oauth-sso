"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LOGIN_MUTATION } from "@/lib/graphql/auth.operations";
import { useAuth } from "@/lib/auth/AuthContext";
import { clientRegistry } from "@/lib/auth/clients";

export default function CredentialsLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const { login } = useAuth();

  // Get client ID from params or use default
  const clientId = searchParams.get("client_id") || process.env.NEXT_PUBLIC_CLIENT_ID || "default";
  const redirectUri = searchParams.get("redirect_uri");
  const client = clientRegistry.getClient(clientId);

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };

    try {
      const { data } = await loginMutation({
        variables: {
          email: target.email.value,
          password: target.password.value,
          clientId,
        },
      });

      if (data?.login?.token) {
        toast.success("Successfully logged in!");
        login(data.login.token, data.login.refreshToken);
        
        // Handle redirect based on client configuration
        if (redirectUri && client?.allowedRedirectUrls.includes(redirectUri)) {
          const params = new URLSearchParams({
            access_token: data.login.token,
            token_type: "Bearer",
          });
          window.location.href = `${redirectUri}?${params.toString()}`;
        } else {
          router.push(client?.applicationUrl || "/dashboard");
        }
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!client) {
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
            Sign in to {client.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={togglePassword}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.login className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => router.push("/auth/login")}
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to login options
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 