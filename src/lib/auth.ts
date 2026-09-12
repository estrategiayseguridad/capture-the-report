import "server-only";
import { cookies } from "next/headers";
import { HttpError } from "./http";
import { publicUser, readStore } from "./db";
import type { PublicUser } from "./types";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "./session";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  const store = await readStore();
  const user = store.users.find((item) => item.id === session.userId && item.active);
  return user ? publicUser(user) : null;
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Inicia sesión para continuar");
  return user;
}

export async function setSessionCookie(user: {
  id: string;
  role: PublicUser["role"];
}) {
  const token = await signSession({ userId: user.id, role: user.role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}
