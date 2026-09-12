"use client";

import { CatalogAdmin } from "@/components/admin/CatalogAdmin";

export default function ClientsPage() {
  return <CatalogAdmin title="Clientes" endpoint="/api/clients" />;
}
