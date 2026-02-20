import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type {
  UserProfile,
  UserRole,
  Appointment,
  DashboardStats,
  MonthlyData,
  RecentAppointment,
  ClinicalNote,
  PatientTask,
} from "./types";

// ── Users ──

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null = null
): Promise<UserProfile> {
  const db = getFirebaseDb();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const role: UserRole = email === adminEmail ? "admin" : "paciente";

  const now = Timestamp.now();
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    role,
    phone: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "users", uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: Timestamp.now(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "phone">>
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ── Appointments ──

export async function getAllAppointments(): Promise<Appointment[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "appointments"), orderBy("date", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Appointment);
}

export async function getAppointmentsByProfessional(uid: string): Promise<Appointment[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "appointments"),
      where("professionalId", "==", uid),
      orderBy("date", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Appointment);
}

export async function getAppointmentsByPatient(uid: string): Promise<Appointment[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "appointments"),
      where("userId", "==", uid),
      orderBy("date", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Appointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "appointments", id), { status });
}

// ── Clinical Notes ──

export async function addClinicalNote(
  data: Omit<ClinicalNote, "id" | "createdAt">
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, "clinical_notes"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getNotesByProfessional(uid: string): Promise<ClinicalNote[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "clinical_notes"),
      where("professionalId", "==", uid),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote);
}

export async function getNotesByPatient(patientId: string): Promise<ClinicalNote[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "clinical_notes"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote);
}

// ── Patient Tasks ──

export async function addPatientTask(
  data: Omit<PatientTask, "id" | "createdAt" | "completed">
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, "patient_tasks"), {
    ...data,
    completed: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getTasksByPatient(patientId: string): Promise<PatientTask[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "patient_tasks"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PatientTask);
}

export async function getTasksByProfessional(uid: string): Promise<PatientTask[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "patient_tasks"),
      where("professionalId", "==", uid),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PatientTask);
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "patient_tasks", taskId), { completed });
}

// ── Helpers for webhook ──

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email))
  );
  return snap.empty ? null : (snap.docs[0].data() as UserProfile);
}

export async function getProfessionalUser(): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("role", "==", "profesional"))
  );
  return snap.empty ? null : (snap.docs[0].data() as UserProfile);
}

export async function createAppointment(
  data: Omit<Appointment, "id">
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, "appointments"), data);
  return docRef.id;
}

// ── Stats ──

const SERVICE_PRICES: Record<string, number> = {
  "adaptacion-puesto-trabajo": 45000,
  "atencion-temprana": 40000,
  "babysitting-terapeutico": 35000,
};

export async function getStats(): Promise<DashboardStats> {
  const db = getFirebaseDb();
  const appointmentsRef = collection(db, "appointments");

  const [usersSnap, confirmed, cancelled, completed] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(query(appointmentsRef, where("status", "==", "confirmed"))),
    getCountFromServer(query(appointmentsRef, where("status", "==", "cancelled"))),
    getCountFromServer(query(appointmentsRef, where("status", "==", "completed"))),
  ]);

  // New patients this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newPatientsSnap = await getCountFromServer(
    query(
      collection(db, "users"),
      where("role", "==", "paciente"),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    )
  );

  // Last 6 months of appointments for chart + revenue
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const allAppointmentsSnap = await getDocs(
    query(
      appointmentsRef,
      where("date", ">=", Timestamp.fromDate(sixMonthsAgo)),
      orderBy("date", "desc")
    )
  );

  // Group by month
  const monthlyMap = new Map<string, MonthlyData>();
  let revenueEstimate = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap.set(key, {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    });
  }

  for (const d of allAppointmentsSnap.docs) {
    const data = d.data();
    const date = (data.date as Timestamp).toDate();
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const entry = monthlyMap.get(key);
    if (entry) {
      const status = data.status as string;
      if (status === "confirmed") entry.confirmed++;
      else if (status === "cancelled") entry.cancelled++;
      else if (status === "completed") entry.completed++;
    }
    // Revenue: non-cancelled appointments
    if (data.status !== "cancelled") {
      revenueEstimate += SERVICE_PRICES[data.serviceSlug as string] || 0;
    }
  }

  const monthlyData = Array.from(monthlyMap.values());

  // Recent 5 appointments
  const recentAppointments: RecentAppointment[] = allAppointmentsSnap.docs
    .slice(0, 5)
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userName: data.userName as string,
        serviceName: data.serviceName as string,
        date: data.date as Timestamp,
        status: data.status as RecentAppointment["status"],
      };
    });

  return {
    totalUsers: usersSnap.data().count,
    confirmedAppointments: confirmed.data().count,
    cancelledAppointments: cancelled.data().count,
    completedAppointments: completed.data().count,
    newPatientsThisMonth: newPatientsSnap.data().count,
    revenueEstimate,
    monthlyData,
    recentAppointments,
  };
}
