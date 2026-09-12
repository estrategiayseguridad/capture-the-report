import "server-only";
import { getPrisma } from "@/lib/prisma";
import { buildAnnualHistory } from "./history-data";
import {
  saveHistorySchema,
  clientNameSchema,
  historyQuerySchema,
} from "@/validators/history";
import type { SaveHistoryInput } from "@/validators/history";

export class HistoryClientNotFound extends Error {}

export async function listHistoryClients() {
  return getPrisma().client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function resolveHistoryClient(name: string) {
  const parsed = clientNameSchema.parse({ name });
  const displayName = parsed.name.replace(/\s+/g, " ").normalize("NFC");
  const nameKey = displayName.toLocaleLowerCase("es");
  const db = getPrisma();
  // Preserve existing Client IDs from the base model, whose optional key was absent.
  const legacy = await db.client.findMany({
    where: { nameKey: null },
    select: { id: true, name: true },
  });
  const match = legacy.find(
    (client) =>
      client.name
        .trim()
        .replace(/\s+/g, " ")
        .normalize("NFC")
        .toLocaleLowerCase("es") === nameKey,
  );
  if (match)
    return db.client.update({
      where: { id: match.id },
      data: { nameKey },
      select: { id: true, name: true },
    });
  return db.client.upsert({
    where: { nameKey },
    create: { name: displayName, nameKey },
    update: { nameKey },
    select: { id: true, name: true },
  });
}

export async function getAnnualHistory(clientId: string, year: number) {
  historyQuerySchema.parse({ clientId, year });
  const db = getPrisma();
  if (
    !(await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    }))
  )
    throw new HistoryClientNotFound();
  const records = await db.monthlyTicketHistory.findMany({
    where: { clientId, year },
    orderBy: { month: "asc" },
    select: { month: true, totalTickets: true, source: true },
  });
  return buildAnnualHistory(clientId, year, records);
}

export async function saveAnnualHistory(input: SaveHistoryInput) {
  const { clientId, year, months } = saveHistorySchema.parse(input);
  const db = getPrisma();
  if (
    !(await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    }))
  )
    throw new HistoryClientNotFound();
  // Empty cells are skipped: never manufacture zero or delete existing history.
  await db.$transaction(
    months
      .filter((row) => row.totalTickets !== null)
      .map((row) => {
        const data = { totalTickets: row.totalTickets!, source: row.source };
        return db.monthlyTicketHistory.upsert({
          where: { clientId_year_month: { clientId, year, month: row.month } },
          create: { clientId, year, month: row.month, ...data },
          update: data,
        });
      }),
  );
  return getAnnualHistory(clientId, year);
}
