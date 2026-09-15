import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const path = join(process.cwd(), "SKILL.md");
  const body = readFileSync(path, "utf8");
  return new NextResponse(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
