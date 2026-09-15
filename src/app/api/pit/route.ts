import { NextResponse } from "next/server";
import { pushPit, snapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = snapshot();
  return NextResponse.json({ pit: s.pit, leaderboard: s.leaderboard });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    from?: "HUMAN" | "AGENT";
    wallet?: string;
    text?: string;
    marketId?: string;
  };
  const text = (body.text ?? "").trim().slice(0, 280);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  pushPit({
    id: `pit-${Date.now()}`,
    ts: Date.now(),
    from: body.from === "AGENT" ? "AGENT" : "HUMAN",
    wallet: body.wallet,
    text,
    marketId: body.marketId,
  });
  return NextResponse.json({ ok: true });
}
