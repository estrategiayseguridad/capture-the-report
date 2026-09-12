"use client";

import { useEffect, useState } from "react";
import { CatalogAdmin } from "@/components/admin/CatalogAdmin";
import { api } from "@/lib/client-api";

export default function ProjectsPage() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    void api<{ clients: { id: string; name: string }[] }>("/api/clients").then((data) =>
      setClients(data.clients),
    );
  }, []);
  return (
    <CatalogAdmin
      title="Proyectos"
      endpoint="/api/projects"
      extra={{ key: "clientId", label: "Cliente", options: clients }}
    />
  );
}
