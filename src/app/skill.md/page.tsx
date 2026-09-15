import { readFileSync } from "fs";
import { join } from "path";
import { Chrome } from "@/components/Chrome";

export const dynamic = "force-dynamic";

export default function SkillPage() {
  let content = "SKILL.md missing";
  try {
    content = readFileSync(join(process.cwd(), "SKILL.md"), "utf8");
  } catch {
    content = "# SKILL.md missing";
  }
  return (
    <Chrome>
      <div className="page-body p-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          agent registry · also GET /api/skill
        </p>
        <pre className="mt-4 max-w-4xl whitespace-pre-wrap text-[12px] leading-relaxed">{content}</pre>
      </div>
    </Chrome>
  );
}
