import { errorResponse, json } from "@/lib/http";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { appendAudit } from "@/services/audit";
import { updateStore } from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await updateStore((store) => {
        appendAudit(store, {
          userId: user.id,
          action: "auth.logout",
          entityType: "user",
          entityId: user.id,
          before: null,
          after: null,
        });
      });
    }
    await clearSessionCookie();
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
