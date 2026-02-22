# Golden Fleece — Deep Research for a Trustless AI Trading Agent in the ERC-8004 Hackathon

## Standards and on-chain registries

### ERC-8004 Standard — Current State and Implementation Reality

**Key Findings:**  
The canonical ERC-8004 specification (EIP-8004) is currently **Draft** (not Final), and explicitly lists dependencies on **EIP-155**, **EIP-712**, **ERC-721**, and **ERC-1271**. citeturn5view0 The spec’s core design is three registries—Identity (ERC-721 identity + `tokenURI` registration file), Reputation (fixed-point feedback signals + optional off-chain evidence URIs), and Validation (request/response hooks for 3rd-party validation). citeturn9view2turn6view1

The “implementation reality” is that the reference registry contracts are **upgradeable UUPS proxies** deployed to deterministic “vanity” addresses using CREATE2, with a deterministic CREATE2 factory and a two-phase “MinimalUUPS placeholder → upgrade to real implementation” flow. citeturn9view0turn9view1 This is why the same proxy addresses repeat across many chains (all mainnets share one address; all testnets share one address), and why you must treat proxy admin/upgrade ownership as a relevant trust surface. citeturn9view1turn21view2

On **Base Sepolia**, the ERC-8004 registries you will likely interact with are:

- **Identity Registry (proxy):** `0x8004A818BFB912233c491871b3d84c89A494BD9e` citeturn6view1turn21view2turn10view1  
- **Reputation Registry (proxy):** `0x8004B663056A597Dffe9eCcC1965A193B7388713` citeturn6view1turn9view1  
- **Validation Registry (proxy):** `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` citeturn9view0turn9view1turn19view0  

Important caveat: the `erc-8004-contracts` README’s “Contract Addresses” section lists Identity + Reputation on Base Sepolia but does **not** list Validation for that network, while the repo’s deployment/upgrade docs do list a deterministic ValidationRegistry address. Treat this as a “verify on explorer before hackathon day 1” item. citeturn6view1turn9view1

The implementers themselves note that the **Validation Registry portion is still under active update/discussion** (TEE community) and is expected to be revised. This matters for your hackathon “validation artifacts” plan: avoid overfitting to unstable details. citeturn6view1

Tooling reality (beyond the spec) is stronger than the EIP “Draft” label implies:
- A **Pinata** quickstart provides a “register → upload card → set URI” flow with concrete `viem` code examples and scripts/wizard tooling. citeturn21view2  
- An unofficial TypeScript SDK (`erc-8004-js`) provides convenience wrappers for identity/reputation/validation calls and includes the ValidationRegistry address. citeturn19view0  
- The official `best-practices` guide strongly suggests including rich registration metadata and using standardized “dimensions” (tags) for reputation, including a “tradingYield” pattern that is directly relevant to your use case. citeturn22view0turn22view1  

Open discussions on Ethereum Magicians highlight known design concerns you should plan around: domain/front-running concerns (for domain-based identity mapping variants), the fact that on-chain identity does not “bind” model/version behavior, and debates about what should/shouldn’t be stored on-chain for gas and security. citeturn11search5turn15search7turn18search9

**Recommendations:**  
For a trading agent judged heavily on validation quality, your goal should be to implement **the ERC-8004 flows exactly as the deployed contracts expect**, while making validation artifacts maximally useful to judges and easy to verify.

Concrete on-chain touchpoints (Base Sepolia):
- Hardcode the Base Sepolia registry proxy addresses above, but also add a runtime “sanity check” (e.g., read `name()` / `symbol()` / `getVersion()` if exposed, or verify proxy bytecode) at startup so you can flag misconfigurations on demo day. citeturn10view1turn9view0  
- Treat all registries as **proxies** and always interact with the proxy address, not the implementation address shown by explorers. citeturn9view0turn10view1  

Implement the standard registration flow in a way that is friendly to hackathon judging:
1. **Register without a URI** (`register()`) to mint the NFT and get `agentId`. citeturn21view2turn9view2  
2. Build the registration JSON and ensure `registrations[]` includes `{ agentId, agentRegistry }`, where `agentRegistry` is `eip155:84532:<identityRegistryAddress>`. citeturn21view2turn9view2  
3. Publish the JSON to IPFS (or equivalent) and call `setAgentURI(agentId, ipfs://…)`. citeturn21view2turn9view2  
4. Optionally publish `/.well-known/agent-registration.json` on your dashboard domain for endpoint verification. citeturn21view2turn9view2turn22view0  

A minimal `viem`-style Registration call set (Base Sepolia) that matches the spec and Pinata’s approach:

