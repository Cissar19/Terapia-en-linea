# CLAUDE.md — Terapia Ocupacional Web

## Proyecto
Landing page para servicio de Terapia Ocupacional en Chile. Agendamiento online con pago vía Webpay (Flow.cl/Transbank).

## Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — linting con ESLint

## Estructura
```
src/
  app/
    globals.css      — colores, animaciones, utilidades CSS
    layout.tsx       — layout raíz (fuentes Geist, metadata SEO)
    page.tsx         — página principal (composición de componentes)
  components/
    Navbar.tsx       — navegación fija con menú mobile
    Hero.tsx         — hero con formas geométricas flotantes
    BuiltDifferent.tsx — grid de 6 features con cards coloridos
    Services.tsx     — 3 servicios con precios y CTA
    DividerArt.tsx   — separador visual con formas y cita
    HowItWorks.tsx   — 4 pasos del proceso
    Privacy.tsx      — sección de seguridad y privacidad
    Testimonials.tsx — 3 testimonios de pacientes
    CTA.tsx          — call to action final
    Footer.tsx       — footer con links y contacto
```

## Diseño y Colores
Estilo visual inspirado en SuperHi: colorido, playful, con formas geométricas.

### Paleta de colores (definida en globals.css @theme)
- Lavender: `#D5D0F7` / `#E8E4FF` — fondos principales
- Azul: `#4361EE` / `#A5D8FF` — color primario
- Verde: `#2DC653` / `#C3FAE8` — acentos positivos
- Amarillo: `#FFD43B` / `#FFF3BF` — highlights
- Rosa: `#FF6B9D` / `#FFD6E7` — acentos decorativos
- Rojo: `#FF4757` — alertas/decoración
- Naranja: `#FF8C42` — variación cálida
- Mint: `#B2F2BB`, Coral: `#FFC9C9` — fondos de cards
- Foreground: `#1a1a2e` — texto principal oscuro

### Patrones de diseño
- Cards con fondos pastel de colores (no dark mode)
- Formas geométricas SVG flotantes (triángulos, círculos, estrellas)
- Animaciones: `animate-float`, `animate-float-delayed`, `animate-float-slow`, `animate-wiggle`, `animate-spin-slow`
- Tipografía bold/black para títulos
- Botones redondeados (rounded-full) con sombras coloridas
- Badges como pills con fondo de color

## Servicios
1. Adaptación de Puesto de Trabajo — $45.000 / 60 min
2. Atención Temprana — $40.000 / 45 min
3. Babysitting Terapéutico — $35.000 / 90 min

## Idioma
Todo el contenido está en español (Chile). `lang="es"` en el HTML.
