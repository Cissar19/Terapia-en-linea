import Image from "next/image";

export default function Footer() {
  return (
    <footer id="contacto" className="bg-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Terapia en facil"
                width={128}
                height={44}
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Terapia ocupacional infantil, en fácil.
              Acompañamos a familias de niños con TEA y neurodesarrollo
              con cercanía y profesionalismo.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Servicios</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Adaptación de Puesto
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Atención Temprana
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Babysitting Terapéutico
                </a>
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#como-funciona" className="hover:text-white transition-colors">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#privacidad" className="hover:text-white transition-colors">
                  Privacidad y Seguridad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos de Servicio
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Santiago, Chile</li>
              <li>
                <a href="mailto:contacto@terapiaocupacional.cl" className="hover:text-white transition-colors">
                  contacto@terapiaocupacional.cl
                </a>
              </li>
              <li>
                <a href="tel:+56912345678" className="hover:text-white transition-colors">
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Terapia en Facil. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pagos seguros con Flow.cl / Webpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
