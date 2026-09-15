import { NextResponse } from "next/server";
import { authHeader } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const a = authHeader(req);
  if (!a) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { bearer: _b, ...pub } = a;
  return NextResponse.json(pub);
}
