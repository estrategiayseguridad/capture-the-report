import { errorResponse, HttpError, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { buildEmployeeWorkbook, buildEmployeeZip } from "@/services/export";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const body = await readJsonBody<{ userIds?: string[]; format?: "xlsx" | "zip" }>(request);
    const store = await readStore();
    const ids = body.userIds?.length
      ? body.userIds
      : store.users.filter((user) => user.role === "Employee").map((user) => user.id);
    const users = store.users.filter((user) => ids.includes(user.id));
    if (!users.length) throw new HttpError(400, "Selecciona al menos un colaborador");
    if (users.length === 1 && body.format !== "zip") {
      const user = users[0];
      const expenses = store.expenses.filter(
        (expense) => expense.userId === user.id && expense.expenseStatus !== "Cancelled",
      );
      const buffer = await buildEmployeeWorkbook(store, user, expenses);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${user.employeeNumber}.xlsx"`,
        },
      });
    }
    const zip = await buildEmployeeZip(store, users);
    return new Response(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=rinde-reportes.zip",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
