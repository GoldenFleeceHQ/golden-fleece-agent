# Signing & Wallet Specification

## Chain ID

Base Sepolia: **84532**. Must appear in every EIP-712 domain separator and transaction. Prevents cross-chain replay (Base mainnet is 8453).

## EIP-712: Trade Intent Signing

### Domain Separator

```typescript
const domain = {
  name: "GoldenFleeceTradeIntent",
  version: "1",
  chainId: 84532,
  verifyingContract: RISK_ROUTER_ADDRESS // TBD from hackathon
}
```

### TradeIntent Type

```typescript
const types = {
  TradeIntent: [
    { name: "agentId", type: "uint256" },
    { name: "tokenIn", type: "address" },
    { name: "tokenOut", type: "address" },
    { name: "amountIn", type: "uint256" },
    { name: "minAmountOut", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "maxSlippageBps", type: "uint16" },
    { name: "validationHash", type: "bytes32" }
  ]
}
```

**Note:** The exact schema depends on the hackathon Risk Router ABI. Adapt fields once revealed in workshops.

### Libraries

| Language | Library | Function |
|----------|---------|----------|
| **Python** | `eth-account` (v0.13.7+) | `Account.sign_typed_data()` |
| **TypeScript** | `viem` | `walletClient.signTypedData()` |
| **On-chain** | OpenZeppelin `EIP712.sol` + `ECDSA.sol` | Signature verification |

Always include `deadline` and `nonce` in every intent for replay protection.

## EIP-1271: Smart Contract Wallet

### Strategy: Start EOA, Upgrade if Time Permits

| Phase | Wallet | Justification |
|-------|--------|---------------|
| **Day 1-8** | Plain EOA | Zero setup, works immediately with eth-account/viem |
| **Day 9+** | ZeroDev Kernel (optional) | Session keys, gas sponsorship, ERC-4337 |

### Why Not Gnosis Safe?

- ~258k gas to deploy (overkill for single-agent)
- Multi-sig overhead unnecessary for autonomous agent
- ZeroDev Kernel is more gas-efficient for AA use cases

### If Implementing ZeroDev Kernel

- Confirmed deployed on Base Sepolia
- Supports EIP-1271, ERC-4337, session keys
- Session keys enable autonomous trading without per-tx signing
- Gas sponsorship via Paymaster abstracts gas management
- SDK: https://docs.zerodev.app/

### Agent Wallet Architecture

```
NFT Owner (cold key) -- owns --> ERC-721 Agent Identity
                     -- sets --> agentWallet (hot execution key)

agentWallet (hot key) -- signs --> TradeIntents (EIP-712)
                      -- submits --> trades via Risk Router
```

ERC-8004's `setAgentWallet` requires the new wallet to prove control via EIP-712 (EOA) or EIP-1271 (smart contract). The agentWallet is cleared on NFT transfer.

## Key Risks

- Cross-language signature compatibility (Python signing <-> Solidity verification) must be tested early
- The `eth-account` library hasn't undergone external audit for EIP-712
- Without the Risk Router ABI, the exact domain separator can't be finalized
- EIP-1271 nonce tracking bugs can cause signature replay vulnerabilities

## Resources

- eth-account: https://eth-account.readthedocs.io/
- viem signTypedData: https://viem.sh/docs/actions/wallet/signTypedData
- OpenZeppelin EIP712: https://docs.openzeppelin.com/contracts/5.x/api/utils#EIP712
- ZeroDev: https://docs.zerodev.app/
- eip712-structs (Python): https://pypi.org/project/eip712-structs/
