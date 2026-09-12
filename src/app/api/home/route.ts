import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { employeeHome } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const store = await readStore();
    return json({ user, home: employeeHome(store, user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
