import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Authentication Demo",
  description: "A demo of Next.js authentication with GraphQL and Apollo Client",
};

export default function HomePage() {
  redirect("/auth/login");
}
