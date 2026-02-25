"use client";

import { useState, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import { addPatientTask, toggleTaskCompleted, updatePatientTask, deletePatientTask } from "@/lib/firebase/firestore";
import { uploadTaskAttachment } from "@/lib/firebase/storage";
import type { PatientTask, TaskPriority, TaskAttachment } from "@/lib/firebase/types";

interface TabTareasProps {
  tasks: PatientTask[];
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  onTaskAdded: (task: PatientTask) => void;
  onTaskToggled: (taskId: string, completed: boolean) => void;
  onTaskUpdated: (task: PatientTask) => void;
  onTaskDeleted: (taskId: string) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string; dot: string }> = {
  alta: { label: "Alta", bg: "bg-red/10", text: "text-red", dot: "bg-red" },
  media: { label: "Media", bg: "bg-yellow/15", text: "text-orange", dot: "bg-yellow" },
  baja: { label: "Baja", bg: "bg-green/10", text: "text-green", dot: "bg-green" },
};

function PriorityBadge({ priority }: { priority?: TaskPriority }) {
  if (!priority) return null;
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function DueDateLabel({ dueDate, completed }: { dueDate?: Timestamp | null; completed: boolean }) {
  if (!dueDate) return null;
  const date = dueDate.toDate();
  const now = new Date();
  const isOverdue = !completed && date < now;
  return (
    <span className={`text-[10px] font-medium ${isOverdue ? "text-red" : "text-gray-400"}`}>
      {isOverdue && "Vencida: "}
      {date.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
    </span>
  );
}

function PrioritySelector({ value, onChange }: { value: TaskPriority | ""; onChange: (v: TaskPriority | "") => void }) {
  const options: { key: TaskPriority | ""; label: string }[] = [
    { key: "", label: "Sin prioridad" },
    { key: "alta", label: "Alta" },
    { key: "media", label: "Media" },
    { key: "baja", label: "Baja" },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => {
        const isActive = value === opt.key;
        const colorClass = opt.key
          ? isActive
            ? `${PRIORITY_CONFIG[opt.key].bg} ${PRIORITY_CONFIG[opt.key].text} ring-1 ring-current`
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          : isActive
            ? "bg-gray-200 text-foreground ring-1 ring-gray-300"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200";
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${colorClass}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function TabTareas({
  tasks,
  patientId,
  patientName,
  professionalId,
  professionalName,
  onTaskAdded,
  onTaskToggled,
  onTaskUpdated,
  onTaskDeleted,
}: TabTareasProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<TaskAttachment[]>([]);
  const [driveUrl, setDriveUrl] = useState("");
  const [showDriveInput, setShowDriveInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority | "">("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editAttachments, setEditAttachments] = useState<TaskAttachment[]>([]);
  const [editDriveUrl, setEditDriveUrl] = useState("");
  const [showEditDriveInput, setShowEditDriveInput] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("");
    setDueDate("");
    setPendingAttachments([]);
    setDriveUrl("");
    setShowDriveInput(false);
    setShowForm(false);
  }

  function handleFileSelect(files: FileList | null, target: "create" | "edit") {
    if (!files) return;
    const newAttachments: TaskAttachment[] = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: "file" as const,
      _file: f,
    })) as (TaskAttachment & { _file?: File })[];
    if (target === "create") {
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
    } else {
      setEditAttachments((prev) => [...prev, ...newAttachments]);
    }
  }

  function addDriveLink(url: string, target: "create" | "edit") {
    if (!url.trim()) return;
    const name = url.includes("drive.google.com")
      ? "Google Drive"
      : new URL(url).hostname;
    const attachment: TaskAttachment = { name, url: url.trim(), type: "drive" };
    if (target === "create") {
      setPendingAttachments((prev) => [...prev, attachment]);
      setDriveUrl("");
      setShowDriveInput(false);
    } else {
      setEditAttachments((prev) => [...prev, attachment]);
      setEditDriveUrl("");
      setShowEditDriveInput(false);
    }
  }

  function removeAttachment(index: number, target: "create" | "edit") {
    if (target === "create") {
      setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditAttachments((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleAdd() {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const taskData: Parameters<typeof addPatientTask>[0] = {
        professionalId,
        professionalName,
        patientId,
        patientName,
        title: title.trim(),
        description: description.trim(),
      };
      if (priority) taskData.priority = priority;
      if (dueDate) taskData.dueDate = Timestamp.fromDate(new Date(dueDate + "T23:59:59"));

      const id = await addPatientTask(taskData);

      // Upload file attachments to Storage, keep drive links as-is
      const uploadedAttachments: TaskAttachment[] = [];
      for (const att of pendingAttachments) {
        if (att.type === "drive") {
          uploadedAttachments.push(att);
        } else {
          // att has a blob URL; find the original File from the input
          const fileAtt = att as TaskAttachment & { _file?: File };
          if (fileAtt._file) {
            const uploaded = await uploadTaskAttachment(fileAtt._file, id);
            uploadedAttachments.push(uploaded);
          }
        }
      }

      if (uploadedAttachments.length > 0) {
        taskData.attachments = uploadedAttachments;
        await updatePatientTask(id, { attachments: uploadedAttachments });
      }

      onTaskAdded({
        id,
        ...taskData,
        completed: false,
        createdAt: { toDate: () => new Date() } as PatientTask["createdAt"],
        updatedAt: { toDate: () => new Date() } as PatientTask["updatedAt"],
      });

      // Fire-and-forget email notification
      fetch("/api/tasks/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority || undefined,
          dueDate: dueDate ? new Date(dueDate + "T23:59:59").toISOString() : undefined,
          professionalName,
          attachmentCount: uploadedAttachments.length || undefined,
        }),
      }).catch(() => {});

      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(taskId: string, currentCompleted: boolean) {
    await toggleTaskCompleted(taskId, !currentCompleted);
    onTaskToggled(taskId, !currentCompleted);
  }

  function startEdit(task: PatientTask) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority || "");
    setEditDueDate(
      task.dueDate
        ? task.dueDate.toDate().toISOString().split("T")[0]
        : ""
    );
    setEditAttachments(task.attachments || []);
    setShowEditDriveInput(false);
    setEditDriveUrl("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditAttachments([]);
    setShowEditDriveInput(false);
    setEditDriveUrl("");
  }

  async function handleSaveEdit(task: PatientTask) {
    if (!editTitle.trim()) return;
    setEditSubmitting(true);
    try {
      // Upload any new file attachments
      const finalAttachments: TaskAttachment[] = [];
      for (const att of editAttachments) {
        if (att.type === "drive" || att.url.startsWith("http")) {
          finalAttachments.push(att);
        } else {
          const fileAtt = att as TaskAttachment & { _file?: File };
          if (fileAtt._file) {
            const uploaded = await uploadTaskAttachment(fileAtt._file, task.id);
            finalAttachments.push(uploaded);
          }
        }
      }

      const data: Parameters<typeof updatePatientTask>[1] = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority || undefined,
        dueDate: editDueDate ? Timestamp.fromDate(new Date(editDueDate + "T23:59:59")) : null,
        attachments: finalAttachments,
      };
      await updatePatientTask(task.id, data);
      onTaskUpdated({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority || undefined,
        dueDate: editDueDate
          ? Timestamp.fromDate(new Date(editDueDate + "T23:59:59"))
          : undefined,
        attachments: finalAttachments,
        updatedAt: { toDate: () => new Date() } as PatientTask["updatedAt"],
      });
      setEditingId(null);
      setEditAttachments([]);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm("¿Eliminar esta tarea? Esta accion no se puede deshacer.")) return;
    await deletePatientTask(taskId);
    onTaskDeleted(taskId);
  }

  function TaskItem({ task }: { task: PatientTask }) {
    if (editingId === task.id) {
      return (
        <div className="p-4 rounded-xl bg-white border-2 border-yellow/50 space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Descripcion (opcional)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          />
          <div className="flex flex-wrap items-center gap-3">
            <PrioritySelector value={editPriority} onChange={setEditPriority} />
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green/30"
            />
          </div>
          {/* Edit attachments */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground block">Adjuntos</label>
            <input type="file" ref={editFileInputRef} className="hidden" multiple onChange={(e) => handleFileSelect(e.target.files, "edit")} />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-4 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-semibold">Subir archivo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEditDriveInput(!showEditDriveInput)}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-4 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/>
                </svg>
                <span className="text-sm font-semibold">Link de Drive</span>
              </button>
            </div>
            {showEditDriveInput && (
              <div className="flex gap-2">
                <input type="url" value={editDriveUrl} onChange={(e) => setEditDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30" onKeyDown={(e) => e.key === "Enter" && addDriveLink(editDriveUrl, "edit")} />
                <button type="button" onClick={() => addDriveLink(editDriveUrl, "edit")} disabled={!editDriveUrl.trim()} className="rounded-xl bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors">Agregar</button>
              </div>
            )}
            {editAttachments.length > 0 && (
              <div className="space-y-2">
                {editAttachments.map((att, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${att.type === "drive" ? "bg-blue/10" : "bg-gray-50"}`}>
                    {att.type === "drive" ? (
                      <svg className="h-5 w-5 text-blue flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/></svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    )}
                    <span className={`text-sm font-medium flex-1 truncate ${att.type === "drive" ? "text-blue" : "text-foreground"}`}>{att.name}</span>
                    <button type="button" onClick={() => removeAttachment(i, "edit")} className="p-1 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSaveEdit(task)}
              disabled={editSubmitting || !editTitle.trim()}
              className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
            >
              {editSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-start gap-3 p-4 rounded-xl ${task.completed ? "bg-green/5" : "bg-yellow/10"}`}>
        <button
          onClick={() => handleToggle(task.id, task.completed)}
          className={`mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.completed ? "bg-green border-green" : "border-gray-300 hover:border-green"
          }`}
        >
          {task.completed && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-400" : "text-foreground"}`}>
              {task.title}
            </p>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-[10px] text-gray-400">
              {task.createdAt.toDate().toLocaleDateString("es-CL")}
              {task.completed ? " — Completada" : " — Pendiente"}
            </p>
            <DueDateLabel dueDate={task.dueDate} completed={task.completed} />
          </div>
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {task.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    att.type === "drive"
                      ? "bg-blue/10 text-blue hover:bg-blue/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {att.type === "drive" ? (
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/></svg>
                  ) : (
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  )}
                  <span className="max-w-[150px] truncate">{att.name}</span>
                  <svg className="h-3.5 w-3.5 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
              ))}
            </div>
          )}
        </div>
        {!task.completed && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => startEdit(task)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue hover:bg-blue/10 transition-colors"
              title="Editar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors"
              title="Eliminar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add task */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo de la tarea..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion o instrucciones (opcional)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prioridad</label>
                <PrioritySelector value={priority} onChange={setPriority} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Fecha limite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green/30"
                />
              </div>
            </div>
            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground block">Adjuntos</label>
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileSelect(e.target.files, "create")} />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-5 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-semibold">Subir archivo</span>
                  <span className="text-xs text-gray-400">PDF, imagen, doc... (max 10MB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDriveInput(!showDriveInput)}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-5 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
                >
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/>
                  </svg>
                  <span className="text-sm font-semibold">Link de Google Drive</span>
                  <span className="text-xs text-gray-400">Pega un enlace compartido</span>
                </button>
              </div>
              {showDriveInput && (
                <div className="flex gap-2">
                  <input type="url" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30" onKeyDown={(e) => e.key === "Enter" && addDriveLink(driveUrl, "create")} />
                  <button type="button" onClick={() => addDriveLink(driveUrl, "create")} disabled={!driveUrl.trim()} className="rounded-xl bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors">Agregar</button>
                </div>
              )}
              {pendingAttachments.length > 0 && (
                <div className="space-y-2">
                  {pendingAttachments.map((att, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${att.type === "drive" ? "bg-blue/10" : "bg-gray-50"}`}>
                      {att.type === "drive" ? (
                        <svg className="h-5 w-5 text-blue flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/></svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      )}
                      <span className={`text-sm font-medium flex-1 truncate ${att.type === "drive" ? "text-blue" : "text-foreground"}`}>{att.name}</span>
                      <button type="button" onClick={() => removeAttachment(i, "create")} className="p-1 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={resetForm}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !title.trim()}
              className="rounded-xl bg-yellow px-5 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Creando..." : "Crear Tarea"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-4 text-sm font-medium text-gray-400 hover:border-yellow hover:text-yellow-700 transition-colors"
        >
          + Nueva Tarea
        </button>
      )}

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">Sin tareas asignadas aun.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((t) => <TaskItem key={t.id} task={t} />)}
            </div>
          )}
          {completed.length > 0 && pending.length > 0 && (
            <div className="border-t border-gray-100 pt-3" />
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              {completed.map((t) => <TaskItem key={t.id} task={t} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
