# Golden Fleece: Complete Research Dossier for ERC-8004 AI Trading Agent Hackathon

**Bottom line: ERC-8004 went live on Ethereum mainnet on January 29, 2026, with over 21,500 agents deployed in two weeks — the ecosystem is real but young. Your proposed Python + TypeScript stack is sound, but several assumptions need correction: the Validation Registry is still under active development, there is no pre-deployed Risk Router (you build your own), and Base Sepolia contract addresses differ between the official repo and community explorers. This report provides contract addresses, code examples, architecture decisions, and strategic intelligence across all 12 areas.**

---

## Area 1: ERC-8004 standard is live but still formally "Draft"

### Key findings

ERC-8004 was created August 13, 2025, by Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), and Erik Reppel (Coinbase). Despite launching on Ethereum mainnet on January 29, 2026, the EIP's formal status on eips.ethereum.org remains **Draft**. This is normal — ERC standards can be deployed before formal finalization. Over **21,562 agents** were registered across multiple chains within two weeks of mainnet launch.

The contracts repo at `erc-8004/erc-8004-contracts` contains three upgradeable Solidity contracts: **IdentityRegistryUpgradeable.sol**, **ReputationRegistryUpgradeable.sol**, and **ValidationRegistryUpgradeable.sol**. All use proxy patterns and share a `0x8004` vanity address prefix. Official Ethereum Sepolia addresses are confirmed: IdentityRegistry at `0x8004A818BFB912233c491871b3d84c89A494BD9e` and ReputationRegistry at `0x8004B663056A597Dffe9eCcC1965A193B7388713`. Base Sepolia is listed as "to be deployed" in the official repo, though the 8004agents.ai explorer shows community-deployed contracts at IdentityRegistry `0x8004AA63c570c570eBF15376c0dB199918BFe9Fb`, ReputationRegistry `0x8004bd8daB57f14Ed299135749a5CB5c42d341BF`, and ValidationRegistry `0x8004C269D0A5647E51E121FeB226200ECE932d55`.

The **ChaosChain reference implementation** provides deterministic addresses deployed across five testnets including Base Sepolia: IdentityRegistry `0x7177a6867296406881E20d6647232314736Dd09A`, ReputationRegistry `0xB5048e3ef1DA4E04deB6f7d0423D06F63869e322`, ValidationRegistry `0x662b40A526cb4017d947e71eAF6753BF3eeE66d8`.

The **awesome-erc8004** repo catalogs multiple SDKs. The most important is the **Agent0 SDK** (official, by the spec authors) available in both Python and TypeScript at `sdk.ag0.xyz`. Other options include the Praxis Python SDK (`praxis-py-sdk`), the 0xgasless agent-sdk (TypeScript), and the ChaosChain SDK. Python bindings exist through Agent0 and Praxis.

The registration flow works as follows: call `register(agentURI)` on the IdentityRegistry, which mints an ERC-721 NFT and returns an `agentId`. The `agentURI` points to a JSON document (hosted on IPFS or HTTPS) describing the agent's capabilities, services, and trust support. For reputation, anyone except the agent owner calls `giveFeedback(agentId, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash)` with tags like `tradingYield` or `successRate`. The `getSummary()` function aggregates feedback but **requires** specifying `clientAddresses` to prevent Sybil attacks.

**Critical warning**: The Validation Registry is explicitly marked as "under active update and discussion with the TEE community" — its interface may change during the hackathon period.

### Recommendations

Use the **Agent0 SDK** (Python for trading logic, TypeScript for on-chain integration) as your primary ERC-8004 interface. Start with the ChaosChain reference implementation contracts on Base Sepolia since they're already deployed and tested (79/79 tests passing). Register your agent on day one with a well-structured registration JSON hosted on IPFS via Pinata. Use tags like `tradingYield`, `sharpeRatio`, `maxDrawdown` in reputation feedback to create a rich, queryable trust profile. For validation artifacts, hash the AI's decision inputs and outputs with keccak256 and store the full artifacts on IPFS, keeping only hashes on-chain.

### Risks and unknowns

The Validation Registry is unstable — its interface could change. Base Sepolia addresses differ between three sources (official repo, explorer, ChaosChain) — verify which contracts the hackathon organizers expect you to use during the first workshop. The spec has no external audit. The `getSummary()` function without `clientAddresses` filtering is Sybil-vulnerable. The 8004.org documentation site could not be fully accessed and may still be under construction.

### Links and resources

- EIP Spec: https://eips.ethereum.org/EIPS/eip-8004
- Official Contracts: https://github.com/erc-8004/erc-8004-contracts
- ChaosChain RI: https://github.com/ChaosChain/trustless-agents-erc-ri
- Agent0 SDK: https://sdk.ag0.xyz/
- Awesome List: https://github.com/sudeepb02/awesome-erc8004
- Explorer: https://8004agents.ai
- Forum: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
- Phala TEE Agent Example: https://github.com/Phala-Network/erc-8004-tee-agent
- Vistara CrewAI Example: https://github.com/vistara-apps/erc-8004-example

---

## Area 2: EIP-712 signing is straightforward; EIP-1271 wallet choice matters

### Key findings

