"""Analyze node — regime detection using Sonnet 4.6."""

from trading_agent.state import AgentState


def analyze(state: AgentState) -> AgentState:
    """Detect market regime and confidence.

    Uses claude-sonnet-4-6 for nuanced market analysis.
    Stub: returns unknown regime with zero confidence.
    """
    return {
        "regime": "unknown",
        "regime_confidence": 0.0,
    }
