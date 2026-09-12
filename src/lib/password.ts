import { compare, hash } from "bcryptjs";

const ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return null;
}