```ts
import { createPublicClient, createWalletClient, http, parseAbi, parseEventLogs } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia } from "viem/chains"

const IDENTITY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const

const abi = parseAbi([
  "function register() external returns (uint256 agentId)",
  "function setAgentURI(uint256 agentId, string newURI) external",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
])

async function registerAndSetURI(ipfsUri: string) {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(process.env.RPC_URL) })
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(process.env.RPC_URL) })

  const registerHash = await walletClient.writeContract({
    address: IDENTITY,
    abi,
    functionName: "register",
    args: [],
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash: registerHash })
  const logs = parseEventLogs({ abi, logs: receipt.logs, eventName: "Registered" })
  const agentId = logs[0].args.agentId

  const setHash = await walletClient.writeContract({
    address: IDENTITY,
    abi,
    functionName: "setAgentURI",
    args: [agentId, ipfsUri],
  })
  await publicClient.waitForTransactionReceipt({ hash: setHash })
  return { agentId }
}
```

citeturn21view2turn9view2

For validation artifacts, implement the Validation Registry as a **first-class audit log**:
- Every “key action” (signal→intent→risk check→execution→post-trade evaluation) should have an off-chain artifact whose **hash is committed** via `validationRequest` / `validationResponse` pairs. citeturn9view2turn6view1  
- Because the Validation Registry spec/semantics are explicitly evolving, keep your artifact schema stable and self-describing (more in Area 7). citeturn6view1

For “reputation from trading outcomes,” design around a critical ERC-8004 constraint: the Reputation Registry prevents **self-feedback** from an agent owner/operator. That means your bot cannot simply post its own positive performance score from the same controlling address. citeturn9view2turn6view1  
A practical hackathon approach is to have:
- A separate “scorer” address (or committee of scorer addresses) that watches your on-chain performance and posts standardized feedback under a clear tag taxonomy (e.g., `tag1=tradingYield`, `tag2=day|week`, etc.). citeturn22view1turn9view2  
- Judges can reproduce the score using your public artifacts; the on-chain feedback acts as the portable reputation signal.

**Risks & Unknowns:**  
- The Validation Registry is explicitly flagged as under active update; don’t rely on a single validator scheme being accepted by judges. citeturn6view1  
- Your prompt assumes “validation artifacts for every key action” are required by hackathon rules; the public hackathon page content available during this research did **not** expose contract addresses or a detailed validator standard. Plan to confirm requirements and any canonical artifact format early in the event channels. citeturn1view2  
- Community SDKs sometimes simplify the spec in ways that can mislead you—e.g., a `getSummary(agentId)` wrapper may hide the spec requirement that summaries should be filtered by a non-empty set of reviewer addresses to mitigate Sybil/spam. Verify all wrapper behavior against the EIP or the on-chain ABI. citeturn19view0turn9view2turn6view1  

**Links & Resources:**  
- `https://eips.ethereum.org/EIPS/eip-8004` citeturn5view0  
- `https://github.com/erc-8004/erc-8004-contracts` citeturn6view1  
- `https://raw.githubusercontent.com/erc-8004/erc-8004-contracts/master/UPGRADEABLE_IMPLEMENTATION.md` citeturn9view0  
- `https://raw.githubusercontent.com/erc-8004/erc-8004-contracts/master/VANITY_DEPLOYMENT_GUIDE.md` citeturn9view1  
- `https://docs.pinata.cloud/tools/erc-8004/quickstart` citeturn21view2  
- `https://raw.githubusercontent.com/erc-8004/best-practices/main/Registration.md` citeturn22view0  
- `https://raw.githubusercontent.com/erc-8004/best-practices/main/Reputation.md` citeturn22view1  
- `https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098` citeturn15search18  

### EIP Dependencies — EIP-712, EIP-1271, EIP-155

**Key Findings:**  
EIP-8004 explicitly requires EIP-155 (chain IDs), EIP-712 (typed structured signatures), and ERC-1271 (contract-based wallet signature validation), primarily to enable secure, portable agent identity operations—especially `setAgentWallet`, which requires proving control of a new receiving wallet via EIP-712 (EOA) or ERC-1271 (smart contract wallet). citeturn5view0turn21view2turn9view2

Base Sepolia chain ID is **84532**, and the deterministic Identity Registry address on Base Sepolia is `0x8004A818…BD9e` (shared by all “testnets” in the Pinata quickstart table). citeturn21view2

**Recommendations:**  
For a hackathon trading agent, the main practical design choice is: “What key is the ultimate controller of the agent NFT, and what key is the execution wallet that submits trades?” Use ERC-8004’s `agentWallet` concept to make this relationship explicit and verifiable.

