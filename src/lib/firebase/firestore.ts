import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  getCountFromServer,
  onSnapshot,
  type Unsubscribe,
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
  InterventionPlan,
  PlanStatus,
  ServiceDoc,
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
  data: Partial<Pick<UserProfile, "displayName" | "phone" | "photoURL" | "birthDate" | "residenceCommune" | "education" | "diagnoses" | "medications">>
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
      where("professionalId", "==", uid)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Appointment)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function getAppointmentsByPatient(uid: string): Promise<Appointment[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "appointments"),
      where("userId", "==", uid)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Appointment)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
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
      where("professionalId", "==", uid)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function getNotesByPatient(patientId: string): Promise<ClinicalNote[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "clinical_notes"),
      where("patientId", "==", patientId)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

// ── Patient Tasks ──

export async function addPatientTask(
  data: Omit<PatientTask, "id" | "createdAt" | "completed" | "updatedAt">
): Promise<string> {
  const db = getFirebaseDb();
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, "patient_tasks"), {
    ...data,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getTasksByPatient(patientId: string): Promise<PatientTask[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "patient_tasks"),
      where("patientId", "==", patientId)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PatientTask)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function getTasksByProfessional(uid: string): Promise<PatientTask[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "patient_tasks"),
      where("professionalId", "==", uid)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PatientTask)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "patient_tasks", taskId), { completed });
}

export async function updatePatientTask(
  taskId: string,
  data: Partial<Pick<PatientTask, "title" | "description" | "priority" | "dueDate" | "attachments">>
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "patient_tasks", taskId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deletePatientTask(taskId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "patient_tasks", taskId));
}

// ── Helpers for webhook ──

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email))
  );
  return snap.empty ? null : (snap.docs[0].data() as UserProfile);
}

export async function getAllProfessionals(): Promise<UserProfile[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("role", "==", "profesional"))
  );
  return snap.docs.map((d) => d.data() as UserProfile);
}

// Keep legacy single-professional helper for webhook compatibility
export async function getProfessionalUser(): Promise<UserProfile | null> {
  const professionals = await getAllProfessionals();
  return professionals.length > 0 ? professionals[0] : null;
}

export async function createAppointment(
  data: Omit<Appointment, "id">
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, "appointments"), data);
  return docRef.id;
}

// ── Stats ──

export async function getStats(): Promise<DashboardStats> {
  const db = getFirebaseDb();
  const appointmentsRef = collection(db, "appointments");

  // Build slug→price map from services collection
  const servicesSnap = await getDocs(collection(db, "services"));
  const servicePrices: Record<string, number> = {};
  for (const d of servicesSnap.docs) {
    const data = d.data();
    servicePrices[data.slug as string] = (data.price as number) || 0;
  }

  const [usersSnap, confirmed, cancelled, completed] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(query(appointmentsRef, where("status", "==", "confirmed"))),
    getCountFromServer(query(appointmentsRef, where("status", "==", "cancelled"))),
    getCountFromServer(query(appointmentsRef, where("status", "==", "completed"))),
  ]);

  // New patients this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthTs = Timestamp.fromDate(startOfMonth);
  const allPatientsSnap = await getDocs(
    query(
      collection(db, "users"),
      where("role", "==", "paciente")
    )
  );
  const newPatientsCount = allPatientsSnap.docs.filter(
    (d) => d.data().createdAt && (d.data().createdAt as Timestamp).toMillis() >= startOfMonthTs.toMillis()
  ).length;

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
      revenueEstimate += servicePrices[data.serviceSlug as string] || 0;
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
    newPatientsThisMonth: newPatientsCount,
    revenueEstimate,
    monthlyData,
    recentAppointments,
  };
}

// ── Intervention Plans ──

