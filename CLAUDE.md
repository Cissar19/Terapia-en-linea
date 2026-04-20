# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto
**Terapia en Fácil** — plataforma de terapia ocupacional en Chile con landing page pública, agendamiento vía Cal.com y tres portales autenticados (paciente, profesional, admin).

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 (configuración en `globals.css` con `@theme`)
- Firebase (Auth + Firestore client-side), Firebase Admin SDK (server-side en API routes)
- Cal.com (`@calcom/embed-react`) — integración de booking por embed
- Resend — envío de correos transaccionales
- `firebase-admin` se inicializa lazy en `src/lib/firebase/admin.ts`; el service account va en `FIREBASE_SERVICE_ACCOUNT_KEY` como JSON en base64

## Comandos
```bash
npm run dev    # servidor de desarrollo
npm run build  # build de producción
npm run lint   # ESLint
```

## Arquitectura de rutas

```
/                        → landing page pública (LandingPage.tsx)
/login                   → autenticación Firebase
/registro                → creación de cuenta
/agendar/[slug]          → página de booking para un servicio por slug

/mi-panel                → portal paciente (role: paciente)
/mi-panel/plan           → plan de intervención activo del paciente
/mi-panel/tareas         → tareas asignadas por el profesional
/mi-panel/perfil         → perfil clínico del paciente

/profesional             → portal profesional (role: profesional)
/profesional/citas       → agenda del profesional (timeline diario)
/profesional/pacientes   → lista de pacientes
/profesional/pacientes/[id] → detalle de paciente con tabs
/profesional/notas       → notas clínicas
/profesional/planes      → planes de intervención
/profesional/perfil      → perfil del profesional (incluye calUsername)

/admin                   → dashboard admin (role: admin)
/admin/citas             → todas las citas
/admin/sesiones          → gestión de sesiones
/admin/usuarios          → gestión de usuarios y roles
```

**API Routes:**
- `POST /api/cal-webhook` — recibe eventos de Cal.com (`BOOKING_CREATED`, `BOOKING_CANCELLED`), crea/cancela citas en Firestore y envía correos via Resend. Verifica firma HMAC-SHA256 con `CAL_WEBHOOK_SECRET`.
- `GET /api/cron/reminders` — envía recordatorios 24h antes de la cita. Protegido por `Authorization: Bearer <CRON_SECRET>`.
- `GET /api/admin/users` — lista usuarios (solo admin).
- `POST /api/tasks/notify` — notificación de tareas.

## Sistema de autenticación y roles

`AuthContext` (`src/contexts/AuthContext.tsx`) envuelve toda la app y expone `{ user, profile, loading, isAdmin, isProfessional, isPaciente }`.

Roles en Firestore (`UserProfile.role`): `"paciente"` | `"profesional"` | `"admin"`.
- El admin se auto-promueve por email (`NEXT_PUBLIC_ADMIN_EMAIL`).
- Hooks de protección: `useRequireAuth`, `useRequireAdmin`, `useRequireProfessional`.
- Los layouts de cada portal (`/admin/layout.tsx`, `/profesional/layout.tsx`, `/mi-panel/layout.tsx`) usan estos hooks para redirigir si el rol no corresponde.

## Colecciones Firestore

| Colección | Descripción |
|---|---|
| `users` | Perfiles (`UserProfile`): uid, email, displayName, role, phone, calUsername, datos clínicos del paciente |
| `appointments` | Citas (`Appointment`): userId, professionalId, serviceSlug, date, status (`confirmed`/`cancelled`/`completed`), reminderSent |
| `clinical_notes` | Notas clínicas (`ClinicalNote`): appointmentId, professionalId, patientId |
| `patient_tasks` | Tareas (`PatientTask`): professionalId, patientId, title, completed, priority, dueDate, attachments |
| `intervention_plans` | Planes (`InterventionPlan`): perfil ocupacional completo, objetivos estructurados, status (`active`/`completed`/`archived`) |
| `services` | Servicios (`ServiceDoc`): slug, price, duration, calLink, assignedProfessionalId, active, order |

`src/lib/firebase/firestore.ts` contiene todas las funciones CRUD client-side. Para operaciones server-side (API routes, cron) se usa `src/lib/firebase/admin.ts`.

Los listeners real-time (`onSnapshot`) están en `firestore.ts` como funciones `on*` (p.ej. `onAppointmentsByPatient`, `onTasksByPatient`).

## Servicios y Cal.com

Los servicios se almacenan en Firestore (`services`) y se cargan via `ServicesContext` (`src/contexts/ServicesContext.tsx`). `src/lib/services.ts` convierte un `ServiceDoc` al shape de UI (`Service`) y tiene `SEED_SERVICES` para inicialización desde admin.

El campo `calLink` en `ServiceDoc` es el slug del event-type en Cal.com (e.g. `"adaptacion-puesto"`). La URL completa se forma como `{calUsername}/{calLink}` usando `NEXT_PUBLIC_CAL_USERNAME`.

El profesional tiene `calUsername` en su `UserProfile`, que se usa en la página `/agendar/[slug]` para construir el embed de Cal.com.

## Variables de entorno requeridas

```bash
# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin (servidor, JSON base64)
FIREBASE_SERVICE_ACCOUNT_KEY

# Lógica de negocio
NEXT_PUBLIC_ADMIN_EMAIL        # email que se auto-promueve a admin
NEXT_PUBLIC_CAL_USERNAME       # username de Cal.com del profesional

# Integraciones
CAL_WEBHOOK_SECRET             # HMAC secret del webhook de Cal.com
RESEND_API_KEY                 # API key de Resend
RESEND_FROM_EMAIL              # dirección "from" de correos
CRON_SECRET                    # token Bearer para /api/cron/reminders
```

## Diseño y Colores

Estilo visual inspirado en SuperHi: colorido, playful, formas geométricas SVG flotantes. **Sin dark mode.**

Paleta definida en `globals.css` con `@theme`:
- Lavender `#D5D0F7`/`#E8E4FF`, Azul `#4361EE`/`#A5D8FF`, Verde `#2DC653`/`#C3FAE8`
- Amarillo `#FFD43B`/`#FFF3BF`, Rosa `#FF6B9D`/`#FFD6E7`, Naranja `#FF8C42`
- Foreground `#1a1a2e`

Animaciones CSS custom: `animate-float`, `animate-float-delayed`, `animate-float-slow`, `animate-wiggle`, `animate-spin-slow`.

Los colores de servicios usan claves de texto (`"green"`, `"blue"`, etc.) que se resuelven a clases Tailwind via lookup tables en `src/lib/services.ts` — agregar clases nuevas ahí si se extienden colores.

## Idioma
Todo el contenido en español (Chile). Fechas con `toLocaleDateString("es-CL", { timeZone: "America/Santiago" })`.
