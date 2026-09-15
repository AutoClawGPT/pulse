"use client";

import Link from "next/link";
import { WalletButton } from "./WalletButton";
import { CLUSTER, PROGRAM_ID } from "@/lib/ids";
import { shortMint } from "@/lib/format";
import { useSession } from "@/components/providers";

export function Header({
  live,
  solUsd,
  onAirdrop,
  airdropping,
}: {
  live: boolean;
  solUsd: number;
  onAirdrop: () => void;
  airdropping: boolean;
}) {
  const { address } = useSession();
  return (
    <header className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line)] px-3">
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="font-[family-name:var(--font-display)] text-[22px] leading-none tracking-[-0.04em] uppercase text-[var(--ink)]">
          PULSE
        </Link>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          odds + event perp / pump.fun / {CLUSTER}
        </span>
        <span
          className="live-led"
          data-off={!live}
          aria-label={live ? "ingest live" : "ingest down"}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[10px] text-[var(--muted)]">
          SOL {solUsd.toFixed(2)}
        </span>
        <span className="hidden lg:inline text-[10px] text-[var(--muted)]" title={PROGRAM_ID}>
          PID {shortMint(PROGRAM_ID, 3)}
        </span>
        <Link className="btn" href="/phoenix">
          Phoenix Flight
        </Link>
        <button className="btn" type="button" disabled={!address || airdropping} onClick={onAirdrop}>
          {airdropping ? "airdrop…" : "devnet 1 SOL"}
        </button>
        <WalletButton />
      </div>
    </header>
  );
}
