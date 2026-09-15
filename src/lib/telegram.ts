const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT = process.env.TELEGRAM_CHAT_ID ?? "";

export async function telegram(text: string): Promise<boolean> {
  if (!TOKEN || !CHAT) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT,
        text,
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pingTelegram(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  if (!TOKEN) return { ok: false, ms: 0, detail: "no token" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getMe`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { ok?: boolean; result?: { username: string } };
    return {
      ok: Boolean(json.ok),
      ms: Date.now() - t0,
      detail: json.result?.username ?? res.statusText,
    };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: String(e) };
  }
}
