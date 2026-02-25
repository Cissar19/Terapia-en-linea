"use client";

import { useEffect, useState } from "react";
import {
  onTasksByPatient,
  onTasksByProfessional,
} from "@/lib/firebase/firestore";
import type { PatientTask } from "@/lib/firebase/types";

export function usePatientTasks(uid: string | undefined) {
  const [data, setData] = useState<PatientTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onTasksByPatient(uid, (tasks) => {
      setData(tasks);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}

export function useProfessionalTasks(uid: string | undefined) {
  const [data, setData] = useState<PatientTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onTasksByProfessional(uid, (tasks) => {
      setData(tasks);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}
