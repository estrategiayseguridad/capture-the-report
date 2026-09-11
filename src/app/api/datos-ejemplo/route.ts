import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "halo-itsm-ejemplo.csv");
  const contenido = await readFile(filePath, "utf-8");
  return new NextResponse(contenido, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
