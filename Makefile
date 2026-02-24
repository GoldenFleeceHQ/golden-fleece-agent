.PHONY: dev agent dashboard test test-agent test-contracts test-fork lint fmt install clean bootstrap register deploy

# Development
dev:
	@echo "Starting agent and dashboard..."
	$(MAKE) agent & $(MAKE) dashboard & wait

agent:
	cd apps/agent && uv run uvicorn trading_agent.server:app --host 0.0.0.0 --port 8000 --reload

dashboard:
	cd apps/dashboard && pnpm dev

# Testing
test: test-agent test-contracts

test-agent:
	cd apps/agent && uv run pytest -v

test-contracts:
	cd contracts && forge test --no-match-path "test/fork/*"

test-fork:
	cd contracts && forge test --match-path "test/fork/*" --fork-url $(BASE_SEPOLIA_RPC)

# Code quality
lint:
	cd apps/agent && uv run ruff check .
	cd apps/dashboard && pnpm lint

fmt:
	cd apps/agent && uv run ruff format .
	cd apps/agent && uv run ruff check --fix .

# Setup
install:
	cd apps/agent && uv sync
	pnpm install
	cd contracts && forge build

clean:
	rm -rf node_modules apps/dashboard/node_modules apps/dashboard/.next
	rm -rf packages/shared/node_modules scripts/node_modules
	rm -rf apps/agent/.venv
	rm -rf contracts/cache contracts/out

bootstrap:
	bash scripts/bootstrap.sh

# On-chain
register:
	pnpm --filter scripts tsx register-agent.ts

deploy:
	cd contracts && forge script script/Deploy.s.sol --rpc-url $(BASE_SEPOLIA_RPC) --broadcast
