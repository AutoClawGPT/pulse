import { NextResponse } from "next/server";
import { authHeader, bumpTrades } from "@/lib/agents";
import { applyOddsTrade } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const a = authHeader(req);
  if (!a) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = (await req.json()) as {
    marketId?: string;
    buyYes?: boolean;
    collateral?: number;
  };
  const r = applyOddsTrade({
    owner: a.id,
    kind: "AGENT",
    marketId: body.marketId ?? "",
    buyYes: Boolean(body.buyYes),
    collateral: Number(body.collateral ?? 0.1),
  });
  if ("error" in r) return NextResponse.json(r, { status: 400 });
  bumpTrades(a.id);
  return NextResponse.json(r);
}