export async function addInterventionPlan(
  data: Omit<InterventionPlan, "id" | "createdAt" | "updatedAt" | "status" | "objectives"> &
    Partial<Pick<InterventionPlan, "status" | "objectives">>
): Promise<string> {
  const db = getFirebaseDb();
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, "intervention_plans"), {
    ...data,
    status: data.status ?? "active",
    objectives: data.objectives ?? [],
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

function normalizePlan(d: { id: string; data: () => Record<string, unknown> }): InterventionPlan {
  const raw = d.data();
  return {
    ...raw,
    id: d.id,
    status: (raw.status as PlanStatus) ?? "active",
    objectives: (raw.objectives as InterventionPlan["objectives"]) ?? [],
  } as InterventionPlan;
}

export async function getInterventionPlansByProfessional(
  uid: string
): Promise<InterventionPlan[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "intervention_plans"),
      where("professionalId", "==", uid)
    )
  );
  return snap.docs
    .map((d) => normalizePlan({ id: d.id, data: () => d.data() }))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function getInterventionPlansByPatient(
  patientId: string
): Promise<InterventionPlan[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "intervention_plans"),
      where("patientId", "==", patientId)
    )
  );
  return snap.docs
    .map((d) => normalizePlan({ id: d.id, data: () => d.data() }))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function getActivePlanForPatient(
  patientId: string
): Promise<InterventionPlan | null> {
  const plans = await getInterventionPlansByPatient(patientId);
  return plans.find((p) => p.status === "active") ?? null;
}

export async function getInterventionPlan(
  id: string
): Promise<InterventionPlan | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "intervention_plans", id));
  return snap.exists()
    ? normalizePlan({ id: snap.id, data: () => snap.data() })
    : null;
}

export async function updateInterventionPlan(
  id: string,
  data: Partial<Omit<InterventionPlan, "id" | "createdAt">>
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "intervention_plans", id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ── Cancel appointment (patient) ──

export async function cancelAppointmentByPatient(id: string, userId: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "appointments", id), {
    status: "cancelled",
    cancelledAt: Timestamp.now(),
    cancelledBy: userId,
  });
}

// ── Real-time listeners (onSnapshot) ──

export function onAppointmentsByPatient(
  uid: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "appointments"), where("userId", "==", uid)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Appointment)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis());
      callback(results);
    }
  );
}

export function onAppointmentsByProfessional(
  uid: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "appointments"), where("professionalId", "==", uid)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Appointment)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis());
      callback(results);
    }
  );
}

export function onTasksByPatient(
  patientId: string,
  callback: (tasks: PatientTask[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "patient_tasks"), where("patientId", "==", patientId)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as PatientTask)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(results);
    }
  );
}

export function onTasksByProfessional(
  uid: string,
  callback: (tasks: PatientTask[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "patient_tasks"), where("professionalId", "==", uid)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as PatientTask)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(results);
    }
  );
}

export function onNotesByPatient(
  patientId: string,
  callback: (notes: ClinicalNote[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "clinical_notes"), where("patientId", "==", patientId)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(results);
    }
  );
}

export function onNotesByProfessional(
  uid: string,
  callback: (notes: ClinicalNote[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(collection(db, "clinical_notes"), where("professionalId", "==", uid)),
    (snap) => {
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ClinicalNote)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(results);
    }
  );
}

// ── Services CRUD ──

export async function getAllServices(): Promise<ServiceDoc[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, "services"), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceDoc);
}

export async function getActiveServices(): Promise<ServiceDoc[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, "services"),
      where("active", "==", true),
      orderBy("order", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceDoc);
}

export async function addService(
  data: Omit<ServiceDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getFirebaseDb();
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, "services"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateService(
  id: string,
  data: Partial<Omit<ServiceDoc, "id" | "createdAt">>
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "services", id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteService(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "services", id));
}

export function onActiveServices(
  callback: (services: ServiceDoc[]) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    query(
      collection(db, "services"),
      where("active", "==", true),
      orderBy("order", "asc")
    ),
    (snap) => {
      const results = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ServiceDoc
      );
      callback(results);
    }
  );
}
