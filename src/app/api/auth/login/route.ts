import { errorResponse, HttpError, json, readJsonBody } from "@/lib/http";
import { publicUser, readStore } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { appendAudit } from "@/services/audit";
import { updateStore } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<{ email?: string; password?: string }>(request);
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      throw new HttpError(400, "Correo y contraseña son obligatorios");
    }
    const store = await readStore();
    const user = store.users.find((item) => item.email === email);
    if (!user || !user.active) {
      throw new HttpError(401, "Credenciales inválidas");
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Credenciales inválidas");
    await setSessionCookie(user);
    await updateStore((next) => {
      appendAudit(next, {
        userId: user.id,
        action: "auth.login",
        entityType: "user",
        entityId: user.id,
        before: null,
        after: { email: user.email, role: user.role },
      });
    });
    return json({ user: publicUser(user) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
