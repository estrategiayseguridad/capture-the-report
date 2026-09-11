import { NextRequest, NextResponse } from "next/server";
import { generarNarrativaConIA } from "@/lib/narrativaIA";
import type { NarrativaInput } from "@/lib/report";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as NarrativaInput;

  try {
    const narrativa = await generarNarrativaConIA(data);
    return NextResponse.json(narrativa);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error generando el análisis con IA.";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
