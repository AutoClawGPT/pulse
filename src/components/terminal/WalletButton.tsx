"use client";

import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWallets,
  WalletReadyGate,
} from "@solana/kit-plugin-wallet/react";
import { useClient } from "@solana/react";
import { useSession, type AppClient } from "@/components/providers";
import { shortMint } from "@/lib/format";
import { useEffect } from "react";

function Inner() {
  const client = useClient<AppClient>();
  const wallets = useWallets(client);
  const connected = useConnectedWallet(client);
  const { dispatch: connect } = useConnect(client);
  const { dispatch: disconnect } = useDisconnect(client);
  const { setAddress } = useSession();

  useEffect(() => {
    setAddress(connected?.account.address ?? null);
  }, [connected, setAddress]);

  if (connected) {
    return (
      <button className="btn" type="button" onClick={() => disconnect()}>
        {shortMint(connected.account.address, 3)} / cut
      </button>
    );
  }

  if (!wallets.length) {
    return (
      <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
        no wallet
      </span>
    );
  }

  return (
    <button className="btn" type="button" onClick={() => connect(wallets[0])}>
      connect {wallets[0].name}
    </button>
  );
}

export function WalletButton() {
  const client = useClient<AppClient>();
  return (
    <WalletReadyGate client={client} fallback={<span className="text-[var(--muted)]">wallets…</span>}>
      <Inner />
    </WalletReadyGate>
  );
}
