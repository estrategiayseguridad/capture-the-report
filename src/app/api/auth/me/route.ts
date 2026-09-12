import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
