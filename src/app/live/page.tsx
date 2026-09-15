"use client";

import { Chrome } from "@/components/Chrome";
import { useLiveTape } from "@/hooks/use-live-tape";
import { usePulse } from "@/hooks/use-pulse";
import { ageSec, fmtAge, fmtMc, shortMint } from "@/lib/format";

export default function LivePage() {
  const { data } = usePulse();
  const live = useLiveTape(data?.solUsd ?? 180);
  const rows = live.tape.length ? live.tape : (data?.tape ?? []);
  const solUsd = data?.solUsd ?? 180;

  return (
    <Chrome>
      <div className="page-body">
        <div className="panel-h">
          <span>[ live / pump.fun firehose ]</span>
          <span>
            {live.live ? "STREAM OPEN" : "reconnecting"} · {rows.length} events
          </span>
        </div>
        <div
          className="row text-[9px] text-[var(--muted)] uppercase tracking-[0.14em]"
          style={{ gridTemplateColumns: "56px 72px 1fr 90px 1fr 120px" }}
        >
          <span>age</span>
          <span>action</span>
          <span>token</span>
          <span>mc</span>
          <span>mint</span>
          <span>sig</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-[var(--muted)]" role="status">
            Waiting on wss://stream.pumpapi.io — creates, buys, sells, migrates land here.
          </p>
        ) : (
          rows.map((ev) => (
            <div
              key={ev.id}
              className="row"
              data-fresh={ageSec(ev.ts) < 6}
              style={{ gridTemplateColumns: "56px 72px 1fr 90px 1fr 120px" }}
            >
              <span className="text-[var(--muted)]">{fmtAge(ageSec(ev.ts))}</span>
              <span className={ev.action === "create" ? "text-[var(--hazard)]" : ""}>
                {ev.action}
              </span>
              <span className="truncate uppercase">{ev.symbol ?? "???"}</span>
              <span>{fmtMc(ev.mcSol, solUsd)}</span>
              <span className="truncate text-[var(--muted)]">{shortMint(ev.mint, 6)}</span>
              <span className="truncate text-[var(--muted)]">{shortMint(ev.signature, 4)}</span>
            </div>
          ))
        )}
      </div>
    </Chrome>
  );
}