**EIP-712** is the backbone of trade intent signing. The domain separator for your agent should include `name` (e.g., "GoldenFleeceTradingAgent"), `version` ("1"), `chainId` (84532 for Base Sepolia), and `verifyingContract` (your Risk Router address). In Python, **`eth-account`** (v0.13.7+) provides `Account.sign_typed_data()` which handles all EIP-712 complexity. In TypeScript, **viem** provides `walletClient.signTypedData()` with full type inference. A recommended `TradeIntent` struct includes: `agent`, `tokenIn`, `tokenOut`, `amountIn`, `minAmountOut`, `deadline`, and `nonce` fields.

For on-chain verification, OpenZeppelin's `EIP712.sol` and `ECDSA.sol` are audited and standard. The verification contract should support both EOA signatures (via ECDSA.recover) and smart contract wallets (via EIP-1271's `isValidSignature`).

**EIP-1271** options for agent wallets ranked by hackathon suitability:

- **Plain EOA** (fastest path): No EIP-1271 needed, works immediately with eth-account/viem. Best if you're time-constrained.
- **ZeroDev Kernel** (recommended for features): ERC-4337 + ERC-7579 compatible, built-in EIP-1271, session keys for autonomous trading, gas sponsorship, lazy deployment (zero upfront cost). Confirmed deployed on Base Sepolia. Powers 6M+ smart accounts.
- **Gnosis Safe**: Most battle-tested but heavyweight for a hackathon (~258k gas deployment, multi-sig overhead unnecessary for a single AI agent).
- **Custom minimal wallet**: ~100 lines of Solidity, gives full control but is unaudited.

**EIP-155** consideration is straightforward: Base Sepolia's chain ID **84532** must appear in every EIP-712 domain separator. This prevents cross-chain replay attacks — a signature created for Base Sepolia (84532) cannot be replayed on Base mainnet (8453).

### Recommendations

Start with a **plain EOA** for day-one velocity, then upgrade to **ZeroDev Kernel** if time permits (session keys and gas sponsorship will impress judges). Use `eth-account` in Python and `viem` in TypeScript for EIP-712 signing — both handle the full EIP-712 flow. Always include `chainId: 84532` and `verifyingContract` in your domain separator. Include a `deadline` and `nonce` in every TradeIntent for replay protection. Use OpenZeppelin's EIP712.sol for on-chain verification — it dynamically recalculates the domain separator if a fork changes the chain ID.

### Risks and unknowns

The `eth-account` library warns it hasn't undergone external audit for EIP-712 signing. ZeroDev Kernel adds dependency on ZeroDev infrastructure (bundler, paymaster) which could have availability issues on testnet. Cross-language signature compatibility (Python signing ↔ Solidity verification) should be tested early to catch encoding mismatches.

### Links and resources

- eth-account docs: https://eth-account.readthedocs.io/
- viem signTypedData: https://viem.sh/docs/actions/wallet/signTypedData
- OpenZeppelin EIP712.sol: https://docs.openzeppelin.com/contracts/5.x/api/utils#EIP712
- ZeroDev SDK: https://docs.zerodev.app/
- ApeWorX eip712 library: https://pypi.org/project/eip712/

---

## Area 3: Base Sepolia has viable DeFi infrastructure but thin liquidity

### Key findings

**Uniswap V3** is officially deployed on Base Sepolia with the factory at `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24`. Uniswap V2 and V4 are also present. **Aerodrome** and **SushiSwap** have no confirmed Base Sepolia deployments. The practical DEX ecosystem is mostly Uniswap.

Key token addresses: **WETH** is at the standard OP Stack address `0x4200000000000000000000000000000000000006`. Test USDC, EURC, and cbBTC are available via the Coinbase Developer Platform faucet. Aave V3 testnet tokens (DAI, USDC, USDT, WBTC, WETH, LINK, AAVE) are mintable via the Aave faucet with a per-tx limit of **10,000 tokens**.

**Faucets** ranked by reliability: Coinbase Developer Platform (0.1 ETH + USDC/EURC/cbBTC, every 24h), Alchemy (testnet ETH, requires 0.001 mainnet ETH), Chainlink (multiple test tokens), QuickNode (every 12h). The Aave V3 faucet is built into the contracts themselves — you can mint test tokens directly.

Base Sepolia has **~2-second block times** and near-zero gas costs (**0.005–0.01 gwei** base fee). A typical transaction costs under $0.000005. This mirrors mainnet Base's OP Stack architecture including EIP-4844 blob data.

**Aave V3 is deployed on Base Sepolia**, providing lending, borrowing, flash loans, and liquidity provision — viable for the "Best Yield/Portfolio Agent" track. Enable testnet mode on app.aave.com to access it.

**There is no pre-deployed Risk Router contract.** The hackathon expects teams to build their own risk management contracts. The term "Risk Router" in the hackathon description refers to application-specific logic that teams implement on top of ERC-8004's trust layer. This is a significant finding that contradicts the assumption in the original prompt.

For RPC, **Alchemy** offers the best free tier (300M compute units/month) with full Base Sepolia support. **Coinbase Developer Platform** provides native Base support with 0.25 ETH gas credits on signup. The public endpoint `https://sepolia.base.org` works for basic use.

