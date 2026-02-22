# ERC-8004 Integration Specification

## Status

ERC-8004 is formally **Draft** but deployed on Ethereum mainnet (Jan 29, 2026) with 21,500+ agents registered. The spec is stable for Identity and Reputation; the **Validation Registry is under active revision** (TEE/zkML community input pending).

## Contract Addresses (Base Sepolia)

| Registry | Address | Status |
|----------|---------|--------|
| **Identity** | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | Confirmed by all sources |
| **Reputation** | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | Confirmed by all sources |
| **Validation** | Varies across sources | **Verify on explorer Day 1** |

All contracts are **upgradeable UUPS proxies** with vanity `0x8004` prefix. Always interact with the proxy address, never the implementation.

**Day-1 action:** Read `name()`/`symbol()` on each address at startup to verify correctness. Also check the ChaosChain reference implementation addresses as fallback:
- Identity: `0x7177a6867296406881E20d6647232314736Dd09A`
- Reputation: `0xB5048e3ef1DA4E04deB6f7d0423D06F63869e322`
- Validation: `0x662b40A526cb4017d947e71eAF6753BF3eeE66d8`

## SDKs

| SDK | Language | Use For |
|-----|----------|---------|
| **Agent0 SDK** (`sdk.ag0.xyz`) | Python + TS | Official, by spec authors. Primary choice. |
| **erc-8004-py** | Python | Lightweight Python bindings |
| **erc-8004-js** | TypeScript | Convenience wrappers for registry calls |
| **ChaosChain SDK** | Both | Reference implementation with deployed contracts |

**Decision:** Use Agent0 SDK as primary. Fall back to direct viem calls for anything the SDK doesn't cover.

## Registration Flow

```
1. Call register() on Identity Registry -> mints ERC-721, returns agentId
2. Build registration JSON (schema: eip-8004#registration-v1)
3. Upload JSON to IPFS via Pinata -> get ipfs://CID
4. Call setAgentURI(agentId, "ipfs://CID")
5. Optionally: publish /.well-known/agent-registration.json on dashboard domain
```

### Registration JSON Structure

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Golden Fleece",
  "description": "Risk-adjusted AI trading agent with verifiable decision trail",
  "active": true,
  "services": [{
    "name": "trading",
    "endpoint": "https://<dashboard-url>",
    "version": "1.0",
    "skills": ["market-analysis", "trade-execution", "risk-management"],
    "domains": ["defi", "trading"]
  }],
  "supportedTrust": ["reputation", "crypto-economic"],
  "registrations": [{
    "agentId": "<agentId>",
    "agentRegistry": "eip155:84532:0x8004A818BFB912233c491871b3d84c89A494BD9e"
  }]
}
```

## Reputation Flow

**Critical constraint:** The Reputation Registry **prevents self-feedback**. The agent owner cannot post its own performance scores.

**Solution:** Deploy a separate "scorer" address that:
1. Watches on-chain trade outcomes
2. Computes performance metrics (PnL, Sharpe, drawdown)
3. Calls `giveFeedback(agentId, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash)`

### Tag Taxonomy (from best-practices repo)

| tag1 | tag2 | Description |
|------|------|-------------|
| `tradingYield` | `day` / `week` | Periodic return signal |
| `sharpeRatio` | `week` | Risk-adjusted performance |
| `maxDrawdown` | `day` | Worst peak-to-trough |
| `successRate` | `week` | Win rate percentage |

Always include the artifact URI and hash in feedback so judges can verify independently.

## Validation Flow

```
1. Agent creates decision artifact (JSON with inputs, reasoning, outputs)
2. Upload artifact to IPFS -> get requestURI
3. Hash artifact bytes -> requestHash = keccak256(artifact)
4. Call validationRequest(validatorAddress, agentId, requestURI, requestHash)
5. Validator fetches artifact, verifies, calls validationResponse(requestHash, response, responseURI, responseHash, tag)
```

See `07-VALIDATION-AND-TRUST.md` for artifact structure details.

## Key Resources

- EIP Spec: https://eips.ethereum.org/EIPS/eip-8004
- Contracts: https://github.com/erc-8004/erc-8004-contracts
- Best Practices: https://github.com/erc-8004/best-practices
- Pinata Quickstart: https://docs.pinata.cloud/tools/erc-8004/quickstart
- Agent0 SDK: https://sdk.ag0.xyz/
- ChaosChain RI: https://github.com/ChaosChain/trustless-agents-erc-ri
- Explorer: https://8004agents.ai
