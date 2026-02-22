### Key Points on ERC-8004 AI Trading Agent Research
- Research suggests ERC-8004 is in Draft status as of late 2025, with mainnet deployment in January 2026; it enables trustless AI agents through identity, reputation, and validation registries, but adoption is early-stage and focused on testnets like Base Sepolia.
- For trading agents, combining mean-reversion in low-liquidity DEX pairs with momentum detection via technical indicators (RSI, MACD) and ML models like Random Forest shows promise for short horizons, though drawdowns require circuit breakers at 5-10% thresholds.
- Base Sepolia supports Uniswap V3, Aerodrome, and SushiSwap with test tokens via faucets; Chainlink feeds are deployed but limited; no official Risk Router yet—hackathon participants must build or use provided templates.
- Claude Opus 4.6 offers strong tool use for market analysis with adaptive thinking, but rate limits (10-500 req/min depending on tier) and $5/$25 per MTok pricing demand efficient context management for 13-day events.
- Market data APIs like CoinGecko (free tier: 10-50 calls/min) provide OHLC at 1m granularity; GeckoTerminal lacks Sepolia coverage—use mainnet proxies; Chainlink feeds on Sepolia are free but sparse.
- Sharpe optimization in crypto favors Kelly criterion with fractional sizing (0.25-0.5 Kelly) for volatility; adapt with regime detection using indicators vs. ML—mean-reversion edges low-liquidity, momentum suits trends.
- High-quality ERC-8004 validation uses JSON structures for requestURI/responseURI with IPFS hashing; log per trade for audits—demonstrates trustlessness via off-chain evidence with on-chain commitments.
- Next.js dashboards shine with TradingView Lightweight Charts for real-time candlesticks; use WebSockets for Python backend integration—key metrics include PnL timeline, risk heat maps, audit trails.
- For hackathons, Turborepo suits Python+TS monorepos; use Poetry/uv for envs—deploy to Vercel (free tier) for speed, Railway for cost ($0.0004/GB-hr).
- Winning lablab.ai projects emphasize polish (clean UI, audits) and originality; ERC-8004 agents stand out with "autonomous fund manager" narratives—focus on trustless angles for $10K prizes.
- No major legal issues for testnet AI agents, but Surge program shares 50/50 profits post-KYC; hackathon prizes require standard tax compliance.
- Self-service format with Discord Q&A; use starter kits for ERC-8004 integration—prizes distributed in 90 days.

### Core Implementation Flow
Register agent on Identity Registry, log validations per action, accumulate reputation—test on Base Sepolia (chain ID 84532) with free faucets.

### Risk Considerations
Evidence leans toward low regulatory risk for testnets, but real-capital Surge requires KYC; volatility demands 5-20% drawdown controls.

### Business Angle
It seems likely ERC-8004 enables "best trustless agent" differentiation through verifiable audits—narrative: "AI as autonomous economic actors" resonates with judges.

---

In the evolving landscape of decentralized finance (DeFi) and artificial intelligence (AI), the integration of trustless AI trading agents represents a pivotal advancement. This comprehensive survey draws from extensive web research, GitHub repositories, and X platform discussions to provide detailed insights into the 12 specified research areas for building an ERC-8004-compliant AI trading agent. Each area is structured with key findings, actionable recommendations, identified risks and unknowns, and curated resources. The analysis prioritizes practical implementation on Base Sepolia, emphasizing Python/TypeScript stacks, real-time data integration, and risk-adjusted strategies. Tables are incorporated where they enhance data presentation, such as comparing tools or metrics.

[AREA 1: ERC-8004 Standard — Current State & Implementation Reality]

Key Findings: ERC-8004 (EIP-8004) remains in Draft status as of February 2026, with no major spec changes since August 2025. Deployed on Base Sepolia: Identity Registry at 0x8004A818BFB912233c491871b3d84c89A494BD9e, Reputation Registry at 0x8004B663056A597Dffe9eCcC1965A193B7388713; Validation Registry under development with pending TEE expansions. Awesome-erc8004 lists mature JS/TS SDKs (e.g., ChaosChain, erc-8004-js) and Python bindings (erc-8004-py, chaoschain-sdk); Ethereum Magicians discussions highlight off-chain data composability issues but confirm modular reputation scoring. 8004.org provides conceptual docs but no tutorials; open-source agents like Contragent integrate ERC-8004 for verifiable trading. Registration flow: mint ERC-721, set URI; validation: requestURI/responseURI with hashes; reputation: giveFeedback with signed scores—gas on Sepolia ~50k-150k per call.