### Recommendations

Use **Uniswap V3** as your primary DEX. Deploy your own mintable test tokens and create pools with controlled liquidity to ensure predictable trading behavior. Use the Coinbase CDP faucet for initial testnet ETH and tokens, and the Aave faucet for additional test assets. Set up **Alchemy as primary RPC** and **Ankr** (`rpc.ankr.com/base_sepolia`) as fallback. Build your own Risk Router contract that enforces position limits, daily loss caps, and whitelisted markets — this is a key judging criterion. Integrate Aave V3 for the yield/portfolio track.

### Risks and unknowns

Testnet liquidity is extremely thin — your trading results will not reflect real market conditions. The hackathon may provide specific contract addresses or deployment instructions during the first workshop that override community deployments. Verify whether the hackathon provides a "Hackathon Capital Vault" or if teams deploy their own. Subgraph indexing on Base Sepolia has low curation signal, meaning query reliability varies.

### Links and resources

- Base Sepolia explorer: https://sepolia.basescan.org
- Uniswap V3 Base deployments: https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments
- Alchemy Base Sepolia faucet: https://www.alchemy.com/faucets/base-sepolia
- Coinbase CDP: https://portal.cdp.coinbase.com
- Aave V3 testnet addresses: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
- The Graph Base Sepolia subgraphs: https://thegraph.com/explorer (filter by Base Sepolia)
- Chainlink Base Sepolia faucet: https://faucets.chain.link/base-sepolia

---

## Area 4: Bare Python + Claude API is the optimal architecture for this hackathon

### Key findings

A framework comparison reveals that **bare Python with the Anthropic SDK** is the clear winner for a 13-day trading agent hackathon. Setup takes 1–2 hours versus 4–8 hours for LangGraph, and it provides maximum control over execution timing, retry logic, and state management. The Anthropic SDK now includes built-in tool helpers and a tool runner that automates the tool-call loop. **Programmatic Tool Calling** (GA as of early 2026) lets Claude write Python that orchestrates multiple tool calls in parallel, dramatically reducing token usage.

**Pydantic AI** is a strong alternative if you want type-safe structured outputs (critical for financial data validation) with minimal overhead. LangGraph, CrewAI, AutoGen, and the Claude Agent SDK are all suboptimal for this use case — they add learning curve overhead without sufficient trading-specific benefits.

For Claude API configuration, use **model tiering**: Haiku 4.5 ($1/$5 per MTok) for routine monitoring every 15 minutes, Sonnet 4.5 ($3/$15) for trading decisions, and Opus 4.5 ($5/$25) for deep market analysis. Enable **adaptive thinking** (`thinking: {"type": "adaptive"}`) so Claude decides when to engage extended reasoning. Use **prompt caching** on the system prompt for 90% savings on repeated content.

The current context window is **200K tokens** standard for all Claude 4.5+ models, with 1M token extended context in beta for Tier 4+ accounts. For a trading agent, 200K is more than sufficient.

**Budget estimate**: A conservative approach costs **~$17 for 13 days** (96 monitoring calls/day on Haiku, 4–8 decisions on Sonnet, 1–2 deep analyses on Opus). An aggressive approach with heavy development/testing might reach **$85–170**. Budget $200 total (Tier 3 deposit).

For state management, **SQLite** is the overwhelming standard for hackathon trading bots — zero-config, file-based, full SQL support. The schema should include tables for `agent_cycles`, `positions`, `decisions`, `strategy_params`, `market_snapshots`, and `portfolio_state`.

### Recommendations

Use the bare Python + Anthropic SDK pattern with an asyncio event loop running four phases: MONITOR (Haiku, low effort, every 15 min), ANALYZE (Sonnet, adaptive thinking, when interesting signals detected), DECIDE (Sonnet/Opus, high effort, for actual trades), and REVIEW (Sonnet, daily strategy refinement). Persist all state in SQLite. Cache your system prompt (trading strategy rules, risk parameters) using Anthropic's prompt caching for 90% cost reduction. Define tools for `get_market_data`, `get_onchain_state`, `execute_trade`, and `get_portfolio_state`. Feed context to Claude using XML tags (`<portfolio_state>`, `<open_positions>`, `<recent_decisions>`).

### Risks and unknowns

Claude's rate limits vary by tier — check your current tier before the hackathon and upgrade if needed. Extended thinking tokens are billed as output tokens (the expensive direction). The Anthropic API could have outages — build retry logic with exponential backoff. If your trading frequency is very high, API latency (1–5 seconds per call) could be a bottleneck.

### Links and resources

- Anthropic Python SDK: https://docs.anthropic.com/en/docs/sdks/python
- Claude tool use docs: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- Extended thinking: https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- Prompt caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Pydantic AI: https://ai.pydantic.dev/

---

## Area 5: Use Chainlink on-chain feeds as primary, mainnet APIs as signals

### Key findings

**The fundamental insight is that testnet tokens have no real market value.** The correct architecture uses on-chain price feeds (Chainlink/Pyth) on Base Sepolia for execution pricing and mainnet APIs for market analysis signals.

