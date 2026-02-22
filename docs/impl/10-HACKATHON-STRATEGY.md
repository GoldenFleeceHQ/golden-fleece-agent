# Hackathon Strategy Specification

## Target Prizes

Target **three overlapping prize tracks** simultaneously:

| Prize | Amount | Why We're a Fit |
|-------|--------|-----------------|
| **Best Trustless Trading Agent** | $10K + capital program | Core project — deep ERC-8004, risk-adjusted returns |
| **Best Compliance & Risk Guardrails** | $2.5K | Hard-coded circuit breakers, deterministic risk checks |
| **Best Validation & Trust Model** | $2.5K | Per-trade IPFS artifacts, separate validator agent |

## Winning Narrative

**"Golden Fleece: Autonomous Fund Manager with Verifiable Track Record"**

The agent builds its own auditable on-chain resume via ERC-8004 reputation. Any investor can verify performance before allocating capital. Positioned for the Surge Trading Capital Program.

**Do NOT pitch it as:** "an AI that trades"
**Pitch it as:** "a verifiable on-chain track record generator — the first institutional-grade AI trader on ERC-8004"

## Judging Criteria (from hackathon page)

1. **Technology application** — ERC-8004 integration depth (highest weight)
2. **Presentation** — Video demo quality, dashboard polish
3. **Business value** — Path to real-world use
4. **Originality** — Unique approach

## Key Judges

- **Pawel Czech** — CEO of Surge AND connected to lablab.ai. Alignment with Surge's business goals matters.
- **Davide Crapis** — Ethereum Foundation, co-author of ERC-8004. Will scrutinize architectural purity. Philosophy: minimal on-chain footprint, complex analytics off-chain.

**Implication:** Build to reflect Crapis's design philosophy — hashes on-chain, full evidence on IPFS.

## Submission Requirements

| Requirement | Notes |
|-------------|-------|
| Project title + descriptions | Clear, professional |
| Cover image | Polished design |
| **Video presentation** | **Critical** — judges evaluate presentation quality |
| **Slide deck** | Required alongside video |
| Public GitHub repo | **MIT License required** |
| Demo application URL | Live dashboard preferred |
| X/Twitter post | Tag **@lablabai** and **@Surgexyz_** with demo video |
| Moltbook updates | Regular progress updates during hackathon |

**Warning:** Failure to tag correctly on X or maintain Moltbook updates = **automatic disqualification**.

## 13-Day Execution Timeline

### Phase 1: Foundation (Days 1-3)

- [ ] Attend both ERC-8004 workshops (Day 1)
- [ ] Clarify: Risk Router address/ABI, Hackathon Capital Vault, validator requirements
- [ ] Set up monorepo (pnpm + uv + Foundry)
- [ ] Deploy to Vercel + Railway
- [ ] Register agent on ERC-8004 Identity Registry
- [ ] Build data pipeline (Chainlink + GeckoTerminal + CryptoPanic)
- [ ] Implement basic agent loop (monitor → analyze → decide)
- [ ] First Moltbook update

### Phase 2: Core Trading (Days 4-7)

- [ ] Implement trading strategy (regime detection + Kelly sizing)
- [ ] Build circuit breakers (all 5 deterministic rules)
- [ ] Implement EIP-712 trade intent signing
- [ ] Connect to Risk Router (or deploy our own)
- [ ] Execute first testnet trade
- [ ] Build validation artifact pipeline (IPFS + on-chain)
- [ ] Deploy validator agent (separate identity)
- [ ] Moltbook updates

### Phase 3: Dashboard + Polish (Days 8-10)

- [ ] Build dashboard: TradingChart, ReasoningPanel, RiskControls, TrustPanel
- [ ] WebSocket real-time updates
- [ ] Verify button (client-side artifact verification)
- [ ] ERC-8004 trust panel (agentId, reputation, validations)
- [ ] Performance metrics display
- [ ] End-to-end integration testing
- [ ] Moltbook updates

### Phase 4: Presentation (Days 11-13)

- [ ] Record demo video (2-3 minutes)
  - Hook: 30s on the problem of opaque AI trading
  - Live demo: 2 min showing real-time dashboard
  - Technical: 30s on ERC-8004 depth
  - Vision: 30s on Trading Capital Program readiness
- [ ] Create slide deck
- [ ] Pre-recorded backup demo video
- [ ] Post on X with @lablabai @Surgexyz_ tags
- [ ] Final Moltbook update
- [ ] Submit on lablab.ai

## Standout Features

1. **Replay mode button:** Download manifest, replay metrics, green check if matching
2. **Explainable risk:** Every trade shows *which constraint bound* (slippage, drawdown, Kelly)
3. **Decision reasoning timeline:** Real-time Claude reasoning visible on dashboard
4. **Multi-dimensional reputation:** Rich tag taxonomy, not a single score
5. **Separate validator agent:** Genuine trustlessness, not self-validation

## Key Competitive Insights

- Past lablab.ai winners emphasize **polish and narrative** over technical complexity
- Working prototype with live demo >> broken ambitious project
- ERC-8004 ecosystem is barely 4 months old on mainnet — deep integration stands out
- Conservative risk management beats aggressive returns for this judging criteria
- Document architecture thoroughly (judges value enterprise scalability narrative)

## Pre-Hackathon Checklist

- [ ] Register on lablab.ai
- [ ] Join Discord (https://discord.gg/lablabai)
- [ ] Set up GitHub repo (MIT license)
- [ ] Ensure wallet has mainnet ETH (for Alchemy faucet qualification)
- [ ] Verify Anthropic API tier and budget
- [ ] Prepare KYC documents (ID, proof of address) for prize collection
- [ ] Review Surge terms of service
- [ ] Pre-build repo structure and basic configs (allowed before hackathon starts)

## Resources

- Hackathon page: https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004
- Discord: https://discord.gg/lablabai
- Surge: https://surge.xyz/
- Submission guidelines: https://lablab.ai/delivering-your-hackathon-solution
- lablab.ai past winners: https://lablab.ai/event
