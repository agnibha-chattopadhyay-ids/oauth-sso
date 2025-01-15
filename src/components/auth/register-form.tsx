"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { getDapp } from "@/lib/auth/dapps";
import { toast } from "sonner";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "@/graphql/auth.operations";
import { GlassCard } from "@/components/ui/glass-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BrandIcon } from "@/components/ui/brand-icon";

const registerSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const dappId = searchParams.get("dapp_id") || process.env.NEXT_PUBLIC_DAPP_ID || "default";
  const redirectUri = searchParams.get("redirect_uri");
  const dapp = getDapp(dappId);

  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setIsLoading(true);
      const response = await registerMutation({
        variables: {
          input: {
            name: data.name,
            email: data.email,
            password: data.password,
          },
        },
      });

      if (response.data?.register?.token) {
        toast.success("Account created successfully!");
        
        // Handle redirect with token
        if (redirectUri) {
          try {
            const redirectUrl = new URL(redirectUri);
            // Check if the redirect URL's origin is allowed
            if (dapp?.allowedRedirectUrls?.some(url => redirectUrl.origin === new URL(url).origin)) {
              // Append token to the redirect URL
              redirectUrl.searchParams.set('token', response.data.register.token);
              window.location.href = redirectUrl.toString();
              return;
            }
          } catch (e) {
            console.error("Invalid redirect URL:", e);
          }
        }
        // Default fallback
        router.push(`/auth/login${window.location.search}`);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || "Failed to create account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
      {dapp?.theme?.brandIcon && (
        <BrandIcon src={dapp.theme.brandIcon} />
      )}

      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-dapp-foreground">Create an account</h1>
        <p className="text-sm text-dapp-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <GlassCard className="bg-dapp-card/10 backdrop-blur-md border-dapp-border/20">
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dapp-foreground/90">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="bg-dapp-input text-dapp-foreground border-dapp-border/30 border-2 placeholder:text-dapp-foreground/60 focus:border-dapp-border/50 focus:ring-dapp-ring/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dapp-foreground/90">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="bg-dapp-input text-dapp-foreground border-dapp-border/30 border-2 placeholder:text-dapp-foreground/60 focus:border-dapp-border/50 focus:ring-dapp-ring/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dapp-foreground/90">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-dapp-input text-dapp-foreground border-dapp-border/30 border-2 placeholder:text-dapp-foreground/60 focus:border-dapp-border/50 focus:ring-dapp-ring/30"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-dapp-input/50 text-dapp-foreground/70"
                            onClick={() => setShowPassword(!showPassword)}
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
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="w-full bg-white hover:bg-white/90 text-dapp-background transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.userplus className="mr-2 h-4 w-4" />
                  )}
                  Create Account
                </Button>

                <div className="text-center text-sm">
                  <span className="text-dapp-muted-foreground">Already have an account? </span>
                  <Button
                    variant="link"
                    className="text-dapp-foreground hover:text-dapp-foreground/90 p-0 h-auto font-semibold"
                    onClick={() => router.push(`/auth/login${window.location.search}`)}
                  >
                    Sign in
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
} 