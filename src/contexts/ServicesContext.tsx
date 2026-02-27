"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onActiveServices } from "@/lib/firebase/firestore";
import type { ServiceDoc } from "@/lib/firebase/types";

interface ServicesContextValue {
  services: ServiceDoc[];
  loading: boolean;
  getBySlug: (slug: string) => ServiceDoc | undefined;
}

const ServicesContext = createContext<ServicesContextValue>({
  services: [],
  loading: true,
  getBySlug: () => undefined,
});

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onActiveServices((docs) => {
      setServices(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  function getBySlug(slug: string) {
    return services.find((s) => s.slug === slug);
  }

  return (
    <ServicesContext.Provider value={{ services, loading, getBySlug }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  return useContext(ServicesContext);
}
