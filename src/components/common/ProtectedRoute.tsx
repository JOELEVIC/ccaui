"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ChessLoader } from "./ChessLoader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (token && !user && !loading) {
      // Token exists but me not loaded yet - wait a bit
      return;
    }
  }, [token, user, loading, router]);

  if (!loading && !token) {
    return null;
  }

  if (loading) {
    return <ChessLoader message="Loading..." />;
  }

  return <>{children}</>;
}
