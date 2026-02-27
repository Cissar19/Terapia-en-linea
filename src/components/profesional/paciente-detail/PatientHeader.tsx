import Link from "next/link";
import type { UserProfile } from "@/lib/firebase/types";

interface PatientHeaderProps {
  patientName: string;
  patientEmail: string;
  profile: UserProfile | null;
}

export default function PatientHeader({ patientName, patientEmail, profile }: PatientHeaderProps) {
  const initial = patientName[0]?.toUpperCase() || "P";

  const badges = [
    profile?.birthDate && (() => {
      const birth = new Date(profile.birthDate!);
      const today = new Date();
      let a = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
      return { label: `${a} años`, color: "bg-blue/10 text-blue" };
    })(),
    profile?.residenceCommune && { label: profile.residenceCommune, color: "bg-green/10 text-green" },
    profile?.education && { label: profile.education, color: "bg-yellow/10 text-yellow-700" },
    profile?.diagnoses && { label: profile.diagnoses, color: "bg-pink/10 text-pink" },
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <Link
        href="/profesional/pacientes"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a pacientes
      </Link>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green text-lg font-bold">
          {initial}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-foreground truncate">{patientName}</h1>
          <p className="text-sm text-gray-500">{patientEmail}</p>

          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((b) => (
                <span key={b.label} className={`rounded-full px-3 py-0.5 text-xs font-medium ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Perfil clinico no completado</p>
          )}
        </div>
      </div>
    </div>
  );
}
