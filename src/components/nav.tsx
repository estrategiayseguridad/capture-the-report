"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Los menús de la plataforma, en el orden del pitch: dashboard, perfiles,
 * buscador de skills, carga laboral, reportes y catálogo de habilidades.
 */
const MENUS = [
  { href: "/", etiqueta: "Dashboard" },
  { href: "/buscar", etiqueta: "Buscar skills" },
  { href: "/perfiles", etiqueta: "Perfiles" },
  { href: "/carga", etiqueta: "Carga laboral" },
  { href: "/reportes", etiqueta: "Reportes" },
  { href: "/catalogo", etiqueta: "Catálogo" },
];

function activo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-linea-suave bg-fondo/95 backdrop-blur print:hidden">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-tinta">
          Prodigi<span className="text-acento">ES</span>
        </Link>

        <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
          {MENUS.map((menu) => (
            <li key={menu.href}>
              <Link
                href={menu.href}
                aria-current={activo(pathname, menu.href) ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 transition ${
                  activo(pathname, menu.href)
                    ? "bg-acento/15 font-semibold text-acento-claro"
                    : "text-tinta-3 hover:bg-panel-alto/60 hover:text-tinta"
                }`}
              >
                {menu.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <span className="ml-auto hidden text-xs text-tinta-4 sm:block">
          Gestión de habilidades y cargabilidad
        </span>
      </nav>
    </header>
  );
}
