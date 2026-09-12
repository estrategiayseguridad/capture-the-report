import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./status";

export const SESSION_COOKIE = "rinde_session";

export type SessionPayload = {
  userId: string;
  role: Role;
};

function sessionSecret(): string {
  return process.env.SESSION_SECRET || "rinde-hackathon-dev-secret";
}

function secretKey() {
  return new TextEncoder().encode(sessionSecret());
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.userId || !payload.role) return null;
    return {
      userId: String(payload.userId),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