Strong default for your project:
- Make the **agent NFT owner** a cold-ish admin key (or a smart account you control), and set the **agentWallet** to the hot execution wallet you’ll actually trade from. The ERC-8004 registry supports updating `agentWallet` only with proven control by the new wallet (EIP-712/1271), and it is cleared on NFT transfer, which matches the “portable identity with revocable execution authority” model you want. citeturn9view2turn21view2  
- Treat **chainId binding** as mandatory in any typed-data you define for “trade intents” to prevent cross-chain replay, and align this with ERC-8004’s multi-chain identity format `eip155:<chainId>:<identityRegistry>`. citeturn9view2turn21view2  

Typed-data pattern recommendation for “trade intents” (project-specific, but anchored in EIP-712 best practice):
- Domain: `{ name: "GoldenFleeceTradeIntent", version: "1", chainId: 84532, verifyingContract: <RiskRouterAddress> }`
- PrimaryType: `TradeIntent`
- Include: `agentRegistry`, `agentId`, `nonce`, `deadline`, `tokenIn`, `tokenOut`, `amountIn`, `minAmountOut`, `dexRouter`, `maxSlippageBps`, `maxGas`, plus a `validationRoot` (hash pointer to the artifact bundle for that cycle).

(You cannot fully finalize `verifyingContract` until you know the hackathon Risk Router address/interface; see Area 3 / Area 12.)

Smart contract wallet choices:
- If you use an ERC-1271 wallet, ensure your off-chain signing flow can produce both (a) EOA signatures today and (b) contract signatures later without refactoring your entire stack. ERC-8004 `setAgentWallet` explicitly anticipates ERC-1271. citeturn9view2  

**Risks & Unknowns:**  
- Without the hackathon’s canonical Risk Router ABI/address, you cannot finalize your EIP-712 domain separator for trade intents in a “verifyingContract-bound” way. (You can still sign over chainId + intent hash, but you lose some replay protections.)  
- Some community libraries may abstract EIP-712/1271 complexity, but you must confirm they match the on-chain contract’s exact typed-data hashes (especially for `setAgentWallet`). Mismatches are a common source of “signature invalid” failures. citeturn9view2turn21view2  

**Links & Resources:**  
- `https://eips.ethereum.org/EIPS/eip-8004` citeturn5view0  
- `https://docs.pinata.cloud/tools/erc-8004/quickstart` (see “Payment Wallet” and the `setAgentWallet` function signatures) citeturn21view2  

## Execution environment on Base Sepolia

### Base Sepolia — DEX and DeFi Ecosystem

**Key Findings:**  
Base’s official “Ecosystem Contracts” documentation lists **Uniswap v3** and **Uniswap v2** deployments on **Base Sepolia**, including the key router factories and interfaces. citeturn24view1

For Base Sepolia DEX integration, Uniswap v3 addresses you can use immediately include:
- `swapRouter` (Base Sepolia): `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4` citeturn24view1turn24view0  
- `v3CoreFactory` (Base Sepolia): `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24` citeturn24view1turn24view0  
- `universal router` (Base Sepolia): `0x050E797f3625EC8785265e1d9BDd4799b97528A1` citeturn24view1turn24view0  

Uniswap’s own deployment documentation for Base also lists a Base Sepolia WETH address:
- `WETH` (Base Sepolia): `0x4200000000000000000000000000000000000006` citeturn24view0  

For stablecoin testing, Circle’s official “USDC Contract Addresses” page lists:
- **USDC (Base Sepolia):** `0x036CbD53842c5426634e7929541eC2318f3dCF7e` citeturn23search13turn23search9  

Base’s official faucet documentation enumerates multiple reliable faucets and claim limits, including:
- Coinbase Developer Platform faucet (Base Sepolia): up to **0.1 ETH per 24h** and supports **USDC/EURC/cbBTC**. citeturn24view2  
- thirdweb and Alchemy faucets also support Base Sepolia with rate limiting. citeturn24view2  
Coinbase Developer Platform also provides a programmatic “Faucets API” quickstart (TypeScript + Python examples). citeturn24view3

Indexing: The Graph ecosystem includes Base Sepolia Uniswap v3 subgraphs; a referenced subgraph shows the standard “Query URL” form `/subgraphs/id/<subgraphId>` and identifies the network as `base-sepolia`. citeturn25search3turn25search15  

**Recommendations:**  
Make Uniswap v3 your primary testnet execution venue unless the hackathon Risk Router constrains you to a different router. Base’s docs and Uniswap’s own listings give you everything needed to build swaps (factory/router/quoter/universal router). citeturn24view1turn24view0

