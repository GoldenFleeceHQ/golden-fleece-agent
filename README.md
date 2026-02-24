# Golden Fleece

Autonomous AI trading agent for the [ERC-8004 Hackathon](https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004) (March 9–22, 2026). Registers on-chain identity, executes risk-adjusted trades on Base Sepolia, and produces verifiable validation artifacts — all through the ERC-8004 trust layer.

> **Not an AI that trades — a verifiable on-chain track record generator.**

## How It Works

```
Market Data → Monitor → Analyze → Decide → Risk Check → Execute → Evaluate
               (Haiku)  (Sonnet)  (Sonnet)  (Python)    (On-chain) (Sonnet)
```

The agent runs a 6-node [LangGraph](https://github.com/langchain-ai/langgraph) pipeline every 15 minutes. Each cycle scans for signals, detects market regime, sizes positions via fractional Kelly criterion, enforces hard circuit breakers, executes through a Risk Router on Uniswap V3, and publishes a verifiable evidence bundle to IPFS + ERC-8004 registries.

A separate **Validator Agent** independently verifies every trade and posts reputation feedback — because the Reputation Registry prevents self-scoring.

## Stack

| Layer | Technology |
|-------|-----------|
| Agent | Python · LangGraph · FastAPI · Claude (Haiku/Sonnet/Opus) |
| Dashboard | Next.js 16 · Tailwind · shadcn/ui · TradingView Lightweight Charts |
| Contracts | Foundry · Solidity 0.8.28 · OpenZeppelin |
| Blockchain | Base Sepolia · Uniswap V3 · ERC-8004 Registries |
| Storage | IPFS (Pinata) · SQLite |

## Quick Start

```bash
# Install everything
make install

# Run tests
make test

# Start agent (port 8000) + dashboard (port 3000)
make dev
```

**Prerequisites:** Python 3.12+, Node 20+, [uv](https://docs.astral.sh/uv/), [pnpm](https://pnpm.io/), [Foundry](https://book.getfoundry.sh/)

Copy `.env.example` to `.env` and fill in your keys before running.

## Project Structure

```
apps/
  agent/              Python — LangGraph trading pipeline + FastAPI server
    src/trading_agent/
      graph.py          StateGraph: monitor→analyze→decide→risk_check→execute→evaluate
      state.py          AgentState TypedDict (shared state across nodes)
      server.py         FastAPI with WebSocket + REST endpoints
      nodes/            One file per pipeline step
  dashboard/          Next.js — real-time monitoring UI
    src/components/     Chart, Reasoning, Risk, Trust, Performance panels
    src/hooks/          WebSocket hook with auto-reconnect

contracts/            Foundry — Solidity smart contracts
  src/                  RiskRouter + ERC-8004 interface stubs
  test/                 Unit tests (mocks) + fork tests (Anvil)

packages/shared/      TypeScript types mirroring Python state + contract ABIs
scripts/              Agent registration, wallet bootstrap
docs/                 Research, implementation specs, study guide
```

## Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start agent + dashboard in parallel |
| `make agent` | Start Python agent only (port 8000) |
| `make dashboard` | Start Next.js dashboard only (port 3000) |
| `make test` | Run all tests (agent + contracts) |
| `make test-agent` | Run Python tests |
| `make test-contracts` | Run Solidity unit tests |
| `make test-fork` | Run Solidity fork tests against Base Sepolia |
| `make lint` | Run ruff + eslint |
| `make fmt` | Auto-format Python code |
| `make install` | Install all dependencies |
| `make register` | Register agent on ERC-8004 Identity Registry |
| `make deploy` | Deploy contracts to Base Sepolia |

## Documentation

- **[Study Guide](docs/STUDY_GUIDE.md)** — Comprehensive overview for developers new to the project (ERC-8004, LangGraph, trading concepts, architecture)
- **[Implementation Specs](docs/impl/)** — Detailed specs for each subsystem (10 documents)
- **[Research](docs/research/)** — Background research on ERC-8004, the hackathon, and trading agents

## ERC-8004 Integration

The agent uses all three ERC-8004 registries:

- **Identity Registry** — Agent registers and receives an ERC-721 NFT identity
- **Reputation Registry** — Validator posts multi-dimensional feedback (Sharpe, drawdown, yield, win rate)
- **Validation Registry** — Every trade produces an IPFS artifact bundle with on-chain hash verification

## Git Workflow

All work happens on `dev`. Merge to `main` for releases.

```bash
git checkout dev
# ... make changes ...
git push origin dev
# merge to main when ready
```

## License

MIT
