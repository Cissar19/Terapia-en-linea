# Checklist de Pendientes — Terapia en fácil

## Emails (Resend)
- [ ] Comprar dominio propio (ej: `terapiaenfacil.cl`)
- [ ] Agregar dominio en Resend → https://resend.com/domains
- [ ] Configurar registros DNS (MX, SPF, DKIM) según instrucciones de Resend
- [ ] Verificar dominio en Resend
- [ ] Agregar `RESEND_FROM_EMAIL=citas@tudominio.cl` en `.env.local` y en Vercel
- [ ] Probar envío de email a cualquier correo externo

## Cal.com Webhook (producción)
- [ ] Deploy a Vercel (u otro hosting)
- [ ] Actualizar webhook en Cal.com con URL de producción: `https://tudominio.cl/api/cal-webhook`
- [ ] Verificar que el webhook funciona en producción (hacer reserva de prueba)
- [ ] Desactivar ngrok (solo era para desarrollo local)

## Variables de entorno en Vercel
- [ ] `CAL_WEBHOOK_SECRET` — mismo valor que en Cal.com
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` — base64 del service account JSON
- [ ] `RESEND_API_KEY` — key de Resend
- [ ] `RESEND_FROM_EMAIL` — email con dominio propio verificado
- [ ] Todas las `NEXT_PUBLIC_FIREBASE_*` que ya están en `.env.local`
- [ ] `NEXT_PUBLIC_CAL_USERNAME`
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL`

## Firestore
- [ ] Copiar reglas de `firestore.rules` en Firebase Console → Firestore → Rules → Publicar
- [ ] Verificar que paciente no puede leer datos de otro paciente
- [ ] Limpiar citas de prueba en Firestore (las que tienen servicio vacío)

## Pagos (Webpay / Flow.cl / Transbank)
- [ ] Definir plataforma de pago (Flow.cl o Transbank directo)
- [ ] Integrar pago al flujo de agendamiento
- [ ] Crear webhook de confirmación de pago

## General
- [ ] Asignar rol "profesional" a Bárbara en Firestore (verificar que su usuario tenga `role: "profesional"`)
- [ ] Probar flujo completo: paciente agenda → webhook crea cita → emails llegan → cita aparece en dashboards
- [ ] Configurar dominio personalizado en Vercel