Concrete starting configuration (Base Sepolia):
- Token baseline: use **USDC + WETH** pairs first (addresses above), because they are standard and easy for judges to understand. citeturn23search13turn24view0  
- Router baseline: prefer **Universal Router** for forward compatibility, but implement **SwapRouter02** paths too if your Risk Router expects it (Uniswap notes Universal Router is the “preferred entrypoint,” replacing SwapRouter02). citeturn24view0turn24view1  
- Liquidity discovery: if you need to find pools programmatically, call `getPool(tokenA, tokenB, fee)` against `UniswapV3Factory` (documented in Uniswap deployments). citeturn24view0  

Testnet funds automation:
- Add a “bootstrap script” that calls the Coinbase Developer Platform Faucets API to provision ETH and USDC to your execution wallet(s) right before demos. citeturn24view3turn24view2

Subgraph usage:
- Use the Base Sepolia Uniswap v3 subgraph (or your own indexer fallback) to power the dashboard (candles, swaps, pool liquidity) without hammering RPC. citeturn25search3turn25search15  
- Keep a “hard fallback” that reads on-chain pool state via RPC in case testnet subgraph indexing lags.

**Risks & Unknowns:**  
- The hackathon prompt mentions trades must execute through a **whitelisted Risk Router contract** on Base Sepolia. During this research, no public hackathon page content exposed the Risk Router address or ABI—so you should assume you’ll need to discover it from organizer announcements, a starter-kit repo, or Discord. citeturn1view2  
- Liquidity on testnets can be thin and erratic. Your strategy should treat slippage and pool depth as first-order risk constraints, not an afterthought.

**Links & Resources:**  
- `https://docs.base.org/base-chain/network-information/ecosystem-contracts` citeturn24view1  
- `https://docs.base.org/base-chain/tools/network-faucets` citeturn24view2  
- `https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments` citeturn24view0  
- `https://developers.circle.com/stablecoins/usdc-contract-addresses` citeturn23search13  
- Example Graph subgraph (Base Sepolia): `https://thegraph.com/explorer/subgraphs/4xPAdAuU9HfbQhNdGCfZYBw45Ey6KB71R3dc4qCD5XhQ` citeturn25search3  

## Agent design, data, and trading performance

### Agent Architecture — Framework and Orchestration

**Key Findings:**  
ERC-8004’s registration file is explicitly designed to advertise multiple interaction endpoints (web, MCP, A2A, OASF, ENS, DID, email), and includes optional endpoint domain verification via `/.well-known/agent-registration.json`. citeturn9view2turn21view2turn22view0 This strongly suggests your “agent architecture” should separate:
- an on-chain identity + trust layer (ERC-8004 registries), from
- off-chain service endpoints (Python inference loop, data fetchers, execution service, dashboard backend). citeturn9view2turn22view0

**Recommendations:**  
Given a 13-day hackathon constraint (and the fact that validation artifacts are a major judging input), optimize for “predictable execution + verifiable logs,” not maximal autonomy.

Pragmatic architecture that maps cleanly to ERC-8004:
- Python “decision engine” produces a **Decision Packet** each cycle:
  - market snapshot hashes, features, regime labels
  - portfolio state + risk budget
  - proposed trade intent(s) with explicit constraints
  - links to raw data (as content-addressed blobs)  
- TypeScript “on-chain executor” validates the Decision Packet, signs/relays any required EIP-712 intents, and submits trades via the hackathon Risk Router.  
- A “publisher” component writes:
  - ERC-8004 Validation artifacts (every key step)
  - post-trade analytics and weekly “tradingYield” summary artifacts designed for Reputation Registry scoring by third parties. citeturn22view1turn9view2turn6view1  

If you use a graph/orchestrator framework, keep it shallow:
- “Cycle Graph” nodes: **Fetch → Normalize → Decide → Risk → Execute → Evaluate → Publish**  
- Make every edge produce a hash-linked artifact. The “graph” becomes your audit trail, not your intelligence.

State management:
- Persist full state snapshots (positions, open orders, risk flags, thresholds, last N decisions) in an append-only store whose root hash is referenced in each validation artifact. This makes it easy for judges to follow causality across trades.

**Risks & Unknowns:**  
- Your prompt assumes a particular LLM model and an “agent SDK” availability. ERC-8004 does not bind to any LLM tooling, and community discussions explicitly note that model choice can materially change behavior yet is not part of the on-chain identity core. You should therefore record model/version in artifacts even if it is not on-chain. citeturn15search7  
- Without up-to-date, official sources for your chosen LLM’s current pricing/rate-limits in this research bundle, you should plan a hard budget and caching strategy and validate the true limits on day 1.

