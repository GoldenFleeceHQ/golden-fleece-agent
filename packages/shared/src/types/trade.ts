export type TradeDirection = "long" | "short" | "none";

export interface Trade {
  id: string;
  direction: TradeDirection;
  size: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  txHash?: string;
  timestamp: string;
  reasoning: string;
}

export interface TradeOutcome {
  tradeId: string;
  pnl: number;
  ipfsCid: string;
  reputationDelta: number;
}
