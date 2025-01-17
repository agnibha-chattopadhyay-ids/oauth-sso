"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const dapp_id = searchParams.get('dapp_id');

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            404 - Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 