**Links & Resources:**  
- ERC-8004 registration file schema (services/endpoints): `https://eips.ethereum.org/EIPS/eip-8004` citeturn9view2  
- ERC-8004 registration best practices: `https://github.com/erc-8004/best-practices` citeturn21view3  

### Market Data APIs — Availability, Reliability, and Integration

**Key Findings:**  
**GeckoTerminal** operates a free public API with:
- root URL `https://api.geckoterminal.com/api/v2` citeturn25search33  
- data caching of ~1 minute and updates as fast as ~2–3 seconds after a transaction confirmation (per docs) citeturn25search5  
- a public rate limit documented as **30 calls per minute** citeturn25search21  
GeckoTerminal also publicly tracks “Sepolia Testnet” pools and provides an API-ID `sepolia-testnet` for that testnet dataset. citeturn25search1  
A lightweight Python wrapper for the GeckoTerminal API exists. citeturn25search17

**CoinGecko** provides:
- `/coins/{id}/ohlc` and `/coins/{id}/ohlc/range` endpoints in its API reference. citeturn25search2turn25search6  
- a documented public API rate limit of **~5–15 calls per minute** (public plan), with a “Demo account” as a path to stable 30 calls/min. citeturn25search18  
CoinGecko’s platform also highlights an “On-chain DEX” API surface (`/onchain/*`) for pools and tokens. citeturn25search14  
For pool OHLCV specifically, CoinGecko documents endpoints by network + pool address. citeturn25search10turn25search30  

**The Graph**: public “subgraph explorer” listings exist for Uniswap v3 on Base Sepolia, using the standard query path `/subgraphs/id/<SubgraphID>`. citeturn25search3turn25search15  
Uniswap’s own API docs acknowledge that Uniswap uses multiple subgraphs hosted on The Graph for indexing/querying protocol data. citeturn25search11

**Recommendations:**  
For testnet trading where you need reliable signals:
- Use **on-chain state + DEX-derived prices** as your primary “ground truth,” because your execution venue is the DEX itself.  
- Use CoinGecko/GeckoTerminal as “convenience overlays” (crossover analytics, easier candles), but always record exactly which source fed which decision in your artifacts. citeturn25search5turn25search14  

GeckoTerminal integration strategy:
- Favor requesting pool-level OHLCV by pool address where possible, and cache aggressively due to 30 calls/min constraints. citeturn25search21turn25search33  
- Precompute the pool addresses you care about (USDC/WETH; any tokens you trade) and store them in config.

CoinGecko integration strategy:
- Use the `/onchain/*` endpoints for DEX pool metrics when available (because they conceptually match your on-chain venue), and fall back to “coin ID OHLC” only for broad market context. citeturn25search14turn25search2  
- Build a rate limiter around the public plan constraints, and cache results per timeframe window. citeturn25search18  

The Graph:
- Pick one Base Sepolia Uniswap v3 subgraph and treat it as best-effort. Always have an RPC fallback. citeturn25search3turn25search15  

**Risks & Unknowns:**  
- This research bundle confirms “Sepolia Testnet” coverage for GeckoTerminal, but it does not, by itself, prove “Base Sepolia” is separately covered under GeckoTerminal’s network IDs. Verify whether Base Sepolia data is under `sepolia-testnet`, under a distinct Base Sepolia ID, or not supported, before you depend on it for the dashboard. citeturn25search1turn25search33  
- Chainlink price feeds: a canonical “Price Feed Contract Addresses” index exists, but this bundle does not extract Base Sepolia feed addresses from it. Plan to confirm which feeds are live on Base Sepolia (if any) and record them in config. citeturn25search20  

**Links & Resources:**  
- GeckoTerminal API docs: `https://api.geckoterminal.com/docs/index.html` citeturn25search5  
- GeckoTerminal API guide (root URL): `https://apiguide.geckoterminal.com/getting-started` citeturn25search33  
- GeckoTerminal API FAQ (rate limit): `https://apiguide.geckoterminal.com/faq` citeturn25search21  
- CoinGecko OHLC by ID: `https://docs.coingecko.com/reference/coins-id-ohlc` citeturn25search2  
- CoinGecko public plan rate-limit note: `https://support.coingecko.com/hc/en-us/articles/4538771776153-What-is-the-rate-limit-for-CoinGecko-API-public-plan` citeturn25search18  
- The Graph Base Sepolia Uniswap v3 example: `https://thegraph.com/explorer/subgraphs/4xPAdAuU9HfbQhNdGCfZYBw45Ey6KB71R3dc4qCD5XhQ` citeturn25search3  
- Uniswap subgraph overview: `https://docs.uniswap.org/api/subgraph/overview` citeturn25search11  

