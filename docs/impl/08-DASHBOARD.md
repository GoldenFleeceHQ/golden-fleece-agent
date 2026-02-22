# Dashboard & Presentation Specification

## Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | **Next.js 15** | Fast to build, SSR for SEO-irrelevant but good DX |
| Styling | **Tailwind CSS + shadcn/ui** | 65k+ GitHub stars, pre-built dark theme components |
| Candlestick chart | **TradingView Lightweight Charts** | 45KB, 350k+ weekly npm downloads, native markers |
| Secondary charts | **Recharts (via shadcn/ui)** | `npx shadcn-ui@latest add chart` for pre-styled components |
| Real-time comm | **WebSocket (FastAPI native)** | Full-duplex, native FastAPI support, low latency |
| Theme | **Dark trading palette** | bg: `#0a0a0f`, surface: `#1a1a2e`, green: `#26a69a`, red: `#ef5350` |

## Layout Sections

### 1. Performance Panel (Top Row)

KPI cards with sparklines:

| Metric | Display |
|--------|---------|
| Total PnL | Dollar amount + % + sparkline |
| Sharpe Ratio | Current rolling value + trend |
| Max Drawdown | Current + worst historical |
| Win Rate | % with trade count |
| Current Regime | Badge (trending/ranging/volatile) |
| Agent Status | Mode badge (normal/safe/paused) |

### 2. Main Chart (Center)

TradingView Lightweight Charts showing:
- OHLCV candlesticks from GeckoTerminal/on-chain data
- **Buy markers** (green arrows) at trade entry points
- **Sell markers** (red arrows) at trade exit points
- Overlay: Bollinger Bands, SMA lines
- Second pane: Volume bars

```typescript
// TradingView Lightweight Charts in Next.js
import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('../components/TradingChart'), { ssr: false })
```

### 3. Decision Reasoning Panel (Right Side) — KEY DIFFERENTIATOR

This is what makes the demo memorable. Show Claude's reasoning for each trade:

```
[14:30] ANALYZE — Trending regime (ADX 28.5)
        "WETH showing momentum continuation. Bullish news
         sentiment (F&G 62). Donchian breakout confirmed."

[14:31] DECIDE — BUY 0.15 WETH @ $3,450
        Kelly: 6.8% | Regime: trending | Confidence: 72%

[14:31] RISK CHECK — APPROVED
        Drawdown: 2.0% (limit 10%) | Daily loss: 0.3% (limit 5%)
        Slippage est: 0.4% (limit 2%)

[14:32] EXECUTE — tx: 0x1a2b...3c4d ✓
        Filled @ $3,451.20 | Slippage: 0.03%
```

### 4. Risk Controls Panel (Left Sidebar)

- Current mode: Normal / Safe / Paused (large badge)
- Circuit breakers: list with green/red status indicators
- Exposure by token: horizontal bar chart
- Kelly fraction used: gauge
- Drawdown meter: visual fill to max threshold

### 5. ERC-8004 Trust Panel (Bottom)

- Agent ID + Registry string
- Token URI link (to IPFS registration JSON)
- Agent Wallet address
- Recent reputation events (tag, value, timestamp)
- Recent validation requests/responses (hash, status)
- **"Verify" button** per trade — downloads manifest, verifies hashes client-side

### 6. Trade History Table

Sortable table with columns:
- Timestamp, Pair, Side, Size, Entry Price, Exit Price, PnL, Slippage, Validation Hash (linked to IPFS)

Use shadcn/ui Table + TanStack Table for sorting/filtering.

## Real-Time Communication

### FastAPI WebSocket Backend

```python
from fastapi import FastAPI, WebSocket
import json

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def broadcast(self, message_type: str, data: dict):
        msg = json.dumps({"type": message_type, "data": data})
        for conn in self.connections:
            await conn.send_text(msg)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    manager.connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep alive
    except:
        manager.connections.remove(websocket)
```

### Message Types

| Type | Payload | Frequency |
|------|---------|-----------|
| `price_update` | Latest price + OHLCV candle | Every 15s |
| `trade_executed` | Trade details + tx hash | Per trade |
| `signal_generated` | Regime + signal strength | Per analysis cycle |
| `metrics_update` | PnL, Sharpe, drawdown | After each trade |
| `reasoning_update` | Claude's reasoning text | Per decision |
| `risk_alert` | Circuit breaker status change | On change |

### Frontend Throttling

```typescript
// Throttle React re-renders to 5fps to prevent jank
const throttledUpdate = useRef(
  throttle((data) => setState(data), 200)
)
```

## Demo-Day Resilience

- **Polling fallback:** If WebSocket drops, auto-switch to HTTP polling every 5s
- **Pre-recorded demo video:** Always have a backup recording
- **Optimistic UI:** Show updates from Python backend state immediately, reconcile with on-chain data once confirmed
- **Static fallback data:** If APIs fail during demo, show cached historical data

## Reference Projects

- CoinPulse: https://github.com/adrianhajdin/coinpulse (layout inspiration)
- shadcn admin template: https://github.com/satnaing/shadcn-admin
- TradingView Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- shadcn/ui: https://ui.shadcn.com/
- FastAPI WebSocket: https://fastapi.tiangolo.com/advanced/websockets/