**Chainlink** has active price feeds on Base Sepolia — ETH/USD, BTC/USD, and others are available. Feed addresses are listed at `docs.chain.link/data-feeds/price-feeds/addresses` (select Base Sepolia). All testnet feeds are free. **Pyth Network** also deploys on Base Sepolia at `0xA2aa501b19aff244D90cc15a4Cf739D2725B5729` with sub-second latency.

**GeckoTerminal** is the best free DEX data API — 30 calls/minute, no API key required, supports OHLCV at minute/hour/day granularity. It covers Base mainnet fully but Base Sepolia coverage is uncertain (Ethereum Sepolia is indexed). Use Base mainnet data as trading signals. Python SDK: `geckoterminal-api` on PyPI.

**CoinGecko** free tier is severely limited: 10,000 calls/month, no 1m or 5m candles (only 30-minute minimum for recent data). GeckoTerminal's free API is strictly better for on-chain data.

**DeFiLlama** covers Base mainnet only (no testnet). Free, no API key. Good for macro signals — TVL trends, yield data, protocol health. Python SDKs: `defillama` and `dfllama` on PyPI.

**The Graph** supports Base Sepolia with active subgraphs including `v3-uniswap-base-sepolia` and `dex-base-sepolia`. Free tier includes 100,000 queries/month.

For **sentiment**, CryptoPanic offers free API access with community-driven sentiment scoring and even has an MCP server for AI agent integration. The Alternative.me **Fear & Greed Index** is a single free endpoint providing daily BTC sentiment. LunarCrush has no free API tier. Santiment's free tier excludes the last 30 days of data, making it useless for real-time signals.

**RPC providers**: Alchemy leads with 300M compute units/month free. Coinbase CDP offers native Base support with gas credits. Blast API has been acquired by Alchemy and is defunct. Ankr provides a free public endpoint at `rpc.ankr.com/base_sepolia`.

### Recommendations

Build a three-layer data stack. **Layer 1 (on-chain)**: Chainlink price feeds on Base Sepolia via `web3.py` calling `latestRoundData()` — this is your execution price truth. **Layer 2 (market signals)**: GeckoTerminal API for Base mainnet DEX data (OHLCV, pool stats) and DeFiLlama for TVL/yield trends. **Layer 3 (sentiment)**: CryptoPanic for real-time news sentiment, Fear & Greed Index for macro sentiment. Use Alchemy as primary RPC with the public `sepolia.base.org` as fallback. Skip CoinGecko (too limited) and LunarCrush/Santiment (require paid tiers for useful data).

### Risks and unknowns

GeckoTerminal may not index Base Sepolia specifically (only Ethereum Sepolia confirmed). If mainnet price data diverges from testnet pool prices (which it will), your agent must handle the disconnect gracefully. Chainlink feed addresses for Base Sepolia need to be verified directly from the docs as they differ from Ethereum Sepolia. The 30 calls/minute GeckoTerminal limit could be restrictive if monitoring many pairs.

### Links and resources

- Chainlink Base Sepolia feeds: https://docs.chain.link/data-feeds/price-feeds/addresses
- Pyth Base Sepolia: https://docs.pyth.network/price-feeds/contract-addresses/evm
- GeckoTerminal API: https://www.geckoterminal.com/dex-api
- GeckoTerminal Python SDK: https://pypi.org/project/geckoterminal-api/
- DeFiLlama API: https://defillama.com/docs/api
- CryptoPanic API: https://cryptopanic.com/developers/api/
- Fear & Greed Index: https://alternative.me/crypto/fear-and-greed-index/
- Alchemy Base Sepolia: https://www.alchemy.com/chain-connect/chain/base-sepolia

---

## Area 6: Maximize Sharpe through blended strategies and conservative sizing

### Key findings

Academic and practitioner research converges on several key findings for short-horizon crypto trading. **BTC-neutral mean-reversion strategies** achieved Sharpe ~2.3 post-2021. **Blended momentum + mean-reversion portfolios** achieved Sharpe ~1.71 with 56% annualized returns. **Pairs trading** on crypto produced Sharpe 0.87–2.13 across lookback periods. The critical insight: **over 13 days, any Sharpe ratio is statistically unreliable** — but judges will still use it as a metric, so optimize for consistency over raw returns.

**Fractional Kelly criterion** is essential for crypto position sizing. Full Kelly is dangerously aggressive due to fat tails. Use **25% Kelly** (`f* = 0.25 × μ/σ²`), which reduces the probability of 80% drawdown from 1-in-5 to 1-in-213. Cap any single position at 20% of portfolio regardless of Kelly output.

For **market regime detection**, ADX + Bollinger Band width is the fastest to implement (hours, not days) and the most interpretable for judges. ADX > 25 = trending, ADX < 20 with wide bands = volatile, everything else = ranging. Hidden Markov Models are more sophisticated but take 1–2 days to implement. The regime should directly control strategy selection: trending → momentum with trailing stops, ranging → mean reversion with z-score entries, volatile → reduce positions by 50% and widen stops.

**Circuit breakers** are critical for the "Best Compliance & Risk Guardrails" prize track. Standard thresholds: 5% max daily drawdown, 10% max total drawdown, halt after 3 consecutive losses with a cooldown period. ATR-based trailing stops (2–3× ATR) avoid whipsaw better than fixed percentage stops. For mean-reversion trades specifically, do NOT use stop-losses — use time-based exits instead.

