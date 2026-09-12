import { HttpError } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import type { AppStore, Client, Department, Project, PublicUser, User } from "@/lib/types";
import type { Role } from "@/lib/status";
import { appendAudit } from "./audit";
import { publicUser } from "@/lib/db";

function stamp() {
  return nowIso();
}

export async function createUser(
  store: AppStore,
  actor: PublicUser,
  input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    employeeNumber: string;
    departmentId: string;
    managerId?: string | null;
    active?: boolean;
  },
) {
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email) throw new HttpError(400, "Nombre y correo son obligatorios");
  if (store.users.some((user) => user.email === email)) {
    throw new HttpError(409, "Ya existe un usuario con ese correo");
  }
  const passwordError = validatePasswordStrength(input.password);
  if (passwordError) throw new HttpError(400, passwordError);
  if (!store.departments.some((item) => item.id === input.departmentId)) {
    throw new HttpError(400, "Departamento inválido");
  }
  if (actor.role !== "SuperAdmin" && input.role === "SuperAdmin") {
    throw new HttpError(403, "Solo un Super Admin puede crear otro Super Admin");
  }
  const timestamp = stamp();
  const user: User = {
    id: newId("usr"),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    employeeNumber: input.employeeNumber.trim(),
    departmentId: input.departmentId,
    managerId: input.managerId ?? null,
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.users.push(user);
  appendAudit(store, {
    userId: actor.id,
    action: "user.create",
    entityType: "user",
    entityId: user.id,
    before: null,
    after: publicUser(user),
  });
  return publicUser(user);
}

export async function updateUser(
  store: AppStore,
  actor: PublicUser,
  userId: string,
  input: Partial<{
    name: string;
    email: string;
    password: string;
    role: Role;
    employeeNumber: string;
    departmentId: string;
    managerId: string | null;
    active: boolean;
  }>,
) {
  const user = store.users.find((item) => item.id === userId);
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  const before = publicUser(user);
  if (input.email) {
    const email = input.email.trim().toLowerCase();
    if (store.users.some((item) => item.email === email && item.id !== user.id)) {
      throw new HttpError(409, "Ya existe un usuario con ese correo");
    }
    user.email = email;
  }
  if (input.name) user.name = input.name.trim();
  if (input.employeeNumber) user.employeeNumber = input.employeeNumber.trim();
  if (input.departmentId) user.departmentId = input.departmentId;
  if (input.managerId !== undefined) user.managerId = input.managerId;
  if (input.active !== undefined) user.active = input.active;
  if (input.role) {
    if (actor.role !== "SuperAdmin" && (input.role === "SuperAdmin" || user.role === "SuperAdmin")) {
      throw new HttpError(403, "No puedes cambiar roles de Super Admin");
    }
    user.role = input.role;
  }
  if (input.password) {
    const passwordError = validatePasswordStrength(input.password);
    if (passwordError) throw new HttpError(400, passwordError);
    user.passwordHash = await hashPassword(input.password);
  }
  user.updatedAt = stamp();
  appendAudit(store, {
    userId: actor.id,
    action: "user.update",
    entityType: "user",
    entityId: user.id,
    before,
    after: publicUser(user),
  });
  return publicUser(user);
}

export function upsertDepartment(
  store: AppStore,
  actor: PublicUser,
  input: Partial<Department> & { name: string; code: string },
) {
  const timestamp = stamp();
  if (input.id) {
    const item = store.departments.find((row) => row.id === input.id);
    if (!item) throw new HttpError(404, "Departamento no encontrado");
    const before = { ...item };
    item.name = input.name.trim();
    item.code = input.code.trim().toUpperCase();
    if (input.managerId !== undefined) item.managerId = input.managerId;
    if (input.active !== undefined) item.active = input.active;
    item.updatedAt = timestamp;
    appendAudit(store, {
      userId: actor.id,
      action: "department.update",
      entityType: "department",
      entityId: item.id,
      before,
      after: item,
    });
    return item;
  }
  const item: Department = {
    id: newId("dep"),
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    managerId: input.managerId ?? null,
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.departments.push(item);
  appendAudit(store, {
    userId: actor.id,
    action: "department.create",
    entityType: "department",
    entityId: item.id,
    before: null,
    after: item,
  });
  return item;
}

export function upsertClient(
  store: AppStore,
  actor: PublicUser,
  input: Partial<Client> & { name: string; code: string },
) {
  const timestamp = stamp();
  if (input.id) {
    const item = store.clients.find((row) => row.id === input.id);
    if (!item) throw new HttpError(404, "Cliente no encontrado");
    const before = { ...item };
    item.name = input.name.trim();
    item.code = input.code.trim().toUpperCase();
    if (input.active !== undefined) item.active = input.active;
    item.updatedAt = timestamp;
    appendAudit(store, {
      userId: actor.id,
      action: "client.update",
      entityType: "client",
      entityId: item.id,
      before,
      after: item,
    });
    return item;
  }
  const item: Client = {
    id: newId("cli"),
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.clients.push(item);
  appendAudit(store, {
    userId: actor.id,
    action: "client.create",
    entityType: "client",
    entityId: item.id,
    before: null,
    after: item,
  });
  return item;
}

export function upsertProject(
  store: AppStore,
  actor: PublicUser,
  input: Partial<Project> & { name: string; code: string; clientId: string },
) {
  if (!store.clients.some((client) => client.id === input.clientId)) {
    throw new HttpError(400, "Cliente inválido");
  }
  const timestamp = stamp();
  if (input.id) {
    const item = store.projects.find((row) => row.id === input.id);
    if (!item) throw new HttpError(404, "Proyecto no encontrado");
    const before = { ...item };
    item.name = input.name.trim();
    item.code = input.code.trim().toUpperCase();
    item.clientId = input.clientId;
    if (input.active !== undefined) item.active = input.active;
    item.updatedAt = timestamp;
    appendAudit(store, {
      userId: actor.id,
      action: "project.update",
      entityType: "project",
      entityId: item.id,
      before,
      after: item,
    });
    return item;
  }
  const item: Project = {
    id: newId("prj"),
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    clientId: input.clientId,
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.projects.push(item);
  appendAudit(store, {
    userId: actor.id,
    action: "project.create",
    entityType: "project",
    entityId: item.id,
    before: null,
    after: item,
  });
  return item;
}
