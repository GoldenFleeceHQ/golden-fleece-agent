# AI Trading Agents with ERC-8004 Hackathon - Strategy & Stack Analysis

## Hackathon Summary

**Dates:** March 9-22, 2026 (13 days)
**Prize Pool:** $50,000 USDC (prizes go into trading accounts with profit-sharing via Surge)
**Core Requirement:** Build a trustless AI financial agent using [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) registries

### What You Must Build

1. Register an agent identity on the ERC-8004 Identity Registry (ERC-721 NFT)
2. Accumulate reputation from objective trading outcomes
3. Produce validation artifacts for every key action (trade intents, risk checks, strategy checkpoints)
4. Execute trades through a whitelisted Risk Router contract
5. Use EIP-712 typed data signatures, EIP-1271 smart contract wallet, EIP-155 chain-ID binding

### How It's Judged

**Not raw PnL.** They explicitly emphasize:

- Risk-adjusted profitability (Sharpe ratio)
- Drawdown control
- Validation quality
- Plus: technology integration, presentation, business value, originality

### Prize Breakdown (Strategy Implications)

| Prize | Amount | Focus |
|-------|--------|-------|
| Best Trustless Trading Agent | $10K + capital program | Overall best |
| Best Risk-Adjusted Return | $5K | Sharpe ratio, not raw PnL |
| Best Validation & Trust Model | $2.5K | ERC-8004 depth |
| Best Yield/Portfolio Agent | $2.5K | DeFi yield strategies |
| Best Compliance & Risk Guardrails | $2.5K | Risk management |

---

## Recommended Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────┐
│                  Dashboard (Next.js)             │
│  PnL · Sharpe · Drawdown · Reputation · Logs    │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────┐
│            Agent Orchestrator (Python)            │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Market    │  │ Strategy │  │ Risk Manager  │  │
│  │ Analyst   │  │ Engine   │  │ (circuit      │  │
│  │ (Claude)  │  │ (Claude) │  │  breakers,    │  │
│  │           │  │          │  │  position     │  │
│  │           │  │          │  │  sizing)      │  │
│  └─────┬────┘  └────┬─────┘  └──────┬────────┘  │
│        │             │               │            │
│  ┌─────┴─────────────┴───────────────┴─────────┐ │
│  │         Validation Logger                    │ │
│  │   (records every decision to ERC-8004)       │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼────────────────────────────┘
                      │
