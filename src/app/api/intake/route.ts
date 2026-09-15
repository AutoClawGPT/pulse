import { NextResponse } from "next/server";
import { maybeSpawnFromCreate, resolveIfDue } from "@/lib/markets";
import {
  liquidate,
  pushPit,
  pushTape,
  resolveMarket,
  setSolUsd,
  snapshot,
  upsertMarket,
} from "@/lib/store";
import type { IntakePayload, Market, PitMessage, TapeEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

function auth(req: Request): boolean {
  const secret = process.env.CRANK_SECRET;
  if (!secret) return false;
  const hdr = req.headers.get("x-crank-secret") ?? "";
  return hdr === secret;
}

export async function POST(req: Request) {
  if (!auth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as IntakePayload;
  switch (body.type) {
    case "tape":
      pushTape(body.payload as TapeEvent);
      maybeSpawnFromCreate(body.payload as TapeEvent, snapshot().solUsd);
      break;
    case "market":
      upsertMarket(body.payload as Market);
      break;
    case "resolve": {
      const p = body.payload as {
        id: string;
        outcome: "YES" | "NO";
        claimedValue: number;
        claimedSlot: number;
        claimedHash: string;
      };
      resolveMarket(p.id, p.outcome, p.claimedValue, p.claimedSlot, p.claimedHash);
      break;
    }
    case "mark":
      setSolUsd((body.payload as { solUsd: number }).solUsd);
      break;
    case "liq":
      liquidate((body.payload as { positionId: string }).positionId);
      break;
    case "pit":
      pushPit(body.payload as PitMessage);
      break;
    case "sol":
      setSolUsd((body.payload as { solUsd: number }).solUsd);
      break;
    default:
      break;
  }
  void resolveIfDue;
  return NextResponse.json({ ok: true });
}
