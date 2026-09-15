const HELIUS_KEY =
  process.env.HELIUS_API_KEY ??
  process.env.NEXT_PUBLIC_HELIUS_API_KEY ??
  "";

export function heliusRpc(cluster: "devnet" | "mainnet" = "devnet"): string {
  const host = cluster === "mainnet" ? "mainnet" : "devnet";
  return `https://${host}.helius-rpc.com/?api-key=${HELIUS_KEY}`;
}

export async function rpc<T>(
  method: string,
  params: unknown[],
  cluster: "devnet" | "mainnet" = "devnet",
): Promise<T> {
  const res = await fetch(heliusRpc(cluster), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`helius ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

export async function getSlot(): Promise<number> {
  return rpc<number>("getSlot", [{ commitment: "confirmed" }]);
}

export async function getBalance(address: string): Promise<number> {
  const r = await rpc<{ value: number }>("getBalance", [address]);
  return r.value / 1_000_000_000;
}

export async function getAccountInfo(address: string, cluster: "devnet" | "mainnet" = "mainnet") {
  return rpc<{ value: { data: [string, string]; owner: string } | null }>(
    "getAccountInfo",
    [address, { encoding: "base64" }],
    cluster,
  );
}

export async function requestAirdrop(address: string, sol = 1): Promise<string> {
  const lamports = Math.floor(sol * 1_000_000_000);
  try {
    return await rpc<string>("requestAirdrop", [address, lamports]);
  } catch {
    const res = await fetch("https://api.devnet.solana.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "requestAirdrop",
        params: [address, lamports],
      }),
    });
    const json = (await res.json()) as { result?: string; error?: { message: string } };
    if (json.error) throw new Error(json.error.message);
    return json.result as string;
  }
}

export async function pingHelius(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  try {
    const slot = await getSlot();
    return { ok: true, ms: Date.now() - t0, detail: `slot ${slot}` };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: String(e) };
  }
}
