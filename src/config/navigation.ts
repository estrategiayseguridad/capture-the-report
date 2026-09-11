import {
  FileText,
  History,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: ReadonlyArray<{ label: string; href: string }>;
}

export const NAVIGATION: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Reportes",
    href: "/reportes",
    icon: FileText,
    children: [
      { label: "Nuevo reporte", href: "/reportes/nuevo" },
      { label: "Historial de reportes", href: "/reportes" },
    ],
  },
  { label: "Historial", href: "/historial", icon: History },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];
