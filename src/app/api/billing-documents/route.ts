import { errorResponse, HttpError, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ingestBillingFiles } from "@/services/billing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const url = new URL(request.url);
    const status = url.searchParams.get("matchStatus");
    const store = await readStore();
    const documents = status
      ? store.billingDocuments.filter((item) => item.matchStatus === status)
      : store.billingDocuments;
    return json({ documents, expenses: store.expenses, users: store.users.map((u) => ({ id: u.id, name: u.name, employeeNumber: u.employeeNumber })) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const form = await request.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    if (!files.length) throw new HttpError(400, "Sube uno o más documentos");
    const payloads = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
      })),
    );
    const { result } = await updateStore((store) => ingestBillingFiles(store, actor, payloads));
    return json(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
