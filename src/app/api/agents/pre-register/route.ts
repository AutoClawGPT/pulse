import { NextResponse } from "next/server";
import { preRegister } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      capabilities?: string[];
      endpoint?: string;
    };
    const r = preRegister({
      name: body.name ?? "",
      description: body.description ?? "",
      capabilities: body.capabilities,
      endpoint: body.endpoint,
    });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
