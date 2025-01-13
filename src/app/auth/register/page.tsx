"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { REGISTER_MUTATION } from "@/lib/graphql/auth.operations";
import { useAuth } from "@/lib/auth/AuthContext";
import { getDapp } from "@/lib/auth/dapps";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const { login } = useAuth();

  // Get dapp ID from params or use default
  const dappId = searchParams.get("dapp_id") || process.env.NEXT_PUBLIC_DAPP_ID || "default";
  const redirectUri = searchParams.get("redirect_uri");
  const dapp = getDapp(dappId);

  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const target = event.target as typeof event.target & {
      name: { value: string };
      email: { value: string };
      password: { value: string };
    };

    try {
      const { data } = await registerMutation({
        variables: {
          name: target.name.value,
          email: target.email.value,
          password: target.password.value,
          dappId,
        },
      });

      if (data?.register?.token) {
        toast.success("Account created successfully!");
        login(data.register.token);
        
        // Handle redirect based on dapp configuration
        if (redirectUri && dapp?.allowedRedirectUrls.includes(redirectUri)) {
          window.location.href = `${redirectUri}?token=${data.register.token}`;
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!dapp) {
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
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <GlassCard>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="bg-background/50"
              />
            </div>

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
                className="bg-background/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                  className="bg-background/50"
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

            <Button 
              disabled={isLoading} 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.userplus className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              href={{
                pathname: "/auth/login/credentials",
                query: { dapp_id: dappId, redirect_uri: redirectUri }
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => router.push("/auth/login")}
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to login options
          </Button>
        </CardFooter>
      </GlassCard>
    </motion.div>
  );
} 