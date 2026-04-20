"use client";

import { useEffect, useState } from "react";
import { onTaskTemplatesByProfessional } from "@/lib/firebase/firestore";
import type { TaskTemplate } from "@/lib/firebase/types";

export function useProfessionalTemplates(uid: string | undefined) {
  const [data, setData] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onTaskTemplatesByProfessional(uid, (templates) => {
      setData(templates);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}
