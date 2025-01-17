"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

function MainContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const dapp_id = searchParams.get('dapp_id');

  return (
    <main className="relative flex min-h-screen flex-col">
      <AnimatedBackground dappId={dapp_id} />
      <div className="flex flex-1 items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </main>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <MainContent>{children}</MainContent>
          </Suspense>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
