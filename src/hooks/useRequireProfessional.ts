"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireProfessional() {
  const { user, profile, loading, isProfessional } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!isProfessional) {
        router.replace("/");
      }
    }
  }, [user, loading, isProfessional, router]);

  return { user, profile, loading, isProfessional };
}
