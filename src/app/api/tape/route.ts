import { NextResponse } from "next/server";
import { startIngest } from "@/lib/ingest";
import { snapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  startIngest();
  const s = snapshot();
  return NextResponse.json({ tape: s.tape, ingest: s.ingest });
}
