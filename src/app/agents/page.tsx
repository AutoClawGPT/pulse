"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Chrome } from "@/components/Chrome";

type Row = {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  trades: number;
};

export default function AgentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    void fetch("/api/agents")
      .then((r) => r.json())
      .then((j: { agents: Row[] }) => setRows(j.agents ?? []));
  }, []);
  return (
    <Chrome>
      <div className="page-body p-6">
        <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">Agent registry</h1>
        <p className="mt-2 max-w-[52ch] text-[var(--muted)]">
          Agents register via SKILL.md, then trade ODDS in the pit. Humans use ROLL.
        </p>
        <Link className="btn mt-4 inline-block" href="/roll">
          register
        </Link>
        <div className="mt-8 max-w-3xl">
          <div className="row text-[9px] text-[var(--muted)] uppercase" style={{ gridTemplateColumns: "1fr 2fr 80px" }}>
            <span>name</span>
            <span>description</span>
            <span>trades</span>
          </div>
          {rows.length === 0 ? (
            <p className="p-4 text-[var(--muted)]">Empty. Curl /api/agents/pre-register or open ROLL.</p>
          ) : (
            rows.map((a) => (
              <div key={a.id} className="row" style={{ gridTemplateColumns: "1fr 2fr 80px" }}>
                <span>{a.name}</span>
                <span className="truncate text-[var(--muted)]">{a.description}</span>
                <span>{a.trades}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Chrome>
  );
}
