"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { getDapp } from "@/lib/auth/dapps";
import { toast } from "sonner";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GOOGLE_AUTH_URL, LOGIN_MUTATION } from "@/lib/graphql/auth.operations";
import { GlassCard } from "@/components/ui/glass-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/auth/AuthContext';

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const dappId = searchParams.get("dapp_id") || process.env.NEXT_PUBLIC_DAPP_ID || "default";
  const redirectUri = searchParams.get("redirect_uri");
  const dapp = getDapp(dappId);

  const [getGoogleAuthUrl] = useLazyQuery(GOOGLE_AUTH_URL);
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleAuth = async () => {
    if (!dapp) {
      toast.error("Invalid application configuration");
      return;
    }

    try {
      setIsLoading("google");
      const { data, error } = await getGoogleAuthUrl({
        variables: {
          dappId,
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
    } catch (error) {
      console.error("Google auth error:", error);
      toast.error("Failed to process Google authentication");
    } finally {
      setIsLoading(null);
    }
  };

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setIsLoading("credentials");
      
      const response = await loginMutation({
        variables: {
          email: data.email,
          password: data.password,
        }
      });

      const { token } = response.data?.loginUser || {};
      if (token) {
        login(token);
        toast.success("Successfully logged in!");
        
        // Handle redirect with token
        const redirectUri = searchParams.get('redirect_uri');
        if (redirectUri) {
          try {
            const redirectUrl = new URL(redirectUri);
            // Check if the redirect URL's origin is allowed
            if (dapp?.allowedRedirectUrls?.some(url => redirectUrl.origin === new URL(url).origin)) {
              // Append token to the redirect URL
              redirectUrl.searchParams.set('token', token);
              window.location.href = redirectUrl.toString();
              return;
            }
          } catch (e) {
            console.error("Invalid redirect URL:", e);
          }
        }
        // Default fallback
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || "An error occurred during login";
      toast.error(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to sign in
        </p>
      </div>

      <GlassCard>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {dapp.authMethods.includes("credentials") && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <Icons.eyeOff className="h-4 w-4" />
                              ) : (
                                <Icons.eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading === "credentials"}
                  >
                    {isLoading === "credentials" ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.login className="mr-2 h-4 w-4" />
                    )}
                    Sign In
                  </Button>
                </form>
              </Form>
            )}
            
            {dapp.authMethods.includes("google") && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full relative overflow-hidden bg-background/50 hover:bg-accent hover:text-accent-foreground"
                  onClick={handleGoogleAuth}
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