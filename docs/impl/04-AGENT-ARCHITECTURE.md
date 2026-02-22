# Agent Architecture Specification

## Framework Decision: Bare Python + Anthropic SDK

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **Bare Python + Anthropic SDK** | **Selected** | 1-2h setup, maximum control, built-in tool helpers, no learning curve |
| LangGraph | Rejected | Adds graph abstraction overhead; benefits (state persistence, error edges) achievable with simpler patterns |
| CrewAI | Rejected | Role-based delegation is irrelevant for a single focused trading agent |
| AutoGen | Rejected | Conversational paradigm doesn't fit an execution loop |

LangGraph was recommended by 2/4 research agents, but for a **13-day hackathon** with a **single-purpose trading agent**, the bare SDK approach wins on speed-to-working-prototype. LangGraph's structured graph adds value for complex multi-agent systems but is over-engineering for our linear pipeline.

## Execution Loop

```
┌─────────────────────────────────────────────┐
│              MONITOR (every 15 min)          │
│   Model: Haiku 4.5 | Effort: low            │
│   Task: Check prices, volatility, sentiment  │
│   Output: signal strength (0-100)            │
└──────────────┬──────────────────────────────┘
               │ signal > threshold
┌──────────────▼──────────────────────────────┐
│              ANALYZE                         │
│   Model: Sonnet 4.6 | Thinking: adaptive    │
│   Task: Deep market analysis, regime detect  │
│   Output: regime label + trade candidates    │
└──────────────┬──────────────────────────────┘
               │ trade candidate found
┌──────────────▼──────────────────────────────┐
│              DECIDE                          │
│   Model: Sonnet 4.6 | Thinking: adaptive    │
│   Task: Trade decision + position sizing     │
│   Output: TradeIntent + Kelly fraction       │
└──────────────┬──────────────────────────────┘
               │ intent created
┌──────────────▼──────────────────────────────┐
│              RISK CHECK (deterministic)       │
│   No LLM - pure Python                       │
│   Task: Circuit breakers, drawdown check,    │
│         slippage ceiling, position limits     │
│   Output: approve/reject + risk artifact      │
└──────────────┬──────────────────────────────┘
               │ approved
┌──────────────▼──────────────────────────────┐
│              EXECUTE (TypeScript)             │
│   Task: Sign EIP-712 intent, submit to       │
│         Risk Router, wait for receipt         │
│   Output: tx hash + execution result          │
└──────────────┬──────────────────────────────┘
               │ executed
┌──────────────▼──────────────────────────────┐
│              EVALUATE + PUBLISH               │
│   Model: Sonnet 4.6 (post-trade analysis)    │
│   Task: Compute PnL, update metrics,         │
│         create validation artifact,           │
│         publish to IPFS + registries          │
│   Output: validation hash on-chain            │
└──────────────────────────────────────────────┘
```

## Model Tiering Strategy

| Phase | Model | Price (in/out per MTok) | When |
|-------|-------|------------------------|------|
| MONITOR | Haiku 4.5 | $1 / $5 | Every 15 min, routine checks |
| ANALYZE | Sonnet 4.6 | $3 / $15 | When interesting signals detected |
| DECIDE | Sonnet 4.6 | $3 / $15 | Actual trade decisions |
| EVALUATE | Sonnet 4.6 | $3 / $15 | Post-trade analysis |
| Deep Analysis | Opus 4.6 | $5 / $25 | 1-2x daily for complex reasoning |

### Budget Estimate

Conservative: ~$17 for 13 days (96 Haiku calls/day, 4-8 Sonnet decisions, 1-2 Opus deep analyses).
Aggressive (heavy dev/testing): $85-170.
**Budget: $200 total** (Tier 3 deposit).

### Key API Configurations

- **Adaptive thinking:** `thinking: {"type": "adaptive"}` - let Claude decide when to engage deep reasoning
- **Prompt caching:** Cache system prompt (strategy rules, risk params, ERC-8004 schemas) for 90% savings
- **Tool use:** Define tools for `get_market_data`, `get_onchain_state`, `execute_trade`, `get_portfolio_state`
- **Context management:** Feed state via XML tags (`<portfolio_state>`, `<open_positions>`, `<market_snapshot>`)

## State Management: SQLite

Zero-config, file-based, full SQL. Tables:

```sql
CREATE TABLE agent_cycles (
  id INTEGER PRIMARY KEY,
  timestamp TEXT,
  phase TEXT,
  model_used TEXT,
  input_hash TEXT,
  output_hash TEXT,
  tokens_used INTEGER
);

CREATE TABLE positions (
  id INTEGER PRIMARY KEY,
  token_address TEXT,
  amount TEXT,
  entry_price REAL,
  entry_timestamp TEXT,
  status TEXT -- 'open' | 'closed'
);

CREATE TABLE decisions (
  id INTEGER PRIMARY KEY,
  cycle_id INTEGER REFERENCES agent_cycles(id),
  decision_type TEXT, -- 'trade' | 'hold' | 'circuit_breaker'
  reasoning_hash TEXT,
  trade_intent_hash TEXT,
  tx_hash TEXT,
  validation_hash TEXT
);

CREATE TABLE portfolio_snapshots (
  id INTEGER PRIMARY KEY,
  timestamp TEXT,
  total_value_usd REAL,
  pnl_realized REAL,
  pnl_unrealized REAL,
  sharpe_ratio REAL,
  max_drawdown REAL,
  regime TEXT
);
```

## Python ↔ TypeScript Communication

The Python agent is the decision engine. TypeScript handles:
- On-chain execution (signing, submitting, reading contracts)
- Dashboard backend (Next.js API routes)

Communication options:
1. **HTTP API** - Python FastAPI exposes endpoints, TS calls them
2. **Shared SQLite** - Python writes decisions, TS reads and executes
3. **Subprocess** - Python spawns TS scripts for on-chain ops

**Decision:** FastAPI HTTP API. Python runs the loop, TS dashboard consumes via REST/WebSocket, TS executor scripts handle on-chain ops called from Python via HTTP.

## Resources

- Anthropic Python SDK: https://docs.anthropic.com/en/docs/sdks/python
- Tool use: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- Extended thinking: https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- Prompt caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
