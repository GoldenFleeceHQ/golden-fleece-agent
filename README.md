# Golden Fleece

AI trading agent for the [ERC-8004 Hackathon](https://lablab.ai/ai-hackathons/ai-trading-agents-erc-8004) (March 9-22, 2026). Registers on-chain identity, executes risk-adjusted trades on Base Sepolia, and produces verifiable validation artifacts — all through the ERC-8004 trust layer.

**Stack:** Python (agent) · TypeScript (on-chain + dashboard) · Solidity (contracts) · Claude API (reasoning)

## Git Workflow

All work happens on `dev`. Never commit directly to `main`.

```
1. git checkout dev
2. git add <files>
3. git commit -m "descriptive message"
4. git push origin dev
5. Open a PR: dev -> main
6. Merge after review
```

### Branch Setup

```bash
git checkout -b dev
git push -u origin dev
```

## Project Structure

```
apps/agent/        # Python - AI trading agent
apps/dashboard/    # Next.js - real-time dashboard
contracts/         # Foundry - Solidity contracts
docs/              # Research & implementation specs
scripts/           # Bootstrap, registration, deployment
```

## License

MIT
