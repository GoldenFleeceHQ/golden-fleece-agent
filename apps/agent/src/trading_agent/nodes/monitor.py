"""Monitor node — signal detection using Haiku 4.5."""

from trading_agent.state import AgentState


def monitor(state: AgentState) -> AgentState:
    """Detect trading signals from market data.

    Uses claude-haiku-4-5-20251001 for fast, cheap signal scanning.
    Stub: returns low signal score so the graph routes to END.
    """
    return {
        "signal_score": 0.0,
        "signal_metadata": {"source": "stub", "assets_scanned": 0},
    }
