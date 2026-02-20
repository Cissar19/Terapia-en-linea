"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAdmin() {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/");
      }
    }
  }, [user, loading, isAdmin, router]);

  return { user, profile, loading, isAdmin };
}
