# Market Data Specification

## Core Insight

Testnet tokens have no real market value. The correct architecture uses a **three-layer data stack**:

1. **Layer 1 (On-chain truth):** Chainlink/Pyth price feeds on Base Sepolia for execution pricing
2. **Layer 2 (Market signals):** Mainnet DEX data (GeckoTerminal) + macro data (DeFiLlama) for analysis
3. **Layer 3 (Sentiment):** CryptoPanic + Fear & Greed Index for directional bias

## Layer 1: On-Chain Price Feeds

### Chainlink (Primary)

- Active feeds on Base Sepolia: ETH/USD, BTC/USD, others
- **Free** (on-chain reads)
- Feed addresses: https://docs.chain.link/data-feeds/price-feeds/addresses (select Base Sepolia)
- **Day-1 action:** Verify exact feed addresses from docs

```python
# Reading Chainlink price feed
price_feed = w3.eth.contract(address=FEED_ADDRESS, abi=AGGREGATOR_ABI)
round_data = price_feed.functions.latestRoundData().call()
price = round_data[1] / 10**8  # 8 decimals
```

### Pyth Network (Secondary)

- Base Sepolia: `0xA2aa501b19aff244D90cc15a4Cf739D2725B5729`
- Sub-second latency
- Docs: https://docs.pyth.network/price-feeds/contract-addresses/evm

## Layer 2: Market Data APIs

### GeckoTerminal (Best Free DEX API)

| Property | Value |
|----------|-------|
| Rate limit | 30 calls/minute |
| Auth | None required |
| Data freshness | 2-3 seconds after tx confirmation |
| Granularity | Minute, hour, day OHLCV |
| Python SDK | `geckoterminal-api` on PyPI |
| Base Sepolia coverage | **Uncertain** - verify. Ethereum Sepolia confirmed. |

**Strategy:** Use Base **mainnet** DEX data as trading signals. Record exactly which data source fed which decision in validation artifacts.

Key endpoints:
- Pool OHLCV: `/networks/{network}/pools/{pool_address}/ohlcv/{timeframe}`
- Latest trades: `/networks/{network}/pools/{pool_address}/trades` (300 per call)
- Pool info: `/networks/{network}/pools/{pool_address}`

**Caching:** Precompute pool addresses (USDC/WETH), cache responses aggressively, build rate limiter.

### CoinGecko (Secondary - Broad Market Context)

| Property | Value |
|----------|-------|
| Free tier | 10,000 calls/month (~5-15 calls/min) |
| Granularity | 30-min minimum for recent data (no 1m/5m on free tier) |
| Use for | Broad market context, coin metadata |

GeckoTerminal's free API is strictly better for DEX data. Use CoinGecko only for macro context.

### DeFiLlama (Macro Signals)

| Property | Value |
|----------|-------|
| Auth | None required |
| Coverage | Base mainnet only (no testnet) |
| Use for | TVL trends, yield data, protocol health |
| Python SDKs | `defillama`, `dfllama` on PyPI |

## Layer 3: Sentiment

### CryptoPanic (Primary Sentiment)

| Property | Value |
|----------|-------|
| Free tier | Yes, with community sentiment scoring |
| Data | Aggregated crypto news with sentiment scores |
| Integration | Has MCP server for AI agent use |
| Use for | Real-time news sentiment, feed to Claude for analysis |

**Strategy:** Every 4 hours, feed last 50 headlines to Sonnet 4.6 for macro regime assessment.

### Fear & Greed Index

- Single free endpoint from Alternative.me
- Daily BTC sentiment indicator (0-100)
- Use as a macro directional bias input

### Rejected Sources

| Source | Reason |
|--------|--------|
| LunarCrush | No free API tier |
| Santiment | Free tier excludes last 30 days |
| Twitter/X API | Too limited on free tier |

## RPC Providers (for direct on-chain reads)

| Provider | Free Tier | Role |
|----------|-----------|------|
| **Alchemy** | 300M compute units/month | Primary |
| **Coinbase CDP** | Native Base + gas credits | Secondary |
| **Ankr** | `rpc.ankr.com/base_sepolia` | Fallback |
| **Public** | `https://sepolia.base.org` | Emergency |

## Indexing: The Graph

- Base Sepolia Uniswap V3 subgraphs available
- Free tier: 100,000 queries/month
- Use for dashboard queries (candles, swaps, pool liquidity)
- **Always maintain RPC fallback** for when subgraph indexing lags

## Data Pipeline Architecture

```
┌─────────────────────┐     ┌──────────────────┐
│  Chainlink/Pyth     │────>│                  │
│  (on-chain feeds)   │     │                  │
└─────────────────────┘     │                  │
                            │   Data Normalizer │──> Agent Decision Engine
┌─────────────────────┐     │   (Python)        │
│  GeckoTerminal      │────>│                  │
│  (mainnet DEX data) │     │  - Unified format │
└─────────────────────┘     │  - Source tagging  │
                            │  - Cache layer     │
┌─────────────────────┐     │                  │
│  CryptoPanic        │────>│                  │
│  (sentiment)        │     │                  │
└─────────────────────┘     └──────────────────┘
```

Every data point must be tagged with its source and timestamp for validation artifacts.

## Resources

- Chainlink feeds: https://docs.chain.link/data-feeds/price-feeds/addresses
- Pyth: https://docs.pyth.network/price-feeds/contract-addresses/evm
- GeckoTerminal API: https://api.geckoterminal.com/docs/index.html
- GeckoTerminal Python SDK: https://pypi.org/project/geckoterminal-api/
- DeFiLlama API: https://defillama.com/docs/api
- CryptoPanic API: https://cryptopanic.com/developers/api/
- Fear & Greed: https://alternative.me/crypto/fear-and-greed-index/
