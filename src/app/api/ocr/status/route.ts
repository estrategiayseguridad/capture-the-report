import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { getOcrStatus } from "@/services/ocr";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    return json(await getOcrStatus());
  } catch (error) {
    return errorResponse(error);
  }
}
