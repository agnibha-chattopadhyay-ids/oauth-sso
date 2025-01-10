import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui/animated-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Authentication Demo",
  description: "A demo of Next.js authentication with GraphQL and Apollo Client",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <AnimatedBackground />
          <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-800/50">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <main className="relative flex min-h-screen flex-col">
              <div className="flex flex-1 items-center justify-center p-4">
                {children}
              </div>
            </main>
          </div>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
