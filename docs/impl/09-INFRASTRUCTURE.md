# Infrastructure & DevOps Specification

## Monorepo Structure

Use **pnpm workspaces + Makefile** as cross-language task runner. Turborepo has no native Python support; Nx adds config overhead not worth it for a hackathon.

```
golden-fleece-agent/
├── apps/
│   ├── agent/                 # Python - AI trading agent
│   │   ├── core/
│   │   │   ├── analyst.py     # Market analysis via Claude
│   │   │   ├── strategist.py  # Strategy selection & signals
│   │   │   ├── risk_manager.py# Position sizing, circuit breakers
│   │   │   └── executor.py    # Trade intent creation
│   │   ├── data/
│   │   │   ├── price_feed.py  # GeckoTerminal/Chainlink
│   │   │   ├── onchain.py     # On-chain data (RPC, subgraphs)
│   │   │   └── sentiment.py   # CryptoPanic, F&G
│   │   ├── erc8004/
│   │   │   ├── identity.py    # Register agent, manage identity
│   │   │   ├── reputation.py  # Reputation scoring
│   │   │   └── validation.py  # Validation artifact pipeline
│   │   ├── server.py          # FastAPI server (WebSocket + REST)
│   │   ├── main.py            # Agent entry point
│   │   └── pyproject.toml
│   │
│   └── dashboard/             # Next.js - Real-time UI
│       ├── app/
│       │   ├── page.tsx       # Main dashboard
│       │   └── api/           # API routes
│       ├── components/
│       │   ├── TradingChart.tsx
│       │   ├── ReasoningPanel.tsx
│       │   ├── RiskControls.tsx
│       │   └── TrustPanel.tsx
│       ├── package.json
│       └── next.config.js
│
├── contracts/                 # Foundry - Solidity
│   ├── src/
│   │   ├── RiskRouter.sol     # Trade intent verification + execution
│   │   └── AgentWallet.sol    # EIP-1271 wallet (if needed)
│   ├── test/
│   └── foundry.toml
│
├── packages/
│   └── shared/                # Shared TypeScript types
│       ├── abis/              # Contract ABIs
│       └── types/             # Shared type definitions
│
├── scripts/
│   ├── bootstrap.sh           # Faucet provisioning
│   ├── register-agent.ts      # ERC-8004 registration
│   └── deploy-contracts.sh    # Foundry deployment
│
├── Makefile                   # Cross-language task runner
├── pnpm-workspace.yaml
├── .env.example
└── .gitignore
```

## Python Environment: uv

**uv** is 10-100x faster than pip (Rust-based). Setup in 30 seconds:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
cd apps/agent
uv init
uv add anthropic web3 httpx fastapi uvicorn pydantic aiohttp
uv add --dev pytest ruff
```

## Makefile

```makefile
.PHONY: dev agent dashboard contracts test bootstrap

dev:
	$(MAKE) -j2 agent dashboard

agent:
	cd apps/agent && uv run uvicorn server:app --reload --port 8000

dashboard:
	cd apps/dashboard && pnpm dev

contracts:
	cd contracts && forge build

test:
	cd apps/agent && uv run pytest
	cd contracts && forge test

bootstrap:
	bash scripts/bootstrap.sh

register:
	cd scripts && npx tsx register-agent.ts

deploy:
	cd contracts && forge script script/Deploy.s.sol --rpc-url $$BASE_SEPOLIA_RPC --broadcast

lint:
	cd apps/agent && uv run ruff check .
	cd apps/dashboard && pnpm lint
```

## Deployment

| Component | Platform | Tier | Cost (13 days) |
|-----------|----------|------|----------------|
| Dashboard | **Vercel** | Free | $0 |
| Python Agent | **Railway** | Starter ($5/mo) | ~$5-15 |
| Total | | | **~$5-15** |

### Vercel (Dashboard)

- Zero-config Next.js deployment
- Built-in environment variable management
- **Limitation:** 10-second function timeout for API routes. Use Railway for long-running processes.

### Railway (Agent)

- GitHub auto-deploy
- Persistent container (no cold starts)
- Native Docker support
- Expose `/health` endpoint for monitoring

**Alternative:** Render (free tier with cold starts if budget is zero).

## Secrets Management

### .env.example

```
# AI
ANTHROPIC_API_KEY=sk-ant-...

# On-chain
PRIVATE_KEY=0x...          # Agent NFT owner (cold)
EXECUTION_KEY=0x...        # Trading wallet (hot)
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/...
BACKUP_RPC=https://rpc.ankr.com/base_sepolia

# ERC-8004
IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
REPUTATION_REGISTRY=0x8004B663056A597Dffe9eCcC1965A193B7388713
AGENT_ID=

# Data
PINATA_JWT=...
CRYPTOPANIC_API_KEY=...

# Infra
DATABASE_PATH=./data/agent.db
```

### Key Separation

| Key | Purpose | Security |
|-----|---------|----------|
| NFT Owner (cold) | Agent registration, identity management | Store securely, use rarely |
| Execution Wallet (hot) | Signs TradeIntents, submits trades | Used frequently, minimal funds |

**Never** bake private keys into artifacts. Only include public addresses and signatures.

### Runtime Injection

- **Python:** `python-dotenv` loads `.env.local`
- **Next.js:** `@t3-oss/env-nextjs` for type-safe env vars
- **Railway/Vercel:** Built-in environment variable management, auto-injected at runtime

## Day-1 Setup Checklist

1. Initialize repo structure with pnpm workspaces
2. `uv init` for Python, `pnpm create next-app` for dashboard
3. Set up `.env.local` with API keys and RPC URLs
4. Deploy dashboard to Vercel (get live URL early)
5. Deploy agent to Railway (or run locally)
6. Run bootstrap script (faucet provisioning)
7. Verify contract connectivity (read registry names)
8. Register agent on ERC-8004

## Resources

- uv: https://github.com/astral-sh/uv
- Railway: https://railway.app/
- Vercel: https://vercel.com/
- pnpm workspaces: https://pnpm.io/workspaces
- Foundry: https://book.getfoundry.sh/
