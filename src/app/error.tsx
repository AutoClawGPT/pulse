"use client";

export default function ErrorView({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-start justify-center gap-4 p-8">
      <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase">Fault</h1>
      <p className="max-w-[50ch] text-[var(--muted)]">{error.message}</p>
      <button className="btn btn-hazard" type="button" onClick={reset}>
        Retry
      </button>
    </div>
  );
}
