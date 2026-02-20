import { Timestamp } from "firebase/firestore";

export type UserRole = "paciente" | "profesional" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  phone: string | null;
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

export interface PatientTask {
  id: string;
  professionalId: string;
  professionalName: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
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
