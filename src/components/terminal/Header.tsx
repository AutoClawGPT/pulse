"use client";

import Link from "next/link";
import { WalletButton } from "./WalletButton";
import { CLUSTER, PROGRAM_ID } from "@/lib/ids";
import { shortMint } from "@/lib/format";
import { useSession } from "@/components/providers";

export function Header({
  live,
  solUsd,
  helius,
  pyth,
  onAirdrop,
  airdropping,
}: {
  live: boolean;
  solUsd: number;
  helius: boolean;
  pyth: boolean;
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
        <a
          className="hidden md:inline btn !px-2 !py-1 text-[10px]"
          href="https://www.pyth.network/price-feeds/crypto-sol-usd"
          target="_blank"
          rel="noreferrer"
          title="SOL/USD from on-chain Pyth via Helius"
        >
          Pyth {pyth ? solUsd.toFixed(2) : "—"}
        </a>
        <a
          className="hidden md:inline btn !px-2 !py-1 text-[10px]"
          href="https://www.helius.dev"
          target="_blank"
          rel="noreferrer"
        >
          Helius {helius ? "RPC" : "down"}
        </a>
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
