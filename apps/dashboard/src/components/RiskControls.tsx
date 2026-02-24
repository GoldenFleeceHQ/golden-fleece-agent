"use client";

const circuitBreakers = [
  { name: "Max Position Size", status: "ok", value: "—" },
  { name: "Daily Loss Limit", status: "ok", value: "—" },
  { name: "Max Drawdown", status: "ok", value: "—" },
  { name: "Correlation Limit", status: "ok", value: "—" },
];

export function RiskControls() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <h2 className="mb-3 text-sm font-medium text-zinc-400">
        Circuit Breakers
      </h2>
      <div className="space-y-2">
        {circuitBreakers.map((cb) => (
          <div
            key={cb.name}
            className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
          >
            <span className="text-sm">{cb.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{cb.value}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