Recommendations: Deploy on Base Sepolia using reference contracts; use erc-8004-js for TS integration and erc-8004-py for Python agents. Log validations per trade (requestURI: IPFS JSON with inputs/outputs); submit reputation feedback post-execution with tags for categorization. For our stack, register Claude-based agent as ERC-721, link to JSON card with A2A endpoints.

Risks & Unknowns: Validation Registry immature—potential revisions; no audited Python bindings raise security concerns; gas costs could spike in live events; unclear if existing agents (e.g., Contragent) fully comply post-mainnet.

Links & Resources: 
- EIP-8004: https://eips.ethereum.org/EIPS/eip-8004  
- Contracts Repo: https://github.com/erc-8004/erc-8004-contracts 
- Awesome Repo: https://github.com/sudeepb02/awesome-erc8004 
- Magicians Thread: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098 
- 8004.org: https://8004.org 

[AREA 2: EIP Dependencies — EIP-712, EIP-1271, EIP-155]

Key Findings: EIP-712 enables typed data signing for trade intents—best practices: domain separator with chainId/verifyingContract, libraries like ethers.js (TS) and eth-signer (Python). EIP-1271 options: Safe (Gnosis) deployable on Base Sepolia via factory, supports ERC-8004 but adds gas/multi-sig overhead; custom minimal: audited templates from OpenZeppelin; alternatives like ZeroDev offer lighter EIP-1271. EIP-155: Base Sepolia ID 84532—bind in EIP-712 domain to prevent replays.

Recommendations: Use ethers.js for TS EIP-712 signing; deploy Safe as agent wallet for multi-key control. Structure domain: {name: 'TradeIntent', version: '1', chainId: 84532, verifyingContract: riskRouter}.

Risks & Unknowns: Custom wallets risk untested bugs; EIP-155 mismatches could enable replays across testnets.

Links & Resources: 
- EIP-712 Practices: https://eips.ethereum.org/EIPS/eip-712 
- EIP-1271 Options: https://eips.ethereum.org/EIPS/eip-1271 

[AREA 3: Base Sepolia — DEX & DeFi Ecosystem]

Key Findings: Active DEXes: Uniswap V3, Aerodrome, SushiSwap; pairs with liquidity: ETH/USDC, WBTC/ETH (test tokens via faucets like Alchemy, Chain.link). Faucets: Alchemy (0.1 ETH/day), Chain.link (multi-asset). Block time ~2s, gas ~0.01-0.5 gwei. DeFi: Aave lending, Curve staking; subgraphs for Uniswap/Sushi via The Graph. No pre-deployed Risk Router—build using viem/Foundry.

Recommendations: Use Uniswap V3 for concentrated LP yield; get ETH from Alchemy faucet; query subgraphs for DEX data.

Risks & Unknowns: Low testnet liquidity risks slippage; no official Risk Router interface—assume EIP-712 intents.

Links & Resources: 
- DEXes: https://www.coingecko.com/en/exchanges/decentralized/base 
- Faucets: https://www.alchemy.com/faucets/base-sepolia 

[AREA 4: Agent Architecture — Framework & Orchestration]

Key Findings: LangGraph edges CrewAI/AutoGen for 13-day hacks—stateful graphs for multi-tool flows. Claude: adaptive thinking for analysis; tool setup: market data/RPC; context: compaction for 1M tokens; rates: 10-500/min, $5/$25/MTok—budget $50-200 for event.

Recommendations: Use LangGraph for Claude orchestration; persist state in SQLite.

Risks & Unknowns: Claude 4.6 beta instability; over-context risks costs.

Links & Resources: 
- Frameworks: https://langfuse.com/blog/2025-03-19-ai-agent-comparison 

[AREA 5: Market Data APIs — Availability, Reliability, and Integration]

Key Findings: GeckoTerminal: mainnet only—proxy for signals; CoinGecko: free 10-50 calls/min, 1m OHLC; DeFiLlama: no Sepolia, mainnet yield/TVL; Chainlink: ETH/USD at 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43; The Graph: Uniswap subgraphs; alternatives: DexScreener (real-time DEX), CryptoPanic (sentiment, 100 calls/day free).

Recommendations: Use CoinGecko for OHLC; Chainlink for prices; Alchemy RPC (free 30M CUs/mo).

Risks & Unknowns: Testnet data gaps—use mainnet proxies carefully.

Links & Resources: 
- CoinGecko: https://www.coingecko.com/en/api 

