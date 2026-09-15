import { NextResponse } from "next/server";
import { requestAirdrop } from "@/lib/helius";
import { deposit } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { address?: string };
  const address = body.address ?? "";
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: "bad address" }, { status: 400 });
  }
  try {
    const sig = await requestAirdrop(address, 1);
    deposit(address, 1);
    return NextResponse.json({ ok: true, signature: sig });
  } catch (e) {
    deposit(address, 1);
    return NextResponse.json({
      ok: false,
      error: String(e),
      note: "devnet faucet may be rate-limited; paper vault credited 1 SOL",
    });
  }
}
