"""Tests for the trading agent graph."""

from trading_agent.graph import SIGNAL_THRESHOLD, build_graph


def test_graph_compiles():
    """Graph should compile without errors."""
    graph = build_graph().compile()
    assert graph is not None


def test_graph_has_all_nodes():
    """Graph should contain all six trading nodes."""
    builder = build_graph()
    expected_nodes = {"monitor", "analyze", "decide", "risk_check", "execute", "evaluate"}
    actual_nodes = set(builder.nodes.keys())
    assert expected_nodes == actual_nodes


def test_idle_cycle(initial_state):
    """With no signal, graph should complete quickly via monitor → END."""
    graph = build_graph().compile()
    result = graph.invoke(initial_state)
    # Monitor stub returns 0.0, which is below threshold, so graph ends early
    assert result["signal_score"] < SIGNAL_THRESHOLD