| API | Free Limits | Sepolia Coverage | Granularity |
|----|-------------|------------------|-------------|
| CoinGecko | 10 calls/min | No, mainnet proxy | 1m OHLC |
| Chainlink | Unlimited (testnet) | Yes | Real-time |
| DeFiLlama | 10 calls/min | No | N/A |

[AREA 6: Trading Strategy — Risk-Adjusted Return Optimization]

Key Findings: Sharpe: Kelly (0.25-0.5 fractional) for sizing; drawdowns: 5-10% breakers; regimes: RSI/MACD vs. Random Forest; mean-reversion > momentum in low-liquidity; yield: Uniswap V3 LP, Aave lending arbitrage; backtesting: vectorbt > Backtrader for crypto; bots: Freqtrade/Hummingbot adaptable.

Recommendations: Hybrid regime detection (indicators + ML); vectorbt for backtests.

Risks & Unknowns: Short-horizon overfitting; testnet liquidity skews.

Links & Resources: 
- Kelly: https://medium.com/@tmapendembe_28659/kelly-criterion-for-crypto-traders-a-modern-approach-to-volatile-markets-a0cda654caa9 

[AREA 7: Validation & Trust Model — Maximizing ERC-8004 Integration Depth]

Key Findings: High-quality artifact: JSON in requestURI/responseURI with inputs/outputs/hashes; store on IPFS/Arweave; log per trade; trustlessness via off-chain evidence/on-chain commitments; models: weighted feedback scoring.

Recommendations: Log every decision; use IPFS for artifacts.

Risks & Unknowns: Optimal frequency untested—per-checkpoint risks spam.

Links & Resources: 
- Artifacts: https://eips.ethereum.org/EIPS/eip-8004 

[AREA 8: Dashboard & Presentation]

Key Findings: Open-source: CryptoPulse (Next.js/Chart.js); charts: TradingView Lightweight > Recharts for real-time; comm: WebSockets > SSE for Python-Next.js; metrics: PnL timeline, risk heat map, audit trail.

Recommendations: Use TradingView for candlesticks; WebSockets for backend.

Risks & Unknowns: Real-time lag in high-vol.

Links & Resources: 
- Dashboards: https://github.com/adrianhajdin/coinpulse 

[AREA 9: Infrastructure & DevOps for a Hackathon]

Key Findings: Monorepo: Turborepo > Nx for Python+TS; env: uv > Poetry for speed; deploy: Vercel (free) > Railway ($0.0004/GB-hr) for hacks.

Recommendations: Turborepo + uv; Vercel for demo.

Risks & Unknowns: Free tiers limit scale.

Links & Resources: 
- Tools: https://monorepo.tools/ 

[AREA 10: Competitive Analysis & Differentiation]

Key Findings: lablab.ai winners: polished UI, originality (e.g., multi-agent); few ERC-8004 submissions—stand out with "autonomous fund manager" narrative; unique angle: verifiable audits for trustless trading.

Recommendations: Focus on validation depth; pitch as "trading-as-a-service."

Risks & Unknowns: Limited prior ERC-8004 examples.

Links & Resources: 
- Winners: https://lablab.ai/apps/recent-winners 

[AREA 11: Legal & Compliance Considerations]

Key Findings: Testnet agents low-risk, no licensing needed; Surge: 50/50 profit-share post-KYC; hackathon: standard tax, no KYC for prizes.

Recommendations: Use test funds; comply with Surge terms.

Risks & Unknowns: Real-capital requires AML/KYC.

Links & Resources: 
- Legal: https://www.fenwick.com/insights/publications/the-rise-and-risks-of-ai-agents-in-crypto 

[AREA 12: Hackathon-Specific Intelligence]

Key Findings: Rules: Original, open-source (MIT); mentors value trust models; Discord for insights; workshops: ERC-8004/agents on-demand; starter kits: registries, Risk Router templates; partners: free APIs (CoinGecko, Chainlink).

Recommendations: Use kits; post submissions on X tagging @lablabai/@Surgexyz_.

Risks & Unknowns: Prizes in 90 days; voluntary participation.

Links & Resources: 
- Page: https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004  

