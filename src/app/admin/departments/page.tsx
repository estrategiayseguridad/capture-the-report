"use client";

import { CatalogAdmin } from "@/components/admin/CatalogAdmin";

export default function DepartmentsPage() {
  return <CatalogAdmin title="Departamentos" endpoint="/api/departments" />;
}
