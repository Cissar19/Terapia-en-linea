"use client";

import { useEffect, useState } from "react";
import {
  getAllServices,
  addService,
  updateService,
  deleteService,
  getAllProfessionals,
} from "@/lib/firebase/firestore";
import { SEED_SERVICES } from "@/lib/services";
import { formatCLP, formatDuration } from "@/lib/format";
import type { ServiceDoc, UserProfile } from "@/lib/firebase/types";

const COLOR_OPTIONS = ["green", "blue", "yellow", "pink", "orange", "lavender"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type FormData = {
  slug: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  bg: string;
  accent: string;
  color: string;
  features: string[];
  calLink: string;
  assignedProfessionalId: string | null;
  active: boolean;
  order: number;
};

const emptyForm: FormData = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  duration: 60,
  bg: "blue",
  accent: "blue",
  color: "blue",
  features: [""],
  calLink: "",
  assignedProfessionalId: null,
  active: true,
  order: 0,
};

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [svcs, pros] = await Promise.all([
        getAllServices(),
        getAllProfessionals(),
      ]);
      setServices(svcs);
      setProfessionals(pros);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, order: services.length, features: [""] });
    setShowModal(true);
  }

  function openEdit(svc: ServiceDoc) {
    setEditingId(svc.id);
    setForm({
      slug: svc.slug,
      name: svc.name,
      description: svc.description,
      price: svc.price,
      duration: svc.duration,
      bg: svc.bg,
      accent: svc.accent,
      color: svc.color,
      features: svc.features.length > 0 ? [...svc.features] : [""],
      calLink: svc.calLink,
      assignedProfessionalId: svc.assignedProfessionalId,
      active: svc.active,
      order: svc.order,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const features = form.features.filter((f) => f.trim() !== "");
      const data = { ...form, features };

      if (editingId) {
        await updateService(editingId, data);
      } else {
        await addService(data);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Error al guardar. Revisa la consola para más detalles.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(svc: ServiceDoc) {
    try {
      await updateService(svc.id, { active: !svc.active });
      await load();
    } catch (err) {
      console.error("Error toggling active:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteService(id);
      setDeletingId(null);
      await load();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      for (const seed of SEED_SERVICES) {
        await addService(seed);
      }
      await load();
    } catch (err) {
      console.error("Error seeding services:", err);
      alert("Error al crear servicios. Revisa la consola para más detalles.");
    } finally {
      setSeeding(false);
    }
  }

  function updateFeature(index: number, value: string) {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  }

  function addFeature() {
    setForm({ ...form, features: [...form.features, ""] });
  }

  function removeFeature(index: number) {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    const updates: Partial<FormData> = { name };
    if (!editingId) {
      updates.slug = slugify(name);
      updates.calLink = slugify(name);
    }
    setForm((prev) => ({ ...prev, ...updates }));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-5 w-48 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const emptyState = services.length === 0;

  return (
    <>
      {emptyState ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-blue/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No hay servicios configurados</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Puedes crear los 3 servicios iniciales (Adaptación de Puesto, Atención Temprana y Babysitting Terapéutico) con un solo clic, o crear servicios manualmente.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue/90 transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.31 0l-2.83-2.83M9.76 9.76L6.93 6.93" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {seeding ? "Creando..." : "Crear servicios iniciales"}
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear manualmente
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Header with create button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{services.length} servicio{services.length !== 1 ? "s" : ""}</p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Servicio
        </button>
      </div>

      {/* Services table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Duración</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((svc) => (
                <tr key={svc.id} className={`hover:bg-gray-50/50 transition-colors ${!svc.active ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4 text-gray-500 font-mono">{svc.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full bg-${svc.color}`} />
                      <div>
                        <p className="font-semibold text-foreground">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{formatCLP(svc.price)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDuration(svc.duration)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(svc)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        svc.active
                          ? "bg-green/10 text-green hover:bg-green/20"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${svc.active ? "bg-green" : "bg-gray-400"}`} />
                      {svc.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(svc)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue hover:bg-blue/10 transition-colors"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(svc.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Eliminar servicio</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer. Las citas existentes que usen este servicio no se verán afectadas.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red hover:bg-red/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 pt-5 pb-4 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                  placeholder="Ej: Atención Temprana"
                />
              </div>

              {/* Slug + Cal Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                    placeholder="atencion-temprana"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cal.com Event Slug</label>
                  <input
                    type="text"
                    value={form.calLink}
                    onChange={(e) => setForm({ ...form, calLink: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                    placeholder="atencion-temprana"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none resize-none"
                  placeholder="Descripción del servicio..."
                />
              </div>

              {/* Price + Duration + Order */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio (CLP)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                    min={0}
                    step={1000}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duración (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                    min={15}
                    step={15}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                    min={0}
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                {(["bg", "accent", "color"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {field === "bg" ? "Fondo" : field === "accent" ? "Acento" : "Color"}
                    </label>
                    <div className="flex gap-1.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm({ ...form, [field]: c })}
                          className={`h-7 w-7 rounded-full border-2 transition-all bg-${c} ${
                            form[field] === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned Professional */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Profesional asignado</label>
                <select
                  value={form.assignedProfessionalId || ""}
                  onChange={(e) =>
                    setForm({ ...form, assignedProfessionalId: e.target.value || null })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none bg-white"
                >
                  <option value="">Sin asignar</option>
                  {professionals.map((pro) => (
                    <option key={pro.uid} value={pro.uid}>
                      {pro.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Features</label>
                <div className="space-y-2">
                  {form.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue focus:ring-1 focus:ring-blue outline-none"
                        placeholder={`Feature ${i + 1}`}
                      />
                      {form.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-xs font-medium text-blue hover:underline"
                  >
                    + Agregar feature
                  </button>
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue focus:ring-blue/30"
                />
                <span className="text-sm font-medium text-foreground">Servicio activo (visible en la landing)</span>
              </label>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.slug.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue hover:bg-blue/90 transition-colors disabled:opacity-50"
              >
                {saving && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.31 0l-2.83-2.83M9.76 9.76L6.93 6.93" />
                  </svg>
                )}
                {editingId ? "Guardar cambios" : "Crear servicio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
