"""Tests for the risk check node."""

from trading_agent.nodes.risk_check import risk_check


def test_risk_stub_rejects_all(high_signal_state):
    """Risk check stub should reject all trades."""
    result = risk_check(high_signal_state)
    assert result["risk_approved"] is False
    assert len(result["risk_flags"]) > 0
