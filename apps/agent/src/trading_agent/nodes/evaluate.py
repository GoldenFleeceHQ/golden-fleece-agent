"""Evaluate node — post-trade analysis and IPFS artifact storage."""

from trading_agent.state import AgentState


def evaluate(state: AgentState) -> AgentState:
    """Evaluate trade outcome and store reasoning artifacts on IPFS.

    Stub: returns no PnL and no IPFS CID.
    """
    return {
        "pnl": None,
        "ipfs_cid": None,
    }
