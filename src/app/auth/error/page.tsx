"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { clientRegistry } from "@/lib/auth/clients";

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
    description: "An unexpected error occurred during authentication. Please try again.",
    icon: "key",
    action: {
      label: "Try Again",
      href: "/",
    },
  },
  invalid_client: {
    title: "Invalid Client",
    description: "The application requesting authentication is not registered or is invalid.",
    icon: "key",
    action: {
      label: "Return Home",
      href: "/",
    },
  },
  invalid_request: {
    title: "Invalid Request",
    description: "The authentication request was malformed or missing required parameters.",
    icon: "key",
    action: {
      label: "Try Again",
      href: "/",
    },
  },
  invalid_redirect_uri: {
    title: "Invalid Redirect",
    description: "The requested redirect URL is not allowed for this application.",
    icon: "key",
    action: {
      label: "Return Home",
      href: "/",
    },
  },
  unauthorized: {
    title: "Unauthorized",
    description: "You are not authorized to access this resource.",
    icon: "user",
    action: {
      label: "Sign In",
      href: "/auth/login",
    },
  },
  rate_limited: {
    title: "Too Many Attempts",
    description: "You have made too many attempts. Please try again later.",
    icon: "spinner",
  },
  session_expired: {
    title: "Session Expired",
    description: "Your session has expired. Please sign in again.",
    icon: "spinner",
    action: {
      label: "Sign In",
      href: "/auth/login",
    },
  },
  auth_failed: {
    title: "Authentication Failed",
    description: "Failed to authenticate with the selected provider.",
    icon: "key",
    action: {
      label: "Try Again",
      href: "/",
    },
  },
  access_denied: {
    title: "Access Denied",
    description: "The authentication request was denied.",
    icon: "key",
    action: {
      label: "Return Home",
      href: "/",
    },
  },
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState<number | null>(null);

  const error = searchParams.get("error") || "default";
  const errorDescription = searchParams.get("error_description");
  const clientId = searchParams.get("client_id");
  const retryAfter = searchParams.get("retry_after");

  const errorInfo = ERROR_TYPES[error] || ERROR_TYPES.default;
  const client = clientId ? clientRegistry.getClient(clientId) : undefined;

  // Handle countdown for rate limiting
  useEffect(() => {
    if (error === "rate_limited" && retryAfter) {
      const retryTime = parseInt(retryAfter, 10);
      if (!isNaN(retryTime)) {
        setCountdown(retryTime);
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
  }, [error, retryAfter]);

  const IconComponent = Icons[errorInfo.icon];

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {client?.theme?.primaryColor && IconComponent && (
            <div 
              className="mx-auto mb-4 rounded-full p-3"
              style={{ 
                backgroundColor: `${client.theme.primaryColor}20`,
                color: client.theme.primaryColor 
              }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            {errorInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorDescription || errorInfo.description}
          </p>
          {countdown !== null && (
            <p className="text-sm font-medium text-muted-foreground">
              Please try again in {countdown} seconds
            </p>
          )}
        </div>

        {errorInfo.action && countdown === null && (
          <Button
            onClick={() => router.push(errorInfo.action!.href)}
            style={client?.theme?.primaryColor ? {
              backgroundColor: client.theme.primaryColor,
              borderColor: client.theme.primaryColor,
            } : undefined}
          >
            {errorInfo.action.label}
          </Button>
        )}

        {client && (
          <p className="px-8 text-center text-sm text-muted-foreground">
            Return to{" "}
            <a 
              href={client.applicationUrl}
              className="underline hover:text-primary"
              style={{ color: client.theme?.primaryColor }}
            >
              {client.name}
            </a>
          </p>
        )}
      </div>
    </div>
  );
} 