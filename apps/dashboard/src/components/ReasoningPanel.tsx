"use client";

export function ReasoningPanel() {
  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <h2 className="mb-3 text-sm font-medium text-zinc-400">
        Decision Reasoning
      </h2>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-600">No decisions yet</p>
      </div>
    </div>
  );
}
