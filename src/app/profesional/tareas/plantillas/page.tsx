"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfessionalTemplates } from "@/hooks/useTaskTemplates";
import RichTextarea from "@/components/RichTextarea";
import MarkdownContent from "@/components/MarkdownContent";
import {
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/lib/firebase/firestore";
import type { TaskTemplate, TaskPriority, TaskAttachment } from "@/lib/firebase/types";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  alta: { label: "Alta", bg: "bg-red/10", text: "text-red" },
  media: { label: "Media", bg: "bg-yellow/15", text: "text-orange" },
  baja: { label: "Baja", bg: "bg-green/10", text: "text-green" },
};

const ALL_CATEGORIES = "Todas";

interface FormState {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority | "";
  defaultDueDays: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  priority: "",
  defaultDueDays: "",
};

export default function PlantillasPage() {
  const { user, profile } = useAuth();
  const { data: templates, loading } = useProfessionalTemplates(user?.uid);

  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Derive categories from existing templates
  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)));
    return cats.sort();
  }, [templates]);

  // Existing categories for autocomplete suggestions
  const categorySuggestions = useMemo(
    () => categories.filter((c) => c.toLowerCase().includes(form.category.toLowerCase()) && c !== form.category),
    [categories, form.category]
  );

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = categoryFilter === ALL_CATEGORIES || t.category === categoryFilter;
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [templates, categoryFilter, search]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(t: TaskTemplate) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority || "",
      defaultDueDays: t.defaultDueDays != null ? String(t.defaultDueDays) : "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.category.trim() || !user) return;
    setSubmitting(true);
    try {
      const data = {
        professionalId: user.uid,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        ...(form.priority ? { priority: form.priority as TaskPriority } : {}),
        ...(form.defaultDueDays ? { defaultDueDays: parseInt(form.defaultDueDays, 10) } : {}),
        attachments: [] as TaskAttachment[],
      };
      if (editingId) {
        await updateTaskTemplate(editingId, data);
      } else {
        await addTaskTemplate(data);
      }
      cancelForm();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta plantilla? No afecta las tareas ya asignadas.")) return;
    setDeletingId(id);
    try {
      await deleteTaskTemplate(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="bg-lavender-light rounded-3xl p-6 mb-6 animate-pulse">
          <div className="h-6 w-48 bg-lavender rounded mb-2" />
          <div className="h-4 w-32 bg-lavender rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative bg-lavender-light rounded-3xl p-6 md:p-8 mb-6 overflow-hidden animate-fade-in-up">
        <svg className="absolute top-3 right-8 h-8 w-8 text-pink/30 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,20 2,20" />
        </svg>
        <svg className="absolute bottom-4 right-28 h-6 w-6 text-blue/20 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/profesional/tareas" className="text-sm text-gray-400 hover:text-foreground transition-colors">
                Tareas
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-foreground">Plantillas</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">Banco de Plantillas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {templates.length} plantilla{templates.length !== 1 ? "s" : ""} · Reutiliza tareas frecuentes en segundos
            </p>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-colors flex-shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva plantilla
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-foreground mb-4">
            {editingId ? "Editar plantilla" : "Nueva plantilla"}
          </h2>
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Ejercicio de pinza tripodal"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Instrucciones</label>
              <RichTextarea
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="Describe cómo realizar la tarea..."
                minRows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div className="relative">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Categoría *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ej: AVD, Motricidad..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categorySuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prioridad por defecto</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority | "" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-white"
                >
                  <option value="">Sin prioridad</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              {/* Default due days */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Plazo por defecto (días)</label>
                <input
                  type="number"
                  min="1"
                  value={form.defaultDueDays}
                  onChange={(e) => setForm({ ...form, defaultDueDays: e.target.value })}
                  placeholder="Ej: 7"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={cancelForm}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.category.trim()}
              className="rounded-xl bg-foreground px-6 py-2 text-sm font-semibold text-white hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear plantilla"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {templates.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5 animate-fade-in-up animation-delay-1">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plantillas..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-white"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {[ALL_CATEGORIES, ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-foreground text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center animate-fade-in-up animation-delay-1">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-pink/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base font-bold text-foreground mb-2">Sin plantillas aún</p>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Crea tu primera plantilla para reutilizarla rápidamente en cualquier paciente.
          </p>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:bg-foreground/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear primera plantilla
          </button>
        </div>
      )}

      {/* No results */}
      {templates.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-fade-in-up">
          <p className="text-sm text-gray-400">Sin resultados para esta búsqueda.</p>
        </div>
      )}

      {/* Templates grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up animation-delay-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
            >
              {/* Category + priority */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block rounded-full bg-lavender-light px-2.5 py-1 text-[10px] font-bold text-foreground uppercase tracking-wide">
                  {t.category}
                </span>
                <div className="flex items-center gap-1.5">
                  {t.priority && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CONFIG[t.priority].bg} ${PRIORITY_CONFIG[t.priority].text}`}>
                      {PRIORITY_CONFIG[t.priority].label}
                    </span>
                  )}
                  {t.usageCount > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      ×{t.usageCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <p className="text-sm font-bold text-foreground mb-1 leading-snug">{t.title}</p>

              {/* Description */}
              {t.description && (
                <div className="mb-3 line-clamp-3">
                  <MarkdownContent content={t.description} className="text-xs text-gray-500" />
                </div>
              )}

              {/* Due days */}
              {t.defaultDueDays != null && (
                <div className="flex items-center gap-1.5 mb-3">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] text-gray-400">Plazo: {t.defaultDueDays} día{t.defaultDueDays !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                <button
                  onClick={() => startEdit(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-blue/10 hover:text-blue transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-red/10 hover:text-red transition-colors disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deletingId === t.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