For **DeFi yield**, concentrated liquidity on Uniswap V3 can yield 8–12% APY on liquid pairs. On testnet, the yield is simulated — focus on demonstrating the strategy logic (auto-rebalancing, volatility-aware range setting) rather than actual returns.

**Backtesting**: A custom NumPy/Pandas vectorized backtester (30 lines of code) is the fastest to implement. VectorBT is excellent for parameter optimization if time permits. Avoid Zipline (painful setup) and Backtrader (slow execution).

From open-source bots, borrow **Freqtrade's strategy class pattern** for signal definitions, **Hummingbot's Gateway module** concepts for DEX execution, and **Jesse's backtest structure** for validation.

### Recommendations

Implement a blended strategy with regime-aware switching. In the Signal Engine: detect regime via ADX + BB width, route to momentum signals in trends (Donchian breakout) and mean-reversion signals in ranges (z-score > 2 from 20-period SMA). In the Risk Manager: use 25% Kelly for position sizing, multiply by volatility adjustment (`target_vol / current_vol`), apply drawdown scaling (reduce size linearly as drawdown approaches 50% of max), enforce circuit breakers at 5% daily / 10% total drawdown. Display Sharpe, Sortino, Calmar, max drawdown, and VaR on the dashboard. **Prioritize risk management depth over strategy sophistication** — judges reward consistency and transparency over raw performance.

### Risks and unknowns

Thirteen days is too short for statistical significance in any strategy metric. Testnet liquidity and price behavior will not reflect real markets. Overfitting is a major danger — strategies that look amazing in backtesting may be pure luck. Regime detection has lookback requirements, so the first few days will have poor signal quality. On testnet, slippage behavior is unpredictable.

### Links and resources

- VectorBT: https://vectorbt.dev/
- Freqtrade: https://github.com/freqtrade/freqtrade
- Hummingbot: https://github.com/hummingbot/hummingbot
- Jesse: https://github.com/jesse-ai/jesse
- HMM regime detection (hmmlearn): https://hmmlearn.readthedocs.io/

---

## Area 7: Validation artifacts should be IPFS-hosted with on-chain hashes

### Key findings

A high-quality validation artifact in ERC-8004 contains: the AI's input data (market state hash), the decision output (trade intent hash), the model/code digest, a timestamp, and optionally a TEE attestation or zkML proof. The spec defines three trust tiers: social/reputation (feedback scores), crypto-economic (stake-secured re-execution), and cryptographic (TEE attestations, zkML proofs). For a hackathon trading agent, the social/reputation tier is the minimum; adding TEE attestation earns bonus points.

**IPFS is the recommended storage** — it's content-addressed (hash = CID, so feedbackHash is implicit), the spec explicitly recommends it, and it's indexable by subgraphs. Use Pinata for pinning. For critical evidence, Arweave provides permanent storage. On-chain storage via base64 data URIs works only for tiny metadata. HTTPS is acceptable if paired with keccak256 hashes.

For logging frequency, **per-trade validation** is recommended on L2s where gas is essentially free. Every trade intent should produce a validation request with: the market context hash, the AI's reasoning hash, the trade parameters, and the outcome. Batch low-value decisions (monitoring cycles) into periodic checkpoints.

The community strongly opposes a single aggregate reputation score. Trust is contextual and directional — use tags (`tradingYield`, `sharpeRatio`, `responseTime`) to create a multi-dimensional reputation profile that can be queried by different criteria.

### Recommendations