### Trading Strategy — Risk-Adjusted Return Optimization

**Key Findings:**  
ERC-8004’s own best practices explicitly call out **trading agents** as a key use case and recommends publishing standardized performance signals using `tag1=tradingYield` and a time-window dimension `tag2=day|week|month|year`, so third-party rankers can build consistent leaderboards. citeturn22view1 This aligns tightly with your judging criteria (risk-adjusted performance + drawdown control).

**Recommendations:**  
Design your strategy to win the scoring function, not to maximize raw PnL:

A robust hackathon strategy template for short-horizon Sharpe + drawdown:
- Trade only 1–2 liquid pairs (e.g., USDC/WETH) to reduce tail risk from thin liquidity and oracle noise. citeturn23search13turn24view0  
- Use a “regime gate”:
  - If volatility is high and liquidity is low → reduce leverage/position size or switch to “no-trade / hold stable” mode.  
- Enforce strict circuit breakers:
  - Daily loss limit (stop trading for the rest of the day)
  - Max drawdown limit (enter “safe mode” holding USDC)
  - Slippage ceiling for every swap (reject trade if expected slippage > threshold)

Reputation and validation alignment:
- At the end of each day, compute a “daily yield” and publish an off-chain artifact with:
  - realized PnL, unrealized PnL, fees paid, max drawdown, realized volatility,
  - and the exact on-chain transaction set used to compute it.  
- Have an external “scorer address” post `tradingYield` feedback on-chain (Reputation Registry), referencing that artifact hash/URI. citeturn22view1turn9view2turn6view1  

Backtesting (pragmatic):
- Because testnet microstructure differs from mainnet, backtest primarily for “logic correctness” and parameter sensitivity; rely on live testnet rehearsal runs for final tuning.

**Risks & Unknowns:**  
- Testnet liquidity can change sharply; a strategy that looks stable for 48 hours may fail on day 5 if the pool drains.  
- “External scorer” design must avoid any appearance of self-dealing; your artifacts should enable judges to recompute performance independently.

**Links & Resources:**  
- ERC-8004 reputation patterns for trading yield: `https://raw.githubusercontent.com/erc-8004/best-practices/main/Reputation.md` citeturn22view1  

### Validation and Trust Model — Maximizing ERC-8004 Integration Depth

**Key Findings:**  
ERC-8004 supports a Validation Registry interface with two core calls:
- `validationRequest(validatorAddress, agentId, requestURI, requestHash)` by owner/operator  
- `validationResponse(requestHash, response, responseURI, responseHash, tag)` by the requested validator citeturn9view2turn6view1  
The registry’s purpose is not to prescribe one validator method, but to serve as a standardized hook for different trust models (stake-secured re-execution, zkML, TEE attestations, trusted judges). citeturn9view2turn6view1  
Community discussion explicitly explores richer, machine-verifiable “contracts” for validation such as a “Verifiable Service Promise (VSP)” and execution logs. citeturn15search8turn18search22

**Recommendations:**  
Treat “validation artifacts” as a structured, reproducible evidence bundle, not a prose explanation.

Artifact design recommendation (requestURI payload):
- `decision.json` (inputs + feature hashes + portfolio state + thresholds)
- `intent.json` (EIP-712 typed trade intent; nonce; deadline; slippage caps)
- `risk.json` (router allowlist checks; max drawdown state; circuit breaker state)
- `execution.json` (tx hash; decoded calldata; receipts; gas; slippage realized)
- `posttrade.json` (PnL + risk metrics + attribution to trades)
- `bundle.manifest.json` containing:
  - content hashes for each file
  - git commit hash of the agent code
  - model identifier and prompt hash
  - a deterministic “replay recipe” describing exactly how to recompute metrics

Then:
- `requestHash = keccak256(bundle.manifest.json bytes)` and that hash is what you pass on-chain. citeturn9view2turn6view1  
- `responseURI` should point to a validator’s computed result (pass/fail + computed metrics), also with a hash commitment. citeturn9view2turn6view1  

Storage recommendation:
- Prefer IPFS for content-addressed artifact bundles so `feedbackHash/responseHash` can be optional (per spec guidance), but still include explicit keccak hashes in the manifest for redundancy. citeturn9view2turn21view2  
- If you use a pinning provider, use one that provides reliability; multiple ecosystem guides emphasize using robust pinning (e.g., Filebase or Filecoin pinning) so your agent identity and artifacts don’t “disappear.” citeturn18search15turn20search0turn21view2  

Optimal frequency:
- Log validation for every trade, and for every day-end “performance rollup.” Non-trade decisions can be batched (e.g., “no trade today because circuit breaker engaged”) so you don’t spam. The spec’s own discussions emphasize gas concerns around storing too much per action. citeturn15search6turn15search7  

