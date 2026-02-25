"use client";

import { useEffect, useState } from "react";
import {
  onAppointmentsByPatient,
  onAppointmentsByProfessional,
} from "@/lib/firebase/firestore";
import type { Appointment } from "@/lib/firebase/types";

export function usePatientAppointments(uid: string | undefined) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onAppointmentsByPatient(uid, (appointments) => {
      setData(appointments);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}

export function useProfessionalAppointments(uid: string | undefined) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onAppointmentsByProfessional(uid, (appointments) => {
      setData(appointments);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { data, loading };
}
