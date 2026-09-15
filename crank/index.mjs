/**
 * PULSE crank — long-lived on this server, never on Vercel.
 * pumpapi WS + Helius fallback + Pyth mark → create/resolve/liq via web intake.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(resolve(__dirname, ".env"));

const WEB = process.env.WEB_APP_URL || "http://127.0.0.1:3000";
const SECRET = process.env.CRANK_SECRET || "";
const PUMP_WS = "wss://stream.pumpapi.io/";
const MIN_MC = Number(process.env.MARKET_NOISE_FILTER_MIN_MC || 20000);
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || "";
const HELIUS_KEY = process.env.HELIUS_API_KEY || "";

function loadEnv(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const k = t.slice(0, i);
      const v = t.slice(i + 1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* missing .env is ok if the process env is set */
  }
}

async function intake(type, payload) {
  const res = await fetch(`${WEB}/api/intake`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-crank-secret": SECRET,
    },
    body: JSON.stringify({ type, payload }),
  });
  if (!res.ok) {
    console.error("intake", type, res.status, await res.text());
  }
}

async function telegram(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("telegram", e);
  }
}

async function heliusSlot() {
  if (!HELIUS_KEY) return 0;
  try {
    const res = await fetch(`https://devnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot", params: [] }),
    });
    const json = await res.json();
    return json.result ?? 0;
  } catch {
    return 0;
  }
}

function toTape(ev) {
  const action = ev.action ?? "";
  if (!["create", "buy", "sell", "migrate"].includes(action)) return null;
  return {
    id: ev.signature ?? `${action}-${ev.mint}-${ev.timestamp}`,
    ts: ev.timestamp ?? Date.now(),
    action,
    mint: ev.mint,
    symbol: ev.symbol,
    name: ev.name,
    mcSol: ev.marketCapQuote,
    pool: ev.pool,
    signature: ev.signature,
    uri: ev.uri,
  };
}

async function pumpLoop() {
  let backoff = 500;
  for (;;) {
    try {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(PUMP_WS);
        ws.on("open", () => {
          backoff = 500;
          console.log("pumpapi stream open");
        });
        ws.on("message", (data) => {
          try {
            const raw = JSON.parse(String(data));
            const tape = toTape(raw);
            if (!tape) return;
            if (tape.action === "create") {
              const mcUsd = (tape.mcSol ?? 0) * 180;
              if (mcUsd < MIN_MC && (tape.mcSol ?? 0) < MIN_MC / 180) return;
            }
            void intake("tape", tape);
          } catch {
            /* ignore */
          }
        });
        ws.on("error", reject);
        ws.on("close", resolve);
      });
    } catch (e) {
      console.error("pump ws", e);
    }
    await sleep(backoff);
    backoff = Math.min(backoff * 2, 15000);
  }
}

async function markLoop() {
  for (;;) {
    try {
      const slot = await heliusSlot();
      const res = await fetch(`${WEB}/api/sol-mark`, { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        if (j.solUsd) await intake("sol", { solUsd: j.solUsd });
      }
      void slot;
    } catch (e) {
      console.error("mark", e);
    }
    await sleep(8000);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

console.log("PULSE crank →", WEB);
void telegram("PULSE crank online (devnet). Tape from pumpapi.io.");
void pumpLoop();
void markLoop();
