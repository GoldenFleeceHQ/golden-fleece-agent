/** Mirrors the Python AgentState TypedDict */
export interface AgentState {
  // Monitor
  signalScore?: number;
  signalMetadata?: Record<string, unknown>;

  // Analyze
  regime?: string;
  regimeConfidence?: number;

  // Decide
  shouldTrade?: boolean;
  tradeDirection?: string;
  positionSize?: number;
  reasoning?: string;

  // Risk check
  riskApproved?: boolean;
  riskFlags?: string[];

  // Execute
  txHash?: string | null;
  executionPrice?: number | null;

  // Evaluate
  pnl?: number | null;
  ipfsCid?: string | null;

  // Metadata
  cycleId?: string;
  timestamp?: string;
  error?: string | null;
}

export interface TradeIntent {
  direction: string;
  size: number;
  reasoning: string;
  agentAddress: string;
}

export type AgentStatus = "idle" | "monitoring" | "analyzing" | "deciding" | "executing" | "evaluating";
