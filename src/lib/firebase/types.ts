import { Timestamp } from "firebase/firestore";

export type UserRole = "paciente" | "profesional" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  phone: string | null;
  calUsername?: string; // Cal.com username — required for professionals
  bio?: string;         // Short bio shown to patients in booking flow
  // Patient clinical data (filled by patient in their profile)
  birthDate?: string | null;
  residenceCommune?: string;
  education?: string;
  diagnoses?: string;
  medications?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  professionalId: string;
  professionalName: string;
  serviceSlug: string;
  serviceName: string;
  date: Timestamp;
  status: AppointmentStatus;
  createdAt: Timestamp;
  notes: string;
  reminderSent?: boolean;
  cancelledAt?: Timestamp;
  cancelledBy?: string;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  professionalId: string;
  patientId: string;
  patientName: string;
  content: string;
  createdAt: Timestamp;
}

export type TaskPriority = "alta" | "media" | "baja";

export interface TaskAttachment {
  name: string;
  url: string;
  type: "file" | "drive";
}

export interface PatientTask {
  id: string;
  professionalId: string;
  professionalName: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  completed: boolean;
  priority?: TaskPriority;
  dueDate?: Timestamp | null;
  attachments?: TaskAttachment[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface MonthlyData {
  month: number;
  year: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface RecentAppointment {
  id: string;
  userName: string;
  serviceName: string;
  date: Timestamp;
  status: AppointmentStatus;
}

export interface DashboardStats {
  totalUsers: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  newPatientsThisMonth: number;
  revenueEstimate: number;
  monthlyData: MonthlyData[];
  recentAppointments: RecentAppointment[];
}

// ── Services ──

export interface ServiceDoc {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;          // CLP, e.g. 45000
  duration: number;       // minutes, e.g. 60
  bg: string;             // color key: "green", "blue", "yellow", etc.
  accent: string;         // accent color key
  color: string;          // timeline/badge color key
  features: string[];
  calLink: string;        // Cal.com event-type slug, e.g. "adaptacion-puesto"
  assignedProfessionalId: string | null;
  active: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlanStatus = "active" | "completed" | "archived";

export interface PlanObjective {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp;
}

export interface InterventionPlan {
  id: string;
  professionalId: string;
  professionalName: string;
  // Patient data
  patientId: string;
  patientName: string;
  age: string;
  residenceCommune: string;
  education: string;
  diagnoses: string;
  medications: string;
  // Occupational profile
  personalHistory: string;
  familyHistory: string;
  medicalHistory: string;
  occupationalHistory: string;
  // Clinical
  occupationalProblem: string;
  interventionFocus: string;
  appliedEvaluations: string;
  interventionModels: string;
  // Objectives
  generalObjective: string;
  specificObjectives: string;
  achievementIndicators: string;
  interventionStrategies: string;
  // Structured objectives & status
  status: PlanStatus;
  objectives: PlanObjective[];
  // Meta
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
