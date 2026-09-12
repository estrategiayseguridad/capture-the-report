import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { submitExpense } from "@/services/expenses";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const { result } = await updateStore((store) => submitExpense(store, actor, id));
    return json({ expense: result });
  } catch (error) {
    return errorResponse(error);
  }
}
