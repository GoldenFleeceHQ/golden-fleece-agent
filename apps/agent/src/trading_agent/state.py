"""Agent state definition for the trading graph."""

from __future__ import annotations

from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    """Full state flowing through the trading agent graph.

    All fields are optional (total=False) so nodes can return partial updates.
    """

    # Monitor node outputs
    signal_score: float
    signal_metadata: dict[str, Any]

    # Analyze node outputs
    regime: str  # e.g. "trending", "mean-reverting", "volatile"
    regime_confidence: float

    # Decide node outputs
    should_trade: bool
    trade_direction: str  # "long" or "short"
    position_size: float  # Kelly-sized fraction
    reasoning: str

    # Risk check outputs
    risk_approved: bool
    risk_flags: list[str]

    # Execute node outputs
    tx_hash: str | None
    execution_price: float | None

    # Evaluate node outputs
    pnl: float | None
    ipfs_cid: str | None

    # Metadata
    cycle_id: str
    timestamp: str
    error: str | None
