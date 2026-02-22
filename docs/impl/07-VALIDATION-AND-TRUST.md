# Validation & Trust Model Specification

## Philosophy

The agent is not "an AI that trades." It is a **verifiable on-chain track record generator**. Anyone can reproduce our Sharpe and drawdown numbers from the artifacts + chain. This is the core differentiator.

## Validation Artifact Structure

Every trade produces an **Epoch Artifact** — a structured, reproducible evidence bundle uploaded to IPFS.

### Bundle Contents

```
epoch-{timestamp}/
├── bundle.manifest.json    # Root manifest with all hashes
├── decision.json           # Inputs + features + portfolio state + thresholds
├── intent.json             # EIP-712 typed trade intent, nonce, deadline, slippage caps
├── risk.json               # Circuit breaker state, drawdown check, max position check
├── execution.json          # Tx hash, decoded calldata, receipt, gas, realized slippage
└── posttrade.json          # PnL, risk metrics, attribution
```

### bundle.manifest.json

```json
{
  "version": "1.0",
  "agentId": 123,
  "agentRegistry": "eip155:84532:0x8004A818BFB912233c491871b3d84c89A494BD9e",
  "epoch": "2026-03-15T14:30:00Z",
  "model": "claude-sonnet-4-6",
  "codeDigest": "<git-commit-hash>",
  "artifacts": {
    "decision": { "file": "decision.json", "hash": "<keccak256>" },
    "intent": { "file": "intent.json", "hash": "<keccak256>" },
    "risk": { "file": "risk.json", "hash": "<keccak256>" },
    "execution": { "file": "execution.json", "hash": "<keccak256>" },
    "posttrade": { "file": "posttrade.json", "hash": "<keccak256>" }
  },
  "bundleHash": "<keccak256 of manifest bytes>",
  "replayRecipe": "To verify: download artifacts, recompute hashes, check tx on Base Sepolia, recalculate metrics"
}
```

### decision.json

```json
{
  "timestamp": "2026-03-15T14:30:00Z",
  "marketSnapshot": {
    "source": "geckoterminal",
    "pair": "WETH/USDC",
    "price": 3450.25,
    "ohlcv_hash": "<keccak256 of raw OHLCV data>",
    "regime": "trending",
    "adx": 28.5,
    "bb_width": 0.045
  },
  "sentimentSnapshot": {
    "source": "cryptopanic",
    "fear_greed_index": 62,
    "headline_summary_hash": "<keccak256>"
  },
  "portfolioState": {
    "total_value_usd": 10250.00,
    "available_capital": 3200.00,
    "open_positions": [{"token": "WETH", "amount": "0.5", "entry_price": 3400.00}],
    "current_drawdown": 0.02,
    "daily_pnl": 0.8
  },
  "reasoning": {
    "summary": "Trending regime detected (ADX 28.5). WETH showing momentum with bullish news sentiment.",
    "reasoning_hash": "<keccak256 of full Claude reasoning output>"
  },
  "kelly": {
    "win_probability": 0.62,
    "win_loss_ratio": 1.8,
    "fractional_kelly": 0.25,
    "calculated_size": 0.068,
    "capped_size": 0.068
  }
}
```

## On-Chain Flow

```
1. Create epoch artifact bundle
2. Upload to IPFS via Pinata -> get CID (requestURI = "ipfs://<CID>")
3. requestHash = keccak256(bundle.manifest.json bytes)
4. Call validationRequest(validatorAddress, agentId, requestURI, requestHash)
5. Validator fetches IPFS payload, verifies hashes + math
6. Validator calls validationResponse(requestHash, 1, responseURI, responseHash, "trade")
```

## Storage: IPFS via Pinata

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **IPFS (Pinata)** | Selected | Content-addressed, spec-recommended, CID = implicit hash |
| Arweave | For critical evidence only | Permanent but costs money |
| On-chain | Hashes only | Full data too expensive |
| Centralized + hash | Acceptable fallback | If IPFS fails, use HTTPS + keccak256 on-chain |

Pinata has ERC-8004-specific integration. Filecoin pinning provides daily PDP proofs for persistent availability.

## Logging Frequency

| Event | Log? | Rationale |
|-------|------|-----------|
| Every trade | **Yes** — full epoch artifact | Core audit trail |
| Circuit breaker trigger | **Yes** — risk artifact | Proves risk discipline |
| Daily performance rollup | **Yes** — summary artifact | Enables reputation scoring |
| Monitoring cycle (no action) | **Batch daily** | Avoid on-chain spam |
| Regime change | **Yes** | Shows adaptive behavior |

On Base Sepolia (L2), gas is near-zero, so per-trade validation is feasible.

## Validator Agent (Separate Identity)

To demonstrate genuine trustlessness, deploy a **separate Validator Agent**:

- Distinct ERC-721 identity (separate wallet)
- Fetches the trading agent's IPFS artifact
- Independently verifies: hashes match, txs exist on-chain, PnL math checks out
- Submits `validationResponse` and `giveFeedback`

This avoids the self-feedback restriction on the Reputation Registry.

### Reputation Feedback Tags

| tag1 | tag2 | Value | When |
|------|------|-------|------|
| `tradingYield` | `day` | Daily return % | End of each day |
| `tradingYield` | `week` | Weekly return % | End of each week |
| `sharpeRatio` | `week` | Rolling Sharpe | End of each week |
| `maxDrawdown` | `day` | Worst daily drawdown | End of each day |
| `successRate` | `week` | Win rate % | End of each week |

## Dashboard Integration

The dashboard should let any third party:
1. Download the manifest for any epoch
2. Verify all hashes match
3. Confirm all txs exist on Base Sepolia
4. Recompute PnL from the raw data

Add a **"Verify" button** next to each trade that runs this check client-side.

## Key Risks

- Validation Registry interface may change during hackathon
- Self-validation pattern is philosophically weak — separate validator is essential
- IPFS content can be garbage-collected if unpinned — ensure Pinata plan covers the period
- If hackathon provides a canonical validator set or required tags, we must conform

## Resources

- Pinata IPFS: https://www.pinata.cloud/
- Filecoin Pin for ERC-8004: https://docs.filecoin.io/builder-cookbook/filecoin-pin/erc-8004-agent-registration
- ERC-8004 reputation best practices: https://github.com/erc-8004/best-practices/blob/main/Reputation.md
- Phala TEE Agent (validation example): https://github.com/Phala-Network/erc-8004-tee-agent
