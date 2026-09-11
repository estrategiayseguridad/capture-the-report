"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const section = NAVIGATION.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only fixed left-4 top-4 z-50 rounded bg-white p-3 text-primary focus:not-sr-only"
      >
        Saltar al contenido
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Abrir menú"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-0 bg-[#102b36] p-0 text-white [&>button]:text-white"
              >
                <SheetTitle className="sr-only">Menú principal</SheetTitle>
                <SheetDescription className="sr-only">
                  Secciones de CSC Report Automation
                </SheetDescription>
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Espacio de trabajo
            </span>
            <span
              className="hidden text-slate-300 sm:inline"
              aria-hidden="true"
            >
              /
            </span>
            <span className="truncate text-sm font-medium">
              {section?.label ?? "CSC"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Cyber Shield Center</span>
            <span className="sm:hidden">CSC</span>
          </div>
        </header>
        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto max-w-[1440px] space-y-8 px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
