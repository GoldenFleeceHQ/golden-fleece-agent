"""Trading agent graph definition."""

from langgraph.graph import END, START, StateGraph

from trading_agent.nodes import analyze, decide, evaluate, execute, monitor, risk_check
from trading_agent.state import AgentState

SIGNAL_THRESHOLD = 0.5


def _should_analyze(state: AgentState) -> str:
    """Route to analyze if signal is strong enough, otherwise end."""
    if state.get("signal_score", 0.0) >= SIGNAL_THRESHOLD:
        return "analyze"
    return END


def _should_trade(state: AgentState) -> str:
    """Route to risk_check if decide says trade, otherwise end."""
    if state.get("should_trade", False):
        return "risk_check"
    return END


def _risk_approved(state: AgentState) -> str:
    """Route to execute if risk check passes, otherwise end."""
    if state.get("risk_approved", False):
        return "execute"
    return END


def build_graph() -> StateGraph:
    """Build the trading agent state graph (uncompiled)."""
    builder = StateGraph(AgentState)

    builder.add_node("monitor", monitor)
    builder.add_node("analyze", analyze)
    builder.add_node("decide", decide)
    builder.add_node("risk_check", risk_check)
    builder.add_node("execute", execute)
    builder.add_node("evaluate", evaluate)

    builder.add_edge(START, "monitor")
    builder.add_conditional_edges("monitor", _should_analyze, {"analyze": "analyze", END: END})
    builder.add_edge("analyze", "decide")
    builder.add_conditional_edges("decide", _should_trade, {"risk_check": "risk_check", END: END})
    builder.add_conditional_edges(
        "risk_check", _risk_approved, {"execute": "execute", END: END}
    )
    builder.add_edge("execute", "evaluate")
    builder.add_edge("evaluate", END)

    return builder


# Pre-compiled graph for import convenience
app = build_graph().compile()