For every trade, create a validation artifact JSON containing: `agentId`, `taskDescription`, `inputHash` (keccak256 of market data snapshot), `outputHash` (keccak256 of trade intent), `reasoning` (summary of AI's decision process), `codeDigest`, and `timestamp`. Upload to IPFS via Pinata, then call `validationRequest()` with the IPFS CID as `requestURI` and keccak256 of the JSON as `requestHash`. Implement a self-validation pattern where a secondary module verifies the trade against risk constraints and submits the validation response. Use tags extensively in reputation feedback to create a rich, queryable trust profile. Display the complete audit trail on your dashboard with expandable detail panels.

### Risks and unknowns

The Validation Registry interface may change before or during the hackathon. The self-validation pattern (agent validates itself) is philosophically weak — if possible, have a separate validator component or use a TEE. IPFS content can be garbage-collected if unpinned; ensure your Pinata plan covers the hackathon period. The exact structure of requestURI and responseURI is not rigidly specified, giving you flexibility but also ambiguity.

### Links and resources

- Pinata IPFS: https://www.pinata.cloud/
- ERC-8004 Spec (validation section): https://github.com/erc-8004/erc-8004-contracts/blob/main/ERC8004SPEC.md
- Phala TEE Agent (validation example): https://github.com/Phala-Network/erc-8004-tee-agent

---

## Area 8: TradingView Lightweight Charts + shadcn/ui is the optimal dashboard stack

### Key findings

**TradingView Lightweight Charts** is the clear winner for the main trading chart: 45KB bundle, native candlestick support, built-in trade markers via `createSeriesMarkers()` (buy/sell arrows with custom text), real-time updates via `.update()`, dark mode theming, and Apache 2.0 license. It has **350,000+ weekly npm downloads**. For Next.js, use `dynamic(() => import(...), { ssr: false })` since it's client-side only.

**Recharts** (via shadcn/ui's built-in chart components) is ideal for secondary charts: PnL curves, win rate bars, portfolio allocation. Run `npx shadcn-ui@latest add chart` to get pre-styled chart components.

For real-time communication between Python (FastAPI) and Next.js, **native WebSocket** is optimal — FastAPI supports it natively, it's full-duplex (supports both server→client price updates and client→server commands), and it has the lowest latency. Use a simple `ConnectionManager` class on the backend that broadcasts JSON messages with type discriminators (`price_update`, `trade_executed`, `signal_generated`, `metrics_update`). On the frontend, use `useRef` + `setInterval` throttling (5fps) to prevent React re-render storms.

The **shadcn/ui** component library (65,000+ GitHub stars) with Tailwind CSS and next-themes provides a polished dark-mode trading interface with minimal effort. Key components: Card (KPI metrics), Table + TanStack Table (trade history), Badge (status indicators), Tabs, Sheet (slide-out trade detail panels).

Metrics that impress judges beyond standard PnL: **decision reasoning timeline** (show WHY the agent made each trade), **validation audit trail** (on-chain proofs), **risk heat map** (exposure visualization), **reputation score** (ERC-8004 specific), and real-time sparklines next to KPI cards.

### Recommendations

Use TradingView Lightweight Charts for the main candlestick chart with buy/sell markers overlaid. Use shadcn/ui + Recharts for KPI cards (PnL, Sharpe, max drawdown, win rate) with sparklines, and for secondary charts (equity curve, portfolio allocation). Set up a FastAPI WebSocket endpoint streaming JSON messages to the Next.js frontend. Use the dark trading color palette: background `#0a0a0f`, surface `#1a1a2e`, profit green `#26a69a`, loss red `#ef5350`. The killer differentiator is a **decision reasoning panel** that shows the AI's thought process for each trade — this is what makes a trading agent demo memorable. Reference the CoinPulse project (`github.com/adrianhajdin/coinpulse`) for layout inspiration.

### Risks and unknowns

WebSocket connections can be flaky during demos — always have a polling fallback. TradingView Lightweight Charts requires client-side rendering only (no SSR). The real-time update throttling pattern (5fps) is crucial to prevent UI jank but might miss fast price movements.

### Links and resources

- TradingView Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- shadcn/ui: https://ui.shadcn.com/
- CoinPulse reference: https://github.com/adrianhajdin/coinpulse
- FastAPI WebSocket docs: https://fastapi.tiangolo.com/advanced/websockets/
- shadcn admin template: https://github.com/satnaing/shadcn-admin

---

## Area 9: Use uv + pnpm workspaces + Railway for zero-friction infrastructure

### Key findings

For a Python + TypeScript monorepo, **simple pnpm workspaces with a Makefile** is the best approach. Turborepo has no native Python support. Nx supports polyglot repos but adds 15–30 minutes of configuration overhead that's not worth it for a hackathon. A flat structure with `apps/dashboard/` (Next.js), `apps/agent/` (Python), `packages/shared-types/` (TypeScript ABIs), and `contracts/` (Solidity) covers all needs.

**uv** is the clear winner for Python environment management: 10–100× faster than pip (Rust-based), handles Python version management, creates environments in milliseconds, and has a single static binary. Setup: `curl -LsSf https://astral.sh/uv/install.sh | sh && uv init agent && uv add web3 anthropic httpx`. Total: ~30 seconds.

For deployment, **Vercel** (free tier, zero-config for Next.js) handles the dashboard. **Railway** ($5/month + usage, ~$0.000463/min vCPU) handles the Python agent with GitHub auto-deploy in under 5 minutes. **Total 13-day cost: ~$5–15.** Render offers a free tier with cold starts if budget is zero. Avoid Fly.io (CLI learning curve wastes hackathon time).

For secrets, use `.env.local` files with `python-dotenv` (Python) and `@t3-oss/env-nextjs` (TypeScript). Railway and Vercel both have built-in environment variable management that auto-injects at runtime. Use a dedicated testnet wallet with minimal funds — never a mainnet key.

### Recommendations

Initialize your repo with pnpm workspaces immediately. Use uv for Python (install in 30 seconds). Deploy the dashboard to Vercel and the agent to Railway on day one — having a live URL early is valuable for demos and testing. Create a `.env.example` with placeholder values and commit it; add `.env*` to `.gitignore` immediately. Use a Makefile as a cross-language task runner for common operations (`make dev`, `make deploy`, `make test`).

### Risks and unknowns

Railway eliminated its free tier in August 2023, so there's a small cost (~$5–15). Vercel's free tier has a 10-second function execution limit for API routes — if you need longer-running server processes, use Railway for those too. uv is relatively new and some team members may be unfamiliar with it, but the workflow mirrors Poetry's simplicity.

### Links and resources

- uv: https://github.com/astral-sh/uv
- Railway: https://railway.app/
- Vercel: https://vercel.com/
- pnpm workspaces: https://pnpm.io/workspaces

---

## Area 10: Conservative risk management wins over aggressive returns

### Key findings

Analysis of past lablab.ai winners reveals a clear winning formula: **clear problem definition > technical complexity**, working prototype with live demo, strong video presentation, business value narrative, and deep integration of the hackathon's required technology. Judges evaluate: technology application, presentation clarity, business value, and originality — in roughly that order of importance.

Relevant prior projects include: **Contragent** (Hedera hackathon, cryptographic trade verification), an **Agent-8004-x402 implementation** on Avalanche Fuji (registered agent, simulated DEX trading, reputation accumulation), and the **ETHPanda co-learning hackathon** on ERC-8004 (Oct–Nov 2025). The ERC-8004 ecosystem is barely 4 months old on mainnet — deep integration will stand out simply because few teams have done it well.

The **"Best Trustless Trading Agent" ($10K)** ranking is explicitly based on **risk-adjusted profitability, drawdown control, and validation quality** — NOT raw PnL. A conservative agent with excellent Sharpe, low drawdown, and rich validation artifacts will beat an aggressive high-PnL agent with poor risk metrics. Bonus technology (TEE attestation, zkML, on-chain circuit breakers, subgraph-powered dashboards) is explicitly listed for extra credit.

The strongest business narrative is **"Autonomous Fund Manager with Verifiable Track Record"** — the agent builds its own auditable on-chain resume via ERC-8004 reputation, any investor can verify performance before allocating capital, and it's positioned for the Surge Trading Capital Program. This directly aligns with what Pawel Czech (CEO of Surge AND connected to lablab.ai) wants to see.

### Recommendations

Target **two prizes simultaneously**: "Best Trustless Trading Agent" ($10K) and "Best Compliance & Risk Guardrails" ($2.5K). Frame the agent as "the first institutional-grade AI trader on ERC-8004" — position it as ready for the Trading Capital Program. Lead the pitch with a live demo showing real-time trade execution with visible AI reasoning, risk metrics, and validation artifacts. Have a pre-recorded backup demo video. The pitch structure: hook (30s on the problem of opaque AI trading), demo (2 min showing live dashboard), technical differentiation (30s on ERC-8004 depth), and future vision (30s on Trading Capital Program readiness). **Watch both ERC-8004 workshops** on the first day.

### Risks and unknowns

The competitive landscape is unknown — the number and quality of competing teams will only be clear during the hackathon. The hackathon may provide specific starter kits or requirements in the workshops that change the optimal approach. Pawel Czech's dual role (Surge CEO + hackathon organizer) means alignment with Surge's business goals likely matters.

### Links and resources

- Hackathon page: https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004
- Moltbot ERC-8004 trading agent article: https://medium.com/@savvysid/erc-8004-building-the-trustless-agent-layer-of-ethereum-0eec8b9ad112
- lablab.ai past winners: https://lablab.ai/event

---

## Area 11: Testnet operations carry minimal legal risk; Surge is a prop trading model

### Key findings

AI trading is legal in most jurisdictions when the underlying behavior is legal. The SEC and regulators care about behavior (spoofing, wash trading, market manipulation), not the tool. **Testnet operations carry minimal legal risk** because no real value is exchanged. However, the hackathon structure includes a potential pathway to real capital via Surge.

**Surge (surge.xyz)** is a multi-chain, AI-native platform for startup tokenization and early-stage capital formation. In this hackathon's context, it operates like a **prop trading firm**: prizes are distributed to winners' trading accounts (not directly as cash), profits from trading with that capital are shared between the winner and Surge, and first place gets "fast-track into the Trading Capital Program." The exact profit-sharing split is not publicly specified. Pawel Czech is CEO of Surge and also connected to lablab.ai/New Native. The $SURGE token exists on Solana.

**KYC will likely be required for prize collection** since prizes are in USDC distributed to trading/investment accounts. USDC is a regulated stablecoin, and the Surge platform handles tokenized capital. Have government-issued ID and proof of address ready. No explicit KYC is required for hackathon participation itself — only email-based registration on lablab.ai.

All submissions must be **open source under MIT License**. The Risk Router's enforced limits (max position size, max leverage, whitelisted markets, daily loss limit) serve as built-in compliance.

### Recommendations

Operate exclusively on testnet during the hackathon. Document all AI decision-making in your validation artifacts (aligns with EU AI Act best practices AND earns validation quality points). Avoid implementing spoofing, wash trading, or front-running logic even on testnet. Prepare KYC documents (ID, proof of address) before the hackathon ends for faster prize processing. Review Surge's terms of service before accepting any funded trading account.

### Risks and unknowns

The Surge profit-sharing terms are not publicly disclosed — ask during the hackathon's Discord/workshops. If the optional real-capital finals pool materializes, additional regulatory considerations apply. The jurisdictional applicability depends on your country of residence — some countries restrict participation in crypto trading programs. lablab.ai states it is "not responsible for third-party sponsor prizes" — Surge controls its own prize delivery timeline.

### Links and resources

- Surge: https://surge.xyz/
- lablab.ai terms: https://lablab.ai/terms
- EIP-8004 compliance properties: https://eips.ethereum.org/EIPS/eip-8004

---

## Area 12: Hackathon runs March 9–22 with $50K across multiple tracks

### Key findings

The hackathon runs **March 9–22, 2026** on the lablab.ai platform + Discord. The **$50,000 USDC** prize pool breaks down across multiple tracks:

- **Best Trustless Trading Agent**: $10,000 + fast-track Trading Capital Program + Surge launch evaluation
- **Best Risk-Adjusted Return**: $5,000 + Trading Capital Program seat
- **Best Validation & Trust Model**: $2,500 + mentorship with ERC-8004 contributors
- **Best Yield/Portfolio Agent**: $2,500
- **Best Compliance & Risk Guardrails**: $2,500
- **NativelyAI prizes**: $3,000/$2,000/$1,000 cash + Man-Hour credits
- Additional smaller prizes totaling ~$500 per tier

The execution flow is explicitly defined: (1) Register agent → mint ERC-721 identity, (2) Claim sandbox capital → funded sub-account in Hackathon Capital Vault, (3) Execute via Risk Router → signed TradeIntents with enforced limits, (4) Record trust signals → Validation Registry, (5) Leaderboard → lablab.ai publishes rankings.

**Required technology**: ERC-8004 registries, EIP-712 typed data signatures, EIP-1271 smart contract wallet support, EIP-155 chain-ID binding, DEX execution through whitelisted Risk Router. **Bonus technology**: TEE-backed attestations, zkML validation, off-chain indexers/subgraphs, on-chain portfolio risk modules.

Two workshops are critical: "ERC-8004 in 45 minutes" and "Building a trustless trading agent: TradeIntents, risk limits, and validation hooks" — both by Surge. A third workshop covers the submission process.

Key judges/mentors include Suneeth Maraboina (Apple), Hari Kanagala (RB Global AI/ML Group PM), James Lloyd (NEOM AI Strategic Advisor), and multiple Vultr developer relations advocates. The presence of Vultr mentors suggests Vultr may offer free compute credits.

Submission requirements: project title, descriptions, cover image, **video presentation**, **slide presentation**, public GitHub repo (MIT License), and demo application URL. The video and slides are critical — judges evaluate presentation quality as a core criterion.

There are also **X402 payment tracks** and a **Launch & Fund Your Startup track** — the ERC-8004 Financial/Trading Track is the main focus for your project.

### Recommendations

Register on lablab.ai and join the Discord immediately. **Attend both ERC-8004 workshops on the first available day** — they will likely clarify contract addresses, the Risk Router interface, and the Hackathon Capital Vault setup. Prepare your GitHub repo, README, and project structure before March 9 so you can start coding immediately. Create the video demo on Day 11–12, leaving Day 13 for polish and submission. Target multiple prizes simultaneously: "Best Trustless Trading Agent" + "Best Compliance & Risk Guardrails" + "Best Validation & Trust Model" — all share overlapping requirements. Check if Vultr offers free compute credits for participants (their heavy mentor presence suggests sponsor benefits). Have a pre-recorded demo backup ready in case of live demo failures.

### Risks and unknowns

The Risk Router contract interface is not publicly documented — it will likely be revealed in the workshops. The "Hackathon Capital Vault" setup is unclear — whether teams get a pre-funded account or deploy their own vault needs clarification. Workshop schedules are not yet published. The ERC-8004 standard's rapid evolution (V2 in development) means the workshops might introduce new features or requirements. Discord activity before the hackathon starts could provide early intelligence on competitor approaches and organizer expectations.

### Links and resources

- Hackathon page: https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004
- lablab.ai Discord: https://discord.gg/lablabai
- Surge: https://surge.xyz/ (X: @Surgexyz_)
- NativelyAI: https://nativelyai.com/ (X: @nativelyapp)
- ERC-8004 developer walkthrough: https://medium.com/@savvysid/erc-8004-building-the-trustless-agent-layer-of-ethereum-0eec8b9ad112

---

## Conclusion: A 13-day execution blueprint

The research reveals several critical corrections to original assumptions. There is no pre-deployed Risk Router — you build your own. The Validation Registry is unstable and may change. Base Sepolia contract addresses exist in three conflicting sources. And the hackathon prizes go to trading accounts with Surge profit-sharing, not direct cash payouts.

The optimal technical stack is confirmed as viable: Python (agent logic with bare Anthropic SDK, uv environment, SQLite state) + TypeScript (Next.js dashboard with shadcn/ui + TradingView Lightweight Charts, viem for on-chain) + Solidity (Risk Router + trade intent verifier via Foundry). Use the Agent0 SDK for ERC-8004 integration and ChaosChain reference contracts on Base Sepolia.

**The single most important strategic insight is that judges reward risk-adjusted consistency over raw returns.** A Sharpe of 2.0 with 8% max drawdown and rich validation artifacts wins over a Sharpe of 1.0 with 20% drawdown and no audit trail. Build conservatively, validate extensively, and present the agent as an institutional-grade autonomous fund manager ready for the Surge Trading Capital Program. The three areas with highest judge impact are: ERC-8004 integration depth, risk management sophistication, and the decision reasoning transparency in your dashboard.