┌─────────────────────┴────────────────────────────┐
│           On-Chain Layer (ethers.js / viem)        │
│                                                    │
│  Identity Registry · Reputation Registry ·         │
│  Validation Registry · Risk Router · DEX           │
│                                                    │
│  Target: Base Sepolia (ERC-8004 already deployed)  │
└────────────────────────────────────────────────────┘
```

---

## Recommended Technology Stack

### Language: Python + TypeScript (hybrid)

**Python** for the AI decision engine and trading logic:

- Superior AI/ML ecosystem (Claude SDK, LangChain, numpy, pandas, ta-lib)
- Easier to prototype trading strategies in 13 days
- Better backtesting libraries

**TypeScript** for on-chain integration and dashboard:

- viem/ethers.js for contract interactions
- Next.js for the real-time dashboard
- Better EVM tooling ecosystem

### AI Layer

| Component | Recommendation | Why |
|-----------|---------------|-----|
| **Primary LLM** | **Claude Opus 4.6** via [Anthropic SDK](https://docs.anthropic.com/en/api) | Best reasoning for market analysis; extended thinking for complex decisions |
| **Agent Framework** | **Custom lightweight orchestrator** or **LangGraph** | CrewAI adds complexity; a focused custom loop is faster to build and debug in 13 days |
| **Embeddings** | Voyage AI or Claude's built-in | For semantic search over market research/news |

### Smart Contract / On-Chain Layer

| Component | Recommendation | Why |
|-----------|---------------|-----|
| **Target Chain** | **Base Sepolia** | L2 testnet, ERC-8004 already deployed, fast and cheap |
| **Contract Framework** | **Foundry** | Fast compilation, good testing, industry standard |
| **ERC-8004 Contracts** | [erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts) reference impl | Official; already deployed on Base Sepolia |
| **JS/TS SDK** | **viem** + [erc-8004-js](https://github.com/sudeepb02/awesome-erc8004) | Lightweight TypeScript library for registry interactions |
| **Wallet** | **Safe (Gnosis Safe)** or custom EIP-1271 wallet | Required for smart contract wallet signatures |
| **Signing** | **EIP-712 typed data** | Required for trade intents |

### Data Sources

#### Price & Market Data

| Source | What It Provides | Cost |
|--------|-----------------|------|
| [GeckoTerminal API](https://www.geckoterminal.com/dex-api) | Real-time DEX prices, OHLC, volume, liquidity across 1800+ DEXes | Free |
| [CoinGecko API](https://www.coingecko.com/en/api) | Broad crypto market data, historical prices | Free tier |
| [DeFiLlama API](https://defillama.com/docs/api) | TVL, protocol yields, stablecoin flows | Free |
| [Chainlink Price Feeds](https://data.chain.link/) | On-chain oracle prices (reliable reference) | Free (on-chain reads) |

#### On-Chain Analytics

| Source | What It Provides | Cost |
|--------|-----------------|------|
| **The Graph** (subgraphs) | Indexed DEX events, swap history, liquidity changes | Free tier |
| [Bitquery](https://bitquery.io/products/dex) | DEX trade history, token analytics, cross-chain data | Free tier |
| **Alchemy / Infura** | RPC access, event logs, mempool data | Free tier |
| **Dune Analytics API** | Custom SQL queries over on-chain data | Free tier |

#### Sentiment & News

| Source | What It Provides | Cost |
|--------|-----------------|------|
| **CryptoPanic API** | Aggregated crypto news with sentiment scores | Free |
| **Twitter/X API** | Real-time crypto sentiment (key for short-term moves) | Limited free |
| **Fear & Greed Index** | Market sentiment indicator | Free |

#### DeFi-Specific

| Source | What It Provides | Cost |
|--------|-----------------|------|
| **Aave / Compound APIs** | Lending rates, utilization | Free |
| **DEX subgraphs** (Uniswap, etc.) | Pool states, liquidity depth, fee tiers | Free |

### Dashboard & Presentation

| Component | Recommendation | Why |
|-----------|---------------|-----|
| **Framework** | **Next.js 15** | Fast to build, good for real-time data |
| **Charting** | **Lightweight Charts** (TradingView) or **Recharts** | Professional-looking trading charts |
| **Real-time** | **WebSocket** or **Server-Sent Events** | Live PnL updates, trade feed |
| **Styling** | **Tailwind + shadcn/ui** | Fast to build professional UI |

### Infrastructure

| Component | Recommendation |
|-----------|---------------|
| **Deployment** | Vercel (dashboard) + Railway/Fly.io (Python agent) |
| **Database** | **Supabase** (PostgreSQL) for trade history, agent state |
| **Queue/Events** | Redis pub/sub or simple polling |
| **Monitoring** | Simple logging + Supabase tables |

---

## ERC-8004 Technical Details

### Three Core Registries

#### Identity Registry (ERC-721 + URIStorage)

```solidity
// Registration
function register(string agentURI, MetadataEntry[] calldata metadata)
    external returns (uint256 agentId)
function register(string agentURI) external returns (uint256 agentId)
function register() external returns (uint256 agentId)

// URI Management
function setAgentURI(uint256 agentId, string calldata newURI) external

// Metadata
function getMetadata(uint256 agentId, string memory metadataKey)
    external view returns (bytes memory)
function setMetadata(uint256 agentId, string memory metadataKey,
    bytes memory metadataValue) external

// Agent Wallet
function setAgentWallet(uint256 agentId, address newWallet,
    uint256 deadline, bytes calldata signature) external
function getAgentWallet(uint256 agentId) external view returns (address)
```

#### Reputation Registry

```solidity
function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals,
    string calldata tag1, string calldata tag2, string calldata endpoint,
    string calldata feedbackURI, bytes32 feedbackHash) external

function getSummary(uint256 agentId, address[] calldata clientAddresses,
    string tag1, string tag2) external view
    returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)
```

#### Validation Registry

```solidity
function validationRequest(address validatorAddress, uint256 agentId,
    string requestURI, bytes32 requestHash) external

function validationResponse(bytes32 requestHash, uint8 response,
    string responseURI, bytes32 responseHash, string tag) external

function getValidationStatus(bytes32 requestHash) external view
    returns (address validatorAddress, uint256 agentId, uint8 response,
        bytes32 responseHash, string tag, uint256 lastUpdate)