Trustlessness demonstration:
- Your dashboard should let a third party download the manifest and verify:
  - all hashes match
  - all txs exist on Base Sepolia
  - the computed PnL matches what you claim  
This is the difference between “we logged something” and “we are auditable.”

Reputation scoring model alignment:
- Use standardized tags for acceptability:
  - `tag1=tradingYield`, `tag2=day`
  - `tag1=maxDrawdown`, `tag2=day`
  - `tag1=sharpe`, `tag2=week`  
…and require any external scorer to include the artifact URI+hash in the on-chain feedback event fields. citeturn22view1turn9view2  

**Risks & Unknowns:**  
- The Validation Registry semantics are flagged as evolving; avoid relying on any one response code taxonomy as “official.” citeturn6view1  
- If the hackathon organizers provide a canonical validator set or required tags, you must conform. The public materials reviewed here did not expose such a list. citeturn1view2  

**Links & Resources:**  
- EIP-8004 validation interface: `https://eips.ethereum.org/EIPS/eip-8004` citeturn11search2  
- ERC-8004 contracts (upgradeable proxy design): `https://github.com/erc-8004/erc-8004-contracts` citeturn6view1  
- Filecoin Pin tutorial for ERC-8004 registration: `https://docs.filecoin.io/builder-cookbook/filecoin-pin/erc-8004-agent-registration` citeturn20search0  

## Presentation and delivery

### Dashboard and Presentation

**Key Findings:**  
ERC-8004 best practices emphasize that registration metadata is effectively the agent’s “business card” across explorers and marketplaces, and encourages rich service descriptors (MCP/A2A/OASF) and “production readiness” signals like `active=true` and optional endpoint verification. citeturn22view0  
This implies that judges (and any ERC-8004 explorer) will look for: a clean identity file, verifiable endpoints, and easy-to-understand trust signals.

**Recommendations:**  
Dashboard sections that map directly to judging:
- **Performance (risk-adjusted):** cumulative return, rolling Sharpe proxy, max drawdown, realized vol, hit-rate, average slippage.
- **Risk controls panel:** current mode (normal/safe/paused), circuit breakers triggered, exposure by token.
- **Audit trail timeline:** every decision cycle → links to validation artifacts (manifest + hashes) → linked txs.
- **ERC-8004 identity & trust panel:** agentId, agentRegistry string, tokenURI, agentWallet, recent reputation events, recent validation requests/responses (by hash). citeturn9view2turn21view2  

Real-time mechanism:
- Prefer a pull-based UI with server-side caching (subgraphs + periodic RPC polling) over fragile high-frequency websockets, unless you have strong reason. Testnets are noisy; reliability beats latency in demos.

Charts:
- Candles + overlays: show executed trades as markers, show “decision confidence” and “risk budget used” as overlays.

**Risks & Unknowns:**  
- If judges expect a specific explorer integration (e.g., a particular ERC-8004 agent explorer), you’ll want compatibility testing early. This bundle cannot confirm what judges will use.

**Links & Resources:**  
- ERC-8004 registration “golden rules”: `https://raw.githubusercontent.com/erc-8004/best-practices/main/Registration.md` citeturn22view0  

### Infrastructure and DevOps for a Hackathon

**Key Findings:**  
The Base ecosystem provides multiple faucets (including programmatic options), which reduces operational risk when you need to replenish accounts quickly for demos. citeturn24view2turn24view3  
The Pinata quickstart provides a complete scripted registration flow and demonstrates `bun` + `viem` usage, which is directly compatible with your proposed TS integration approach. citeturn21view2

**Recommendations:**  
Monorepo:
- Keep it simple: a single repo with `/agent-python`, `/chain-ts`, `/dashboard-nextjs`, `/contracts-foundry`.
- Build a “one command” demo runner that:
  1) syncs env vars  
  2) verifies contracts/network connectivity  
  3) runs a single “trade cycle” and publishes artifacts  
  4) opens the dashboard at the correct agentId

Secrets:
- Split keys:
  - Registry admin key (agent NFT owner)  
  - Trading execution key (agentWallet)  
- Never bake private keys into artifacts; only include public addresses and signatures.

Deployment:
- If you deploy, deploy the dashboard; keep the agent local or on a cheap VM and show reproducibility. The audit trail matters more than 99.9% uptime during a hackathon.

**Risks & Unknowns:**  
- If hackathon infra requires a continuously running agent, a purely local demo may be insufficient; confirm expectations early. citeturn1view2  

