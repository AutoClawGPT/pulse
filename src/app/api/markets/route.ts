import { NextResponse } from "next/server";
import { startIngest } from "@/lib/ingest";
import {
  applyOddsTrade,
  closePulse,
  deposit,
  openPulse,
  snapshot,
  withdraw,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  startIngest();
  return NextResponse.json(snapshot());
}

export async function POST(req: Request) {
  startIngest();
  const body = (await req.json()) as {
    op: string;
    owner?: string;
    marketId?: string;
    buyYes?: boolean;
    long?: boolean;
    collateral?: number;
    size?: number;
    margin?: number;
    positionId?: string;
    amount?: number;
  };
  const owner = body.owner ?? "anon";
  if (body.op === "trade") {
    const r = applyOddsTrade({
      owner,
      kind: owner.startsWith("PULSE.AGENT") ? "AGENT" : "HUMAN",
      marketId: body.marketId ?? "",
      buyYes: Boolean(body.buyYes),
      collateral: Number(body.collateral ?? 0),
    });
    return NextResponse.json(r);
  }
  if (body.op === "open_pulse") {
    const r = openPulse({
      owner,
      marketId: body.marketId ?? "",
      long: Boolean(body.long),
      size: Number(body.size ?? 0),
      margin: Number(body.margin ?? 0),
    });
    return NextResponse.json(r);
  }
  if (body.op === "close_pulse") {
    const r = closePulse(body.positionId ?? "", owner);
    return NextResponse.json(r);
  }
  if (body.op === "deposit") {
    return NextResponse.json(deposit(owner, Number(body.amount ?? 0)));
  }
  if (body.op === "withdraw") {
    return NextResponse.json(withdraw(owner, Number(body.amount ?? 0)));
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}