```

### Agent Registration File Structure

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Trading Agent",
  "description": "AI-powered trustless trading agent",
  "image": "ipfs://...",
  "active": true,
  "services": [
    {
      "name": "trading",
      "endpoint": "https://...",
      "version": "1.0",
      "skills": ["market-analysis", "trade-execution", "risk-management"],
      "domains": ["defi", "trading"]
    }
  ],
  "supportedTrust": ["reputation", "crypto-economic"],
  "registrations": [
    {
      "agentId": 123,
      "agentRegistry": "eip155:84532:0x..."
    }
  ]
}
```

### Required EIP Dependencies

- **EIP-155:** Chain ID specification
- **EIP-712:** Typed data signing for wallet verification
- **EIP-721:** NFT standard (Identity Registry base)
- **EIP-1271:** Smart contract signature validation

---

## Strategic Recommendations

### 1. Target the "Best Risk-Adjusted Return" Prize ($5K)

Most teams will chase raw PnL. Differentiate by building an agent that:

- Prioritizes Sharpe ratio over absolute returns
- Has strict drawdown limits (hard-coded circuit breakers)
- Uses position sizing based on Kelly criterion or risk parity
- Can demonstrate consistent, steady returns

### 2. Go Deep on Validation Quality

Record **every decision** to the ERC-8004 Validation Registry:

- Market analysis reasoning (hash of Claude's analysis)
- Strategy selection rationale
- Risk check results before each trade
- Post-trade outcome validation

This targets both the "Best Validation & Trust Model" prize and improves your score on "Application of Technology" judging criteria.

### 3. Multi-Strategy with Regime Detection

Rather than one strategy, build 2-3 simple strategies and use Claude to detect market regimes:

- **Trending market** -> Momentum/trend-following
- **Ranging market** -> Mean-reversion
- **High volatility** -> Reduce exposure, tighten stops
- **Yield opportunity** -> Allocate to DeFi yield (targets "Best Yield/Portfolio Agent")

### 4. Keep It Simple and Working

13 days is short. Better to have a clean, working agent with 2 strategies than a broken agent with 10. The judging criteria value **presentation** and **business value** equally with technical depth.

---

## Suggested Project Structure

```
hackathon/
├── agent/                    # Python - AI trading agent
│   ├── core/
│   │   ├── analyst.py        # Market analysis via Claude
│   │   ├── strategist.py     # Strategy selection & signals
│   │   ├── risk_manager.py   # Position sizing, circuit breakers
│   │   └── executor.py       # Trade intent signing & submission
│   ├── data/
│   │   ├── price_feed.py     # GeckoTerminal/CoinGecko integration
│   │   ├── onchain.py        # On-chain data (The Graph, RPC)
│   │   └── sentiment.py      # News/sentiment feeds
│   ├── erc8004/
│   │   ├── identity.py       # Register agent, manage identity
│   │   ├── reputation.py     # Read/write reputation signals
│   │   └── validation.py     # Log validation artifacts
│   └── config.py
├── contracts/                # Foundry - Solidity contracts
│   ├── src/
│   │   └── AgentWallet.sol   # EIP-1271 smart contract wallet
│   └── foundry.toml
├── dashboard/                # Next.js - Real-time UI
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   └── api/              # API routes for agent data
│   └── components/
│       ├── PnLChart.tsx
│       ├── TradeLog.tsx
│       └── ReputationScore.tsx
└── README.md
```

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Hackathon sandbox APIs undocumented | Join Discord early (March 9), attend workshops |
| ERC-8004 SDK immaturity | Use reference contracts directly; keep integration layer thin |
| LLM hallucinating trade signals | Claude only proposes; hard-coded risk rules have veto power |
| Time pressure (13 days) | MVP first (1 strategy + basic ERC-8004), iterate from there |
| Testnet instability | Build with local fork fallback (Foundry anvil) |

---

## Key Resources

- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [Hackathon Page](https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004)
- [Awesome ERC-8004 Resources](https://github.com/sudeepb02/awesome-erc8004)
- [ERC-8004 Official Contracts](https://github.com/erc-8004/erc-8004-contracts)
- [ERC-8004 JS SDK](https://github.com/sudeepb02/awesome-erc8004)
- [GeckoTerminal DEX API](https://www.geckoterminal.com/dex-api)
- [CoinGecko API](https://www.coingecko.com/en/api)
- [Bitquery DEX API](https://bitquery.io/products/dex)
- [ERC-8004 Ethereum Magicians Discussion](https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098)
- [8004.org Official Site](http://8004.org)
