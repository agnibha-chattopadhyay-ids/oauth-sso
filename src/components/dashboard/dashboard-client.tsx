"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/AuthContext";

export function DashboardClient() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Dashboard
          </h1>
          {user.email && (
            <p className="text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <Icons.logout className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
} 