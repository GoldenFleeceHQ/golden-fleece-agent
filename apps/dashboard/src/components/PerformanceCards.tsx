"use client";

const cards = [
  { label: "PnL", value: "$0.00", delta: "0%" },
  { label: "Sharpe", value: "—", delta: "" },
  { label: "Drawdown", value: "0%", delta: "" },
  { label: "Win Rate", value: "—", delta: "" },
  { label: "Regime", value: "Unknown", delta: "" },
  { label: "Status", value: "Idle", delta: "" },
];

export function PerformanceCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
        >
          <p className="text-xs text-zinc-500">{card.label}</p>
          <p className="mt-1 text-lg font-semibold">{card.value}</p>
          {card.delta && (
            <p className="mt-0.5 text-xs text-zinc-400">{card.delta}</p>
          )}
        </div>
      ))}
    </div>
  );
}
