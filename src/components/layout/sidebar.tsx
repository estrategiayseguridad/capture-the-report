"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#102b36] text-slate-200">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-24 shrink-0 items-center gap-3 px-6 focus-visible:outline-2 focus-visible:outline-teal-300"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-300">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-xl font-bold tracking-wider text-white">
            CSC
          </span>
          <span className="text-[11px] tracking-wide text-slate-400">
            CYBER SHIELD CENTER
          </span>
        </span>
      </Link>
      <div className="mx-6 border-t border-white/10" />
      <nav
        aria-label="Navegación principal"
        className="flex-1 space-y-2 px-4 py-8"
      >
        <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.2em] text-slate-400">
          ESPACIO DE TRABAJO
        </p>
        {NAVIGATION.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={
                  !item.children && pathname === item.href ? "page" : undefined
                }
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-300",
                  active && "bg-teal-300/10 text-teal-200",
                )}
              >
                <item.icon className="size-[18px]" aria-hidden="true" />
                {item.label}
              </Link>
              {item.children && (
                <ul className="my-2 ml-5 space-y-1 border-l border-white/15 pl-4">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={
                          pathname === child.href ? "page" : undefined
                        }
                        className={cn(
                          "block rounded-md px-3 py-2 text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-teal-300",
                          pathname === child.href &&
                            "bg-white/5 font-medium text-teal-200",
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="m-4 rounded-xl border border-white/10 p-4">
        <p className="text-xs font-medium text-white">Reportes mensuales</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Un espacio para la información de tu centro de ciberseguridad.
        </p>
      </div>
    </div>
  );
}
