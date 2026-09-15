export function shortMint(mint?: string, n = 4): string {
  if (!mint) return "----";
  if (mint.length <= n * 2 + 1) return mint;
  return `${mint.slice(0, n)}…${mint.slice(-n)}`;
}

export function fmtMc(sol?: number, solUsd?: number): string {
  if (sol == null || Number.isNaN(sol)) return "—";
  const usd = solUsd != null ? sol * solUsd : sol * 180;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  if (usd >= 1) return `$${usd.toFixed(0)}`;
  return `$${usd.toFixed(2)}`;
}

export function fmtSol(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function fmtPct(p: number): string {
  if (!Number.isFinite(p)) return "—";
  return `${(p * 100).toFixed(1)}¢`;
}

export function fmtOdds(p: number): string {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return p >= 1 ? "YES" : "NO";
  const yes = p / (1 - p);
  return yes >= 1 ? `${yes.toFixed(2)} : 1` : `1 : ${(1 / yes).toFixed(2)}`;
}

export function ageSec(ts: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - ts) / 1000));
}

export function fmtAge(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h`;
}

export function fmtCountdown(expiry: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((expiry - now) / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function fmtPnl(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(3)}`;
}

export function hashSlot(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
