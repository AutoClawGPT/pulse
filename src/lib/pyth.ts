import { PYTH_SOL_USD_ACCOUNT, PYTH_SOL_USD_FEED } from "./ids";
import { getAccountInfo, pingHelius } from "./helius";

const HERMES =
  process.env.NEXT_PUBLIC_PYTH_HERMES_HTTP ?? "https://hermes.pyth.network";

export async function fetchSolUsdHermes(): Promise<number | null> {
  try {
    const url = `${HERMES}/v2/updates/price/latest?ids[]=${PYTH_SOL_USD_FEED}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      parsed?: Array<{ price?: { price: string; expo: number } }>;
    };
    const p = json.parsed?.[0]?.price;
    if (!p) return null;
    return Number(p.price) * 10 ** p.expo;
  } catch {
    return null;
  }
}

/** Decode Pyth v2 price account (legacy). expo at byte 20, price i64 at 208. */
export function decodePythPriceAccount(data: Buffer): number | null {
  if (data.length < 240) return null;
  const expo = data.readInt32LE(20);
  const price = Number(data.readBigInt64LE(208));
  if (!Number.isFinite(price) || price === 0) return null;
  return price * 10 ** expo;
}

export async function fetchSolUsdOnchain(): Promise<number | null> {
  try {
    const acc = await getAccountInfo(PYTH_SOL_USD_ACCOUNT, "mainnet");
    const b64 = acc.value?.data?.[0];
    if (!b64) return null;
    return decodePythPriceAccount(Buffer.from(b64, "base64"));
  } catch {
    return null;
  }
}

export async function fetchSolUsd(): Promise<{
  price: number | null;
  source: "hermes" | "onchain" | "none";
}> {
  const hermes = await fetchSolUsdHermes();
  if (hermes && hermes > 0) return { price: hermes, source: "hermes" };
  const onchain = await fetchSolUsdOnchain();
  if (onchain && onchain > 0) return { price: onchain, source: "onchain" };
  return { price: null, source: "none" };
}

export async function pingPyth(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  const r = await fetchSolUsd();
  if (r.price) {
    return {
      ok: true,
      ms: Date.now() - t0,
      detail: `SOL ${r.price.toFixed(2)} via ${r.source}`,
    };
  }
  const h = await pingHelius();
  return {
    ok: false,
    ms: Date.now() - t0,
    detail: `no pyth mark (helius ${h.ok ? "up" : "down"})`,
  };
}
