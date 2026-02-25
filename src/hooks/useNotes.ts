"use client";

import { useEffect, useState } from "react";
import {
  onNotesByPatient,
  onNotesByProfessional,
} from "@/lib/firebase/firestore";
import type { ClinicalNote } from "@/lib/firebase/types";

export function usePatientNotes(uid: string | undefined) {
  const [data, setData] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onNotesByPatient(uid, (notes) => {
      setData(notes);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}

export function useProfessionalNotes(uid: string | undefined) {
  const [data, setData] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onNotesByProfessional(uid, (notes) => {
      setData(notes);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}
