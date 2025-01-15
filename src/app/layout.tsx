"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useSearchParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const dapp_id = searchParams.get('dapp_id');

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <AnimatedBackground dappId={dapp_id} />
          <main className="relative flex min-h-screen flex-col">
            <div className="flex flex-1 items-center justify-center p-4">
              {children}
            </div>
          </main>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
