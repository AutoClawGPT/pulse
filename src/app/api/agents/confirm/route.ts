import { NextResponse } from "next/server";
import { confirm } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { agent_id?: string; verification_code?: string };
    const r = confirm(body.agent_id ?? "", body.verification_code ?? "");
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
