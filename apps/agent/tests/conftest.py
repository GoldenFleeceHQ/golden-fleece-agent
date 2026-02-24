"""Test fixtures for the trading agent."""

import pytest

from trading_agent.state import AgentState


@pytest.fixture
def initial_state() -> AgentState:
    """Empty initial state — typical graph entry point."""
    return AgentState()


@pytest.fixture
def high_signal_state() -> AgentState:
    """State with a high signal score to trigger analysis."""
    return AgentState(
        signal_score=0.85,
        signal_metadata={"source": "test", "assets_scanned": 5},
    )
