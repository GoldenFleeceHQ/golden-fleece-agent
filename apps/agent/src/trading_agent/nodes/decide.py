"""Decide node — Kelly-criterion position sizing using Sonnet 4.6."""

from trading_agent.state import AgentState


def decide(state: AgentState) -> AgentState:
    """Determine trade direction and size using Kelly criterion.

    Uses claude-sonnet-4-6 for reasoning about optimal position sizing.
    Stub: returns no-trade decision.
    """
    return {
        "should_trade": False,
        "trade_direction": "none",
        "position_size": 0.0,
        "reasoning": "Stub: no trade decision made.",
    }
