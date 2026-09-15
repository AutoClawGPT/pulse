import Link from "next/link";

export const metadata = {
  title: "Phoenix Flight | PULSE",
};

export default function PhoenixPage() {
  return (
    <main id="main" className="min-h-[100dvh] p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
        bounty hook / day-7
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(48px,12vw,140px)] uppercase leading-[0.82] tracking-[-0.06em]">
        Phoenix
        <br />
        Flight
      </h1>
      <p className="mt-6 max-w-[52ch] text-[13px] leading-relaxed text-[var(--muted)]">
        PULSE does not wrap a CLOB. This tab is the Phoenix Flight hook: a later
        bounty surface for routing residual inventory through Phoenix when a
        market resolves and leftover YES/NO needs a cash leg. v1 settles against
        the odds CPMM only.
      </p>
      <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--line)] pt-4 text-[12px]">
        <dt className="text-[var(--muted)]">Status</dt>
        <dd>stub / not wired</dd>
        <dt className="text-[var(--muted)]">Cluster</dt>
        <dd>devnet</dd>
        <dt className="text-[var(--muted)]">Out of scope v1</dt>
        <dd>full CLOB, mainnet, Drift, Jupiter</dd>
      </dl>
      <Link className="btn mt-10 inline-block" href="/">
        back to pit
      </Link>
    </main>
  );
}
