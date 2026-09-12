import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const store = await readStore();
    return json({
      departments: store.departments.filter((item) => item.active),
      clients: store.clients.filter((item) => item.active),
      projects: store.projects.filter((item) => item.active),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
