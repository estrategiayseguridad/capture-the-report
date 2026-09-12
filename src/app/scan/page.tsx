"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import type { Client, Department, DocumentNumberCandidate, OcrParseResult, Project } from "@/lib/types";

type Step = "capture" | "preview" | "ocr" | "review" | "classify" | "final" | "success";

export default function ScanPage() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [ocr, setOcr] = useState<OcrParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogs, setCatalogs] = useState<{
    departments: Department[];
    clients: Client[];
    projects: Project[];
  } | null>(null);
  const [form, setForm] = useState({
    confirmedDocumentNumber: "",
    confirmedTotal: "",
    confirmedDate: new Date().toISOString().slice(0, 10),
    confirmedVendor: "",
    confirmedCurrency: "GTQ",
    departmentId: "",
    clientId: "",
    projectId: "",
  });

  useEffect(() => {
    void api<{ departments: Department[]; clients: Client[]; projects: Project[] }>(
      "/api/catalogs",
    ).then(setCatalogs);
  }, []);

  const projects = useMemo(
    () => catalogs?.projects.filter((item) => item.clientId === form.clientId) ?? [],
    [catalogs, form.clientId],
  );

  function onPicked(next: File | null) {
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setStep("preview");
    setError(null);
  }

  async function runOcr() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setStep("ocr");
    try {
      const upload = new FormData();
      upload.set("file", file);
      const saved = await api<{ receipt: { id: string } }>("/api/receipts", {
        method: "POST",
        body: upload,
      });
      setReceiptId(saved.receipt.id);
      const result = await api<{ ocr: OcrParseResult }>("/api/ocr", {
        method: "POST",
        body: JSON.stringify({ receiptFileId: saved.receipt.id }),
      });
      setOcr(result.ocr);
      const high = result.ocr.candidates.filter((item) => item.confidence >= 0.7);
      const unique = [...new Map(high.map((item) => [item.normalized, item])).values()];
      setForm((current) => ({
        ...current,
        confirmedDocumentNumber:
          unique.length === 1 ? unique[0].value : current.confirmedDocumentNumber,
        confirmedTotal: result.ocr.total ? String(result.ocr.total) : current.confirmedTotal,
        confirmedDate: result.ocr.date ?? current.confirmedDate,
        confirmedVendor: result.ocr.vendor ?? current.confirmedVendor,
        confirmedCurrency: result.ocr.currency ?? "GTQ",
      }));
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR no disponible");
      setStep("review");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          submit: true,
          receiptFileId: receiptId,
          ocrDocumentNumber: ocr?.documentNumber,
          confirmedDocumentNumber: form.confirmedDocumentNumber,
          ocrConfidence: ocr?.confidence,
          ocrRawText: ocr?.rawText ?? "",
          ocrCandidates: ocr?.candidates ?? [],
          ocrTotal: ocr?.total,
          confirmedTotal: Number(form.confirmedTotal),
          ocrDate: ocr?.date,
          confirmedDate: form.confirmedDate,
          ocrVendor: ocr?.vendor,
          confirmedVendor: form.confirmedVendor,
          ocrCurrency: ocr?.currency,
          confirmedCurrency: form.confirmedCurrency,
          departmentId: form.departmentId,
          clientId: form.clientId,
          projectId: form.projectId,
        }),
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setBusy(false);
    }
  }

  const candidates: DocumentNumberCandidate[] = ocr?.candidates ?? [];
  const highCandidates = [
    ...new Map(
      candidates.filter((item) => item.confidence >= 0.55).map((item) => [item.normalized, item]),
    ).values(),
  ];

  return (
    <EmployeeShell>
      <p className="text-sm uppercase tracking-[0.2em] text-teal-800">Nuevo gasto</p>
      <h1 className="mt-1 text-3xl font-semibold">Escanear factura</h1>
      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      {step === "capture" ? (
        <div className="mt-8 space-y-4">
          <button
            type="button"
            className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-teal-700 text-lg font-semibold text-white"
            onClick={() => cameraRef.current?.click()}
          >
            Abrir cámara
          </button>
          <button
            type="button"
            className={ui.btnSecondary + " w-full"}
            onClick={() => uploadRef.current?.click()}
          >
            Subir imagen
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => onPicked(event.target.files?.[0] ?? null)}
          />
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onPicked(event.target.files?.[0] ?? null)}
          />
        </div>
      ) : null}

      {step === "preview" && preview ? (
        <div className="mt-6 space-y-4">
          <img src={preview} alt="Vista previa" className="w-full rounded-2xl border object-contain" />
          <button type="button" className={ui.btnPrimary + " w-full"} onClick={() => void runOcr()}>
            Confirmar y leer OCR
          </button>
          <button type="button" className={ui.btnSecondary + " w-full"} onClick={() => setStep("capture")}>
            Volver a tomar
          </button>
        </div>
      ) : null}

      {step === "ocr" ? (
        <p className="mt-10 text-center text-slate-600">
          {busy ? "Leyendo la factura con OCR local…" : "Procesando…"}
        </p>
      ) : null}

      {step === "review" ? (
        <div className="mt-6 space-y-4">
          {preview ? <img src={preview} alt="" className="max-h-48 w-full rounded-2xl object-contain" /> : null}
          {highCandidates.length > 1 ? (
            <div className={ui.card}>
              <p className="font-medium">Hay varios números posibles. Confirma el correcto.</p>
              <div className="mt-3 space-y-2">
                {highCandidates.map((item) => (
                  <label key={item.normalized} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <input
                      type="radio"
                      name="dte"
                      checked={form.confirmedDocumentNumber === item.value}
                      onChange={() =>
                        setForm({ ...form, confirmedDocumentNumber: item.value })
                      }
                    />
                    <span>
                      <span className="font-mono">{item.value}</span>
                      <span className="block text-xs text-slate-500">
                        {item.source} · {Math.round(item.confidence * 100)}%
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          {!ocr?.documentNumberFound && highCandidates.length <= 1 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
              No pudimos leer con certeza el número de documento. Escríbelo manualmente.
            </p>
          ) : null}
          <Field
            label="Número de documento / DTE"
            ocr={ocr?.documentNumber}
            value={form.confirmedDocumentNumber}
            onChange={(value) => setForm({ ...form, confirmedDocumentNumber: value })}
          />
          <Field
            label="Proveedor"
            ocr={ocr?.vendor}
            value={form.confirmedVendor}
            onChange={(value) => setForm({ ...form, confirmedVendor: value })}
          />
          <Field
            label="Fecha"
            type="date"
            ocr={ocr?.date}
            value={form.confirmedDate}
            onChange={(value) => setForm({ ...form, confirmedDate: value })}
          />
          <Field
            label="Total"
            type="number"
            ocr={ocr?.total != null ? String(ocr.total) : null}
            value={form.confirmedTotal}
            onChange={(value) => setForm({ ...form, confirmedTotal: value })}
          />
          <label className={ui.label}>
            Moneda
            <select
              className={ui.input}
              value={form.confirmedCurrency}
              onChange={(event) => setForm({ ...form, confirmedCurrency: event.target.value })}
            >
              <option>GTQ</option>
              <option>USD</option>
            </select>
            {ocr?.currency ? (
              <span className="mt-1 block text-xs text-slate-500">OCR: {ocr.currency}</span>
            ) : null}
          </label>
          <button type="button" className={ui.btnPrimary + " w-full"} onClick={() => setStep("classify")}>
            Continuar
          </button>
        </div>
      ) : null}

      {step === "classify" && catalogs ? (
        <div className="mt-6 space-y-4">
          <label className={ui.label}>
            Departamento
            <select
              className={ui.input}
              value={form.departmentId}
              onChange={(event) => setForm({ ...form, departmentId: event.target.value })}
            >
              <option value="">Selecciona</option>
              {catalogs.departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.label}>
            Cliente
            <select
              className={ui.input}
              value={form.clientId}
              onChange={(event) =>
                setForm({ ...form, clientId: event.target.value, projectId: "" })
              }
            >
              <option value="">Selecciona</option>
              {catalogs.clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className={ui.label}>
            Proyecto
            <select
              className={ui.input}
              value={form.projectId}
              onChange={(event) => setForm({ ...form, projectId: event.target.value })}
            >
              <option value="">Selecciona</option>
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={ui.btnPrimary + " w-full"}
            disabled={!form.departmentId || !form.clientId || !form.projectId}
            onClick={() => setStep("final")}
          >
            Revisar envío
          </button>
        </div>
      ) : null}

      {step === "final" ? (
        <div className="mt-6 space-y-4">
          {preview ? <img src={preview} alt="" className="max-h-48 w-full rounded-2xl object-contain" /> : null}
          <dl className={`${ui.card} space-y-2 text-sm`}>
            <Row label="Documento" value={form.confirmedDocumentNumber} />
            <Row label="Proveedor" value={form.confirmedVendor} />
            <Row label="Fecha" value={form.confirmedDate} />
            <Row
              label="Monto"
              value={money(Number(form.confirmedTotal || 0), form.confirmedCurrency)}
            />
            <Row
              label="Departamento"
              value={catalogs?.departments.find((item) => item.id === form.departmentId)?.name}
            />
            <Row label="Cliente" value={catalogs?.clients.find((item) => item.id === form.clientId)?.name} />
            <Row label="Proyecto" value={projects.find((item) => item.id === form.projectId)?.name} />
          </dl>
          <button type="button" className={ui.btnPrimary + " w-full"} disabled={busy} onClick={() => void submit()}>
            {busy ? "Enviando…" : "Enviar gasto"}
          </button>
        </div>
      ) : null}

      {step === "success" ? (
        <div className="mt-10 text-center">
          <p className="text-2xl font-semibold">Gasto enviado</p>
          <p className="mt-2 text-slate-600">
            Quedó en autorización. Si el OCR detectó un posible duplicado, pasará a revisión.
          </p>
          <button type="button" className={`${ui.btnPrimary} mt-6 w-full`} onClick={() => router.push("/home")}>
            Volver al inicio
          </button>
        </div>
      ) : null}
    </EmployeeShell>
  );
}

function Field({
  label,
  value,
  onChange,
  ocr,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ocr?: string | null;
  type?: string;
}) {
  return (
    <label className={ui.label}>
      {label}
      <input className={ui.input} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {ocr ? <span className="mt-1 block text-xs text-slate-500">OCR: {ocr}</span> : null}
    </label>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
