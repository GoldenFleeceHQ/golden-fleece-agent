"use client";

export function TrustPanel() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <h2 className="mb-3 text-sm font-medium text-zinc-400">
        ERC-8004 Trust Layer
      </h2>
      <div className="space-y-3">
        <div className="rounded-lg bg-white/[0.02] px-3 py-2">
          <p className="text-xs text-zinc-500">Identity</p>
          <p className="text-sm">Not registered</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] px-3 py-2">
          <p className="text-xs text-zinc-500">Reputation Score</p>
          <p className="text-sm">—</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] px-3 py-2">
          <p className="text-xs text-zinc-500">Validation Status</p>
          <p className="text-sm">—</p>
        </div>
      </div>
    </div>
  );
}
