"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addInterventionPlan,
  updateInterventionPlan,
  getInterventionPlansByProfessional,
  getAppointmentsByProfessional,
  getUserProfile,
} from "@/lib/firebase/firestore";
import type { InterventionPlan, PlanStatus, PlanObjective } from "@/lib/firebase/types";
import PlanForm, { type PatientOption, type PlanFormSubmission } from "@/components/profesional/plans/PlanForm";
import PlanCard from "@/components/profesional/plans/PlanCard";
import PlanDetail from "@/components/profesional/plans/PlanDetail";
import PlanFilters from "@/components/profesional/plans/PlanFilters";

type ViewState = "list" | "detail" | "form";

export default function PlanesPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const newForPatientId = searchParams.get("newFor") || "";

  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>("list");
  const [selectedPlan, setSelectedPlan] = useState<InterventionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<InterventionPlan | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "all">("all");

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        let plansData: InterventionPlan[] = [];
        try {
          plansData = await getInterventionPlansByProfessional(user!.uid);
        } catch {
          console.warn("No intervention plans found — starting fresh");
        }
        setPlans(plansData);

        const appointments = await getAppointmentsByProfessional(user!.uid);
        const patientMap = new Map<string, { id: string; name: string; email: string }>();
        appointments.forEach((a) => {
          if (!patientMap.has(a.userId)) {
            patientMap.set(a.userId, { id: a.userId, name: a.userName, email: a.userEmail });
          }
        });

        const patients = Array.from(patientMap.values());
        const patientsWithProfiles = await Promise.all(
          patients.map(async (p) => {
            try {
              const prof = await getUserProfile(p.id);
              return { ...p, profile: prof || undefined } as PatientOption;
            } catch {
              return { ...p } as PatientOption;
            }
          })
        );
        setPatientOptions(patientsWithProfiles);
      } catch (err) {
        console.error("Error loading planes data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Auto-open form if newFor param is set
  useEffect(() => {
    if (newForPatientId && !loading) {
      setView("form");
      setEditingPlan(null);
    }
  }, [newForPatientId, loading]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.patientName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [plans, search, statusFilter]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleCreate(data: PlanFormSubmission) {
    if (!user || !profile) return;
    const { objectives, selectedPatientId, ...formFields } = data;
    const id = await addInterventionPlan({
      professionalId: user.uid,
      professionalName: profile.displayName,
      patientId: selectedPatientId,
      ...formFields,
      objectives,
    });

    const now = { toDate: () => new Date(), toMillis: () => Date.now() } as InterventionPlan["createdAt"];
    const newPlan: InterventionPlan = {
      id,
      professionalId: user.uid,
      professionalName: profile.displayName,
      patientId: selectedPatientId,
      ...formFields,
      objectives,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setPlans((prev) => [newPlan, ...prev]);
    setView("list");
    showSuccess("Plan de intervencion creado exitosamente");
  }

  async function handleEdit(data: PlanFormSubmission) {
    if (!editingPlan) return;
    const { objectives, selectedPatientId, ...formFields } = data;
    await updateInterventionPlan(editingPlan.id, { ...formFields, objectives, patientId: selectedPatientId });
    const updated: InterventionPlan = { ...editingPlan, ...formFields, objectives, patientId: selectedPatientId };
    setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updated : p)));
    setSelectedPlan(updated);
    setEditingPlan(null);
    setView("detail");
    showSuccess("Plan actualizado exitosamente");
  }

  function handlePlanUpdated(updated: InterventionPlan) {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPlan(updated);
  }

  // Loading
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Planes de Intervencion</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-48 bg-gray-100 rounded mb-3" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Detail view
  if (view === "detail" && selectedPlan) {
    return (
      <PlanDetail
        plan={selectedPlan}
        onBack={() => { setView("list"); setSelectedPlan(null); }}
        onEdit={() => { setEditingPlan(selectedPlan); setView("form"); }}
        onPlanUpdated={handlePlanUpdated}
      />
    );
  }

  // Form view
  if (view === "form") {
    return (
      <div>
        <PlanForm
          mode={editingPlan ? "edit" : "create"}
          initialData={editingPlan ?? undefined}
          patientOptions={patientOptions}
          preselectedPatientId={editingPlan ? undefined : newForPatientId}
          onSubmit={editingPlan ? handleEdit : handleCreate}
          onCancel={() => {
            setEditingPlan(null);
            setView(selectedPlan ? "detail" : "list");
          }}
        />
      </div>
    );
  }

  // List view
  return (
    <div>
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-down">
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Planes de Intervencion</h1>
          <p className="text-sm text-gray-500 mt-1">{plans.length} planes creados</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setView("form"); }}
          className="flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green/90 transition-colors shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear Plan
        </button>
      </div>

      {plans.length > 0 && (
        <PlanFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      {filteredPlans.length === 0 && plans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-green/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-1">Aun no hay planes de intervencion.</p>
          <p className="text-xs text-gray-300 mb-6">Crea el primer plan para un paciente.</p>
          <button
            onClick={() => { setEditingPlan(null); setView("form"); }}
            className="rounded-xl bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green/90 transition-colors"
          >
            Crear primer plan
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400">No se encontraron planes con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => { setSelectedPlan(plan); setView("detail"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
