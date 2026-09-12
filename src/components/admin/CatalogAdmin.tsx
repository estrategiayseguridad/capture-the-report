"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";

type Item = { id: string; name: string; code: string; active: boolean; clientId?: string; managerId?: string | null };

export function CatalogAdmin({
  title,
  endpoint,
  extra,
}: {
  title: string;
  endpoint: string;
  extra?: { key: string; label: string; options: { id: string; name: string }[] };
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [extraValue, setExtraValue] = useState("");

  async function load() {
    const data = await api<Record<string, Item[]>>(endpoint);
    setItems(Object.values(data)[0] ?? []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, code, [extra?.key ?? ""]: extraValue || extra?.options[0]?.id }),
    });
    setName("");
    setCode("");
    await load();
  }

  async function toggle(item: Item) {
    await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ ...item, active: !item.active }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <form onSubmit={(e) => void save(e)} className={`${ui.card} mt-4 grid gap-3 md:grid-cols-4`}>
        <input className={ui.input} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={ui.input} placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
        {extra ? (
          <select className={ui.input} value={extraValue} onChange={(e) => setExtraValue(e.target.value)}>
            {extra.options.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        ) : <span />}
        <button className={ui.btnPrimary} type="submit">Guardar</button>
      </form>
      <ul className="mt-6 divide-y rounded-2xl bg-white shadow-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-3">
            <span>{item.name} · {item.code}</span>
            <button className={ui.btnSecondary} type="button" onClick={() => void toggle(item)}>
              {item.active ? "Desactivar" : "Activar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
