import { PerformanceCards } from "@/components/PerformanceCards";
import { TradingChart } from "@/components/TradingChart";
import { ReasoningPanel } from "@/components/ReasoningPanel";
import { RiskControls } from "@/components/RiskControls";
import { TrustPanel } from "@/components/TrustPanel";

export default function Dashboard() {
  return (
    <main className="min-h-screen p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Golden Fleece</h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Agent Idle
          </span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* KPI Cards — full width */}
        <div className="col-span-12">
          <PerformanceCards />
        </div>

        {/* Chart — 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          <TradingChart />
        </div>

        {/* Reasoning — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          <ReasoningPanel />
        </div>

        {/* Risk Controls — 6 cols */}
        <div className="col-span-12 lg:col-span-6">
          <RiskControls />
        </div>

        {/* Trust Panel — 6 cols */}
        <div className="col-span-12 lg:col-span-6">
          <TrustPanel />
        </div>
      </div>
    </main>
  );
}
