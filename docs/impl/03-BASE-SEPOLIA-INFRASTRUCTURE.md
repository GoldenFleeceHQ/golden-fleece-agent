# Base Sepolia Infrastructure Specification

## Network Profile

| Property | Value |
|----------|-------|
| Chain ID | 84532 |
| Block time | ~2 seconds |
| Gas cost | 0.005-0.01 gwei base fee (~$0.000005/tx) |
| Architecture | OP Stack L2 (mirrors Base mainnet) |

## DEX: Uniswap V3 (Primary)

Uniswap V3 is the only DEX with confirmed, robust deployment on Base Sepolia.

| Contract | Address |
|----------|---------|
| V3 Factory | `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24` |
| SwapRouter02 | `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4` |
| QuoterV2 | `0xC5290058841028F1614F3A6F0F5816cAd0df5E27` |
| Universal Router | `0x050E797f3625EC8785265e1d9BDd4799b97528A1` |

**Decision:** Use Universal Router as preferred entrypoint (Uniswap's recommendation). Keep SwapRouter02 paths as fallback.

Aerodrome and SushiSwap have no confirmed Base Sepolia deployments across sources.

## Key Token Addresses

| Token | Address |
|-------|---------|
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

**Primary pair:** WETH/USDC. Trade only 1-2 liquid pairs to reduce tail risk.

## Faucets

| Faucet | Amount | Frequency | Assets | Notes |
|--------|--------|-----------|--------|-------|
| **Coinbase CDP** | 0.1 ETH | 24h | ETH, USDC, EURC, cbBTC | Has programmatic API |
| **Alchemy** | Testnet ETH | 24h | ETH | Requires 0.001 mainnet ETH |
| **Chainlink** | Multi-asset | 24h | ETH + test tokens | https://faucets.chain.link/base-sepolia |
| **QuickNode** | Testnet ETH | 12h | ETH | |
| **Aave V3** | 10,000 tokens/tx | Unlimited | DAI, USDC, USDT, WBTC, WETH, LINK, AAVE | Built into contracts, mintable |

**Action:** Build a bootstrap script using Coinbase CDP Faucets API to provision wallets before demos.

## DeFi Yield Protocols

| Protocol | Address | Use Case |
|----------|---------|----------|
| **Aave V3** | Available on Base Sepolia | Lending, borrowing, flash loans |
| **Morpho Blue** | `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` | Isolated lending markets, superior capital efficiency |

Enable testnet mode on app.aave.com to access. Morpho routes to Aave V3 as fallback.

**Strategy:** Park idle stablecoins in Morpho/Aave for passive yield (targets "Best Yield/Portfolio Agent" track).

## Risk Router

**Status: Unclear.** Sources conflict:
- Claude research: "No pre-deployed Risk Router - teams build their own"
- Gemini research: "Hackathon-provided Risk Router with enforced limits"
- ChatGPT/Grok: "Unknown, confirm at hackathon"

**Decision:** Build a modular execution layer that can:
1. Submit TradeIntents to a hackathon-provided Risk Router (if one exists)
2. Deploy our own Risk Router contract (if teams must build their own)
3. Interact directly with Uniswap (fallback)

**Day-1 action:** Watch both ERC-8004 workshops to clarify the Risk Router interface, address, and whether a "Hackathon Capital Vault" is provided.

## RPC Providers

| Provider | Free Tier | Recommendation |
|----------|-----------|----------------|
| **Alchemy** | 300M compute units/month | Primary |
| **Coinbase CDP** | Native Base + 0.25 ETH gas credits | Secondary |
| **Ankr** | `rpc.ankr.com/base_sepolia` | Fallback |
| **Public** | `https://sepolia.base.org` | Emergency fallback |

## Subgraphs & Indexing

The Graph supports Base Sepolia with Uniswap V3 subgraphs. Use for:
- Pool state queries (liquidity, fee tiers)
- Swap history
- Dashboard charts

Always maintain an RPC fallback for when subgraph indexing lags.

## Resources

- Base ecosystem contracts: https://docs.base.org/base-chain/network-information/ecosystem-contracts
- Base faucets: https://docs.base.org/base-chain/tools/network-faucets
- Uniswap Base deployments: https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments
- Coinbase CDP faucet API: https://docs.cdp.coinbase.com/faucets/introduction/quickstart
- Aave V3 testnet: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
- Morpho addresses: https://docs.morpho.org/get-started/resources/addresses/
