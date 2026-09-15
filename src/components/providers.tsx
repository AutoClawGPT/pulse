"use client";

import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { ClientProvider } from "@solana/react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

export const client = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl }));

export type AppClient = Awaited<typeof client>;

type Session = {
  address: string | null;
  setAddress: (a: string | null) => void;
};

const SessionCtx = createContext<Session>({ address: null, setAddress: () => {} });

export function useSession() {
  return useContext(SessionCtx);
}

export function Providers({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const value = useMemo(() => ({ address, setAddress }), [address]);
  return (
    <SessionCtx.Provider value={value}>
      <ClientProvider client={client}>{children}</ClientProvider>
    </SessionCtx.Provider>
  );
}
