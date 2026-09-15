import { NextResponse } from "next/server";
import { fetchSolUsd } from "@/lib/pyth";
import { setSolUsd, snapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await fetchSolUsd();
  if (r.price) setSolUsd(r.price);
  const s = snapshot();
  return NextResponse.json({
    solUsd: s.solUsd,
    ts: s.solTs,
    source: r.source,
  });
}
