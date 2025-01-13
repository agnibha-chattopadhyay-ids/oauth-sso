"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { getDapp } from "@/lib/auth/dapps";

type IconType = keyof typeof Icons;

interface ErrorInfo {
  title: string;
  description: string;
  icon: IconType;
  action?: {
    label: string;
    href: string;
  };
}

const ERROR_TYPES: Record<string, ErrorInfo> = {
  default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
    icon: "key",
    action: {
      label: "Try Again",
      href: "/auth/login"
    }
  },
  invalid_dapp: {
    title: "Invalid Application",
    description: "The requested application is not registered or is invalid.",
    icon: "key"
  },
  rate_limited: {
    title: "Too Many Attempts",
    description: "Please wait before trying again.",
    icon: "spinner"
  },
  invalid_credentials: {
    title: "Invalid Credentials",
    description: "The provided credentials are incorrect.",
    icon: "key",
    action: {
      label: "Try Again",
      href: "/auth/login"
    }
  },
  expired_token: {
    title: "Session Expired",
    description: "Your session has expired. Please sign in again.",
    icon: "logout",
    action: {
      label: "Sign In",
      href: "/auth/login"
    }
  }
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState<number | null>(null);

  const error = searchParams.get("error") || "default";
  const errorDescription = searchParams.get("error_description");
  const dappId = searchParams.get("dapp_id");
  const retryAfter = searchParams.get("retry_after");

  const errorInfo = ERROR_TYPES[error] || ERROR_TYPES.default;
  const dapp = dappId ? getDapp(dappId) : undefined;

  useEffect(() => {
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds) && seconds > 0) {
        setCountdown(seconds);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [retryAfter]);

  const handleAction = () => {
    if (errorInfo.action) {
      const url = new URL(errorInfo.action.href, window.location.origin);
      if (dappId) {
        url.searchParams.set("dapp_id", dappId);
      }
      router.push(url.toString());
    }
  };

  const Icon = Icons[errorInfo.icon];

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icon className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {errorInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorDescription || errorInfo.description}
            {countdown !== null && ` (${countdown}s)`}
          </p>
        </div>

        {errorInfo.action && (
          <Button
            onClick={handleAction}
            disabled={countdown !== null}
            style={{ backgroundColor: dapp?.theme?.primaryColor }}
          >
            {errorInfo.action.label}
          </Button>
        )}

        {dapp && (
          <p className="px-8 text-center text-sm text-muted-foreground">
            Return to{" "}
            <a 
              href={dapp.applicationUrl}
              className="underline hover:text-primary"
              style={{ color: dapp.theme?.primaryColor }}
            >
              {dapp.name}
            </a>
          </p>
        )}
      </div>
    </div>
  );
} 