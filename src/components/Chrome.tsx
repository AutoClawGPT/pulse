"use client";

import { type ReactNode, useState } from "react";
import { useSession } from "@/components/providers";
import { Header } from "@/components/terminal/Header";
import { Nav } from "@/components/Nav";
import { useLiveTape } from "@/hooks/use-live-tape";
import { usePulse } from "@/hooks/use-pulse";

export function Chrome({
  children,
  footer,
  pit,
}: {
  children: ReactNode;
  footer?: ReactNode;
  pit?: boolean;
}) {
  const { data } = usePulse();
  const live = useLiveTape(data?.solUsd ?? 180);
  const { address } = useSession();
  const [airdropping, setAirdropping] = useState(false);

  async function airdrop() {
    if (!address) return;
    setAirdropping(true);
    await fetch("/api/airdrop", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
    setAirdropping(false);
  }

  return (
    <div className={pit ? "terminal terminal-pit" : "terminal terminal-page"}>
      <Header
        live={live.live || Boolean(data?.ingest.pumpapi)}
        solUsd={data?.solUsd ?? 0}
        helius={Boolean(data?.ingest.helius)}
        pyth={Boolean(data?.ingest.pyth) || (data?.solUsd ?? 0) > 0}
        onAirdrop={airdrop}
        airdropping={airdropping}
      />
      <Nav />
      {children}
      {footer}
    </div>
  );
}
