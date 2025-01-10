'use client';

import { redirect } from "next/navigation";
import { useEffect } from "react";
import { getStorageItem } from "@/lib/utils/storage";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || 'default';
    const token = getStorageItem(`auth_token_${clientId}`);

    if (!token) {
      redirect("/auth/login");
    }
  }, []);

  return <DashboardClient />;
} 