Key Citations:
- [1] ERC-8004 Status: https://eips.ethereum.org/EIPS/eip-8004 
- [2] Contracts Repo: https://github.com/erc-8004/erc-8004-contracts 
- [3] Awesome-ERC8004: https://github.com/sudeepb02/awesome-erc8004 
- [4] Ethereum Magicians: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098 
- [5] 8004.org: https://8004.org 
- [6] Open-Source Agents: https://github.com/sudeepb02/awesome-erc8004 
- [7] Registration Flow: https://eips.ethereum.org/EIPS/eip-8004 
- [8] EIP-712: https://eips.ethereum.org/EIPS/eip-712 
- [9] EIP-1271: https://docs.safe.global/sdk/protocol-kit/guides/signatures 
- [10] Base Sepolia DEXes: https://www.coingecko.com/en/exchanges/decentralized/base 
- [11] Faucets: https://www.alchemy.com/faucets/base-sepolia 
- [12] Block Time: https://docs.base.org/base-chain/network-information/network-fees 
- [13] DeFi Protocols: https://defillama.com/protocol/sushiswap-v3 
- [14] Subgraphs: https://docs.base.org/base-chain/tools/data-indexers 
- [15] Frameworks: https://langfuse.com/blog/2025-03-19-ai-agent-comparison 
- [16] Claude Practices: https://www.anthropic.com/news/claude-opus-4-6 
- [17] State Management: https://intellyx.com/2025/02/24/why-state-management-is-the-1-challenge-for-agentic-ai 
- [18] GeckoTerminal: https://api.geckoterminal.com/docs/index.html 
- [19] CoinGecko: https://www.coingecko.com/en/api 
- [20] DeFiLlama: https://defillama.com/ 
- [21] Chainlink: https://docs.chain.link/data-feeds/price-feeds/addresses 
- [22] The Graph: https://thegraph.com/explorer/subgraphs/Eipn6bykhEdVNKybJEekgGNWhqvFBZJqxhS3y5Gw5YUm?chain=arbitrum-one&view=About 
- [23] Birdeye/DexScreener: https://slashdot.org/software/comparison/Birdeye.so-vs-DEX-Screener-vs-Defined.fi 
- [24] CryptoPanic: https://fxpanic.com/guides/how-to-integrate-the-cryptopanic-api 
- [25] LunarCrush/Santiment: https://lunarcrush.com/ 
- [26] RPC: https://www.quicknode.com/builders-guide/best/top-10-base-rpc-providers 
- [27] Sharpe: https://www.quantpedia.com/bitcoin-etfs-in-conventional-multi-asset-portfolios 
- [28] Kelly: https://medium.com/@tmapendembe_28659/kelly-criterion-for-crypto-traders-a-modern-approach-to-volatile-markets-a0cda654caa9 
- [29] Drawdown: https://tradetron.tech/blog/reducing-drawdown-7-risk-management-techniques-for-algo-traders 
- [30] Regime Detection: https://arxiv.org/html/2407.18334v1 
- [31] Mean-Reversion/Momentum: https://quantpedia.com/how-to-build-mean-reversion-strategies-in-currencies 
- [32] Yield: https://www.gauntlet.xyz/resources/making-sense-of-the-defi-lending-meta 
- [33] Backtesting: https://medium.com/@pta.forwork/popular-backtesting-tools-for-algorithmic-trading-a-practical-comparison-and-how-to-use-them-fa09f9fb2480 
- [34] Bots: https://medium.com/openware/create-your-own-crypto-trading-brokerage-platform-with-opendax-v4-2b452c90b2b9 
- [35] Validation: https://eips.ethereum.org/EIPS/eip-8004 
- [36] Storage: https://arxiv.org/html/2409.11339v3 
- [37] Frequency: https://cryptoslate.com/how-erc-8004-will-make-ethereum-the-home-of-decentralized-ai-agents/ 
- [38] Trustlessness: https://medium.com/@savvysid/erc-8004-building-the-trustless-agent-layer-of-ethereum-0eec8b9ad112 
- [39] Models: https://eips.ethereum.org/EIPS/eip-8004 
- [40] Dashboards: https://github.com/adrianhajdin/coinpulse 
- [41] Charts: https://www.tradingview.com/lightweight-charts 
- [42] Comm: https://websocket.org/comparisons/long-polling 
- [43] Metrics: https://margex.com/en/blog/top-10-metrics-every-crypto-trader-should-monitor 
- [44] Monorepo: https://monorepo.tools/ 
- [45] Env: https://mil.ad/blog/2024/uv-poetry-install.html 
- [46] Deployment: https://northflank.com/blog/railway-vs-render 
- [47] Keys: https://docs.cdp.coinbase.com/api-reference/v2/authentication 
- [48] Winners: https://lablab.ai/apps/recent-winners 
- [49] Submissions: https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004 
- [50] Differentiation: https://medium.com/@gwrx2005/erc-8004-a-trustless-agent-standard-for-on-chain-ai-in-avalanche-c-chain-4dc1bdad509a