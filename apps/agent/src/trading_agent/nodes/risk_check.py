"""Risk check node — pure Python circuit breakers."""

from trading_agent.state import AgentState


def risk_check(state: AgentState) -> AgentState:
    """Apply circuit breakers and risk limits.

    Pure Python (no LLM) — checks position limits, drawdown, etc.
    Stub: rejects all trades.
    """
    return {
        "risk_approved": False,
        "risk_flags": ["stub: all trades rejected during scaffolding"],
    }
