"""Execute node — on-chain trade execution trigger."""

from trading_agent.state import AgentState


def execute(state: AgentState) -> AgentState:
    """Submit trade transaction on-chain.

    Stub: returns None for tx_hash (no execution).
    """
    return {
        "tx_hash": None,
        "execution_price": None,
    }
