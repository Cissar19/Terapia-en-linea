# Plan: Real-time Listeners + Cancelacion de Citas

## Feature 3: Listeners en tiempo real (onSnapshot)

### 3.1 Funciones onSnapshot en firestore.ts
- [x] Importar `onSnapshot` y `Unsubscribe` de firebase/firestore
- [x] `onAppointmentsByPatient`
- [x] `onAppointmentsByProfessional`
- [x] `onTasksByPatient`
- [x] `onTasksByProfessional`
- [x] `onNotesByPatient`
- [x] `onNotesByProfessional`

### 3.2 Hooks reutilizables
- [x] `src/hooks/useAppointments.ts` — `usePatientAppointments`, `useProfessionalAppointments`
- [x] `src/hooks/useTasks.ts` — `usePatientTasks`, `useProfessionalTasks`
- [x] `src/hooks/useNotes.ts` — `usePatientNotes`, `useProfessionalNotes`

### 3.3 Migrar paginas del paciente
- [x] `src/app/mi-panel/page.tsx` — hooks en vez de Promise.all + getDocs
- [x] `src/app/mi-panel/tareas/page.tsx` — usePatientTasks en vez de getDocs

### 3.4 Migrar paginas del profesional
- [x] `src/app/profesional/page.tsx` — hooks (plans queda con getDocs)
- [x] `src/app/profesional/citas/page.tsx` — useProfessionalAppointments
- [x] `src/app/profesional/notas/page.tsx` — useProfessionalNotes + useProfessionalAppointments
- [x] `src/app/profesional/pacientes/page.tsx` — los 3 hooks profesional

---

## Feature 4: Cancelacion de citas por paciente

### 4.1 Tipos y funcion
- [x] Agregar `cancelledAt?` y `cancelledBy?` a Appointment en types.ts
- [x] Agregar `cancelAppointmentByPatient(id, userId)` en firestore.ts

### 4.2 Reglas de Firestore
- [x] Paciente puede actualizar solo `status`, `cancelledAt`, `cancelledBy` en citas confirmadas propias
- [ ] `firebase deploy --only firestore:rules`

### 4.3 Modal de cancelacion
- [x] `src/components/paciente/CancelAppointmentModal.tsx`
- [x] Politica: cancelar hasta 24 horas antes
- [x] Mensaje de bloqueo si faltan <24h

### 4.4 Integracion en panel del paciente
- [x] Boton "Cancelar" en cada cita proxima en mi-panel/page.tsx
- [x] Renderizar CancelAppointmentModal

---

## Verificacion
- [x] `npm run build` sin errores de TypeScript
- [ ] Probar `/mi-panel` como paciente — datos cargan en tiempo real
- [ ] Probar `/profesional` como profesional — datos cargan en tiempo real
- [ ] Profesional completa cita en una pestana → paciente ve el cambio sin recargar
- [ ] Paciente cancela cita proxima (>24h) → estado cambia a "cancelled"
- [ ] Paciente intenta cancelar cita (<24h) → modal muestra que no se puede
- [ ] `firebase deploy --only firestore:rules` exitoso

---

## Pendientes generales (para despues)
- [x] Paginacion en listas de citas/notas/tareas
- [x] Validacion de telefono formato chileno (+56)
- [x] Verificacion de email al registrarse
- [x] Notificaciones cuando el profesional asigna tareas nuevas
- [x] Paciente pueda ver planes archivados (no solo el activo)
- [x] Manejo de errores visible al usuario (en vez de `.catch(() => [])`)
- [x] Verificar que webhook Cal.com efectivamente crea cita en Firestore
- [x] Cleanup de Blob URLs (`revokeObjectURL`) en uploads
- [x] Duraciones de servicio desde configuracion (no hardcodeadas en Timeline)
- [x] Boton de logout en el sidebar del paciente
- [x] Mejorar auto-fill del plan: boton "Sincronizar datos" en modo edicion