**Links & Resources:**  
- Base faucets: `https://docs.base.org/base-chain/tools/network-faucets` citeturn24view2  
- Coinbase Developer Platform faucets API: `https://docs.cdp.coinbase.com/faucets/introduction/quickstart` citeturn24view3  
- Pinata ERC-8004 quickstart: `https://docs.pinata.cloud/tools/erc-8004/quickstart` citeturn21view2  

## Competition, legal, and hackathon intelligence

### Competitive Analysis and Differentiation

**Key Findings:**  
ERC-8004’s own best practices and community discussions converge on a single theme: **trust portability requires strong evidence hygiene**—trusted reviewers, clear tags/dimensions, and auditable off-chain payloads. citeturn22view1turn15search7turn15search6 This is exactly what a trading-agent hackathon judging for risk-adjusted performance and validation quality will reward.

**Recommendations:**  
A differentiating “Best Trustless Trading Agent” angle:
- Present your bot as a **verifiable on-chain track record generator**, not “an AI that trades.”
- Make the key deliverable: “Anyone can reproduce our Sharpe and drawdown numbers from the artifacts + chain.”

Concrete standout features:
- “Replay mode” button on dashboard: downloads the manifest, replays metrics, and shows a green check if matching.
- “Explainable risk” artifacts: every trade shows *which constraint bound* (max slippage, drawdown cap, liquidity floor).
- Publish a public “Scoring Spec” (your own VSP-style contract): how you compute returns, what you consider a drawdown breach, etc. citeturn15search8turn18search22  

**Risks & Unknowns:**  
- Without a dataset of prior lablab.ai winners embedded in this research bundle, “expected polish” benchmarking is incomplete. If the hackathon provides sample winners or demo videos, incorporate them early.

**Links & Resources:**  
- ERC-8004 reputation best practices (trusted reviewers + standardized tags): `https://raw.githubusercontent.com/erc-8004/best-practices/main/Reputation.md` citeturn22view1  
- Magicians discussion (design tradeoffs & pitfalls): `https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098` citeturn15search18  

### Legal and Compliance Considerations

**Key Findings:**  
ERC-8004 itself is an identity/trust substrate and explicitly states payments are orthogonal/out-of-scope, though payment proofs can enrich feedback. citeturn9view2turn6view1 That means legal/compliance considerations will be dominated by hackathon terms and any prize/KYC requirements rather than ERC-8004 mechanics.

**Recommendations:**  
- Treat the agent as a **testnet research prototype** and avoid making claims of investment advice.
- If you build any “profit-sharing / surge capital” style narrative, ensure you understand the actual terms before presenting.

**Risks & Unknowns:**  
- The provided public materials in this research bundle do not include detailed KYC or any “Surge capital program” term sheet. Confirm directly from organizer channels and the official rules pages. citeturn1view2  

**Links & Resources:**  
- ERC-8004 spec (payments out of scope): `https://eips.ethereum.org/EIPS/eip-8004` citeturn9view2  
- Hackathon page (official terms/rules location): `https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004` citeturn1view2  

### Hackathon-Specific Intelligence

**Key Findings:**  
The hackathon page establishes the event context (AI Trading Agents with ERC-8004) and is the canonical starting point for updated rules, schedule, and resources. citeturn1view2 However, during this research pass, the publicly visible page content did **not** surface the concrete on-chain details your prompt assumes you’ll need immediately (notably, the Risk Router address/interface and any organizer-provided sandbox contract list). citeturn1view2

**Recommendations:**  
Day-0 checklist (before coding strategy):
- Identify the Risk Router (address + ABI + allowed venues/tokens + any max position sizing rules).
- Confirm how reputation should be “accumulated from trading outcomes” (who posts feedback? is there an evaluator contract?).
- Confirm what counts as a “validation artifact” for judging: do they expect on-chain Validation Registry usage, or is a hashed off-chain audit log sufficient?

Prepare to adapt:
- Your architecture should allow swapping Risk Router integration code quickly without changing the Python decision loop.

**Risks & Unknowns:**  
- Organizers may publish critical information (addresses, starter kits) in Discord or a GitHub repo rather than embedding it directly on the hackathon landing page. citeturn1view2  

**Links & Resources:**  
- Hackathon landing page: `https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004` citeturn1view2  
- ERC-8004 contracts (Base Sepolia registries): `https://github.com/erc-8004/erc-8004-contracts` citeturn6view1  
- Base testnet tooling (faucets + ecosystem contracts you can trade against):  
  - `https://docs.base.org/base-chain/network-information/ecosystem-contracts` citeturn24view1  
  - `https://docs.base.org/base-chain/tools/network-faucets` citeturn24view2