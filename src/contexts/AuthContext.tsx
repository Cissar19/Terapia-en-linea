"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { getUserProfile, createUserProfile, updateUserRole } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  isPaciente: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isProfessional: false,
  isPaciente: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          let p = await getUserProfile(firebaseUser.uid);
          // Create profile if it doesn't exist
          if (!p) {
            p = await createUserProfile(
              firebaseUser.uid,
              firebaseUser.email || "",
              firebaseUser.displayName || "Usuario",
              firebaseUser.photoURL
            );
          }
          // Auto-promote admin email & migrate old "user" role
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          if (p && adminEmail && firebaseUser.email === adminEmail && p.role !== "admin") {
            try {
              await updateUserRole(firebaseUser.uid, "admin");
              p = { ...p, role: "admin" };
            } catch (roleErr) {
              console.error("Error updating role to admin:", roleErr);
            }
          } else if (p && (p.role as string) === "user") {
            try {
              await updateUserRole(firebaseUser.uid, "paciente");
              p = { ...p, role: "paciente" };
            } catch (roleErr) {
              console.error("Error migrating role:", roleErr);
            }
          }
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        isProfessional: profile?.role === "profesional",
        isPaciente: profile?.role === "paciente",
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
