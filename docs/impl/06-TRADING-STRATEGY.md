# Trading Strategy Specification

## Guiding Principle

**Judges reward risk-adjusted consistency over raw returns.** A Sharpe of 2.0 with 8% max drawdown wins over a Sharpe of 1.0 with 20% drawdown. Optimize for the scoring function, not maximum PnL.

## Portfolio Structure: Barbell Strategy

```
100% Sandbox Capital
├── 60-70% → Yield (Morpho Blue / Aave V3)
│            Continuous passive return, elevates Sharpe numerator
│            Low risk, always earning
│
└── 30-40% → Active Trading (via Risk Router)
             AI-directed momentum + mean-reversion
             Regime-aware position sizing
             Hard circuit breakers
```

This guarantees a baseline positive return even if active trading is flat.

## Position Sizing: Fractional Kelly Criterion

Full Kelly is dangerously aggressive in crypto (fat tails). Use **25% Kelly**:

```python
def fractional_kelly(win_prob: float, win_loss_ratio: float, fraction: float = 0.25) -> float:
    """
    Calculate fractional Kelly position size.

    win_prob: estimated probability of winning trade (0-1)
    win_loss_ratio: average win / average loss
    fraction: Kelly fraction (0.25 = quarter Kelly)
    """
    full_kelly = win_prob - (1 - win_prob) / win_loss_ratio
    kelly_size = max(0, full_kelly * fraction)
    return min(kelly_size, 0.20)  # Hard cap at 20% of portfolio
```

**Critical:** Claude proposes `win_prob` and `win_loss_ratio` as part of its trade analysis. The Kelly calculation is **deterministic Python** — the LLM does not control position size directly.

## Market Regime Detection

Use **ADX + Bollinger Band Width** (fastest to implement, most interpretable for judges):

| Regime | Detection Rule | Strategy |
|--------|---------------|----------|
| **Trending** | ADX > 25 | Momentum: Donchian breakout, trailing stops |
| **Ranging** | ADX < 20, narrow BB | Mean-reversion: z-score > 2 from 20-period SMA |
| **Volatile** | ADX < 20, wide BB | Defensive: reduce positions 50%, widen stops |
| **Unknown/Transition** | Mixed signals | Hold stable, await clarity |

```python
import pandas as pd
import numpy as np

def detect_regime(df: pd.DataFrame) -> str:
    """Detect market regime from OHLCV data."""
    # ADX calculation
    adx = calculate_adx(df, period=14)

    # Bollinger Band width
    sma = df['close'].rolling(20).mean()
    std = df['close'].rolling(20).std()
    bb_width = (2 * std) / sma  # Normalized width

    latest_adx = adx.iloc[-1]
    latest_bb = bb_width.iloc[-1]
    median_bb = bb_width.median()

    if latest_adx > 25:
        return "trending"
    elif latest_adx < 20 and latest_bb > median_bb * 1.5:
        return "volatile"
    elif latest_adx < 20:
        return "ranging"
    return "unknown"
```

## Circuit Breakers (Hard-Coded, Non-Negotiable)

These are **deterministic Python rules** that override all LLM decisions:

| Breaker | Threshold | Action |
|---------|-----------|--------|
| Daily loss limit | 4-5% of peak equity | Liquidate all volatile positions to USDC, halt for 12h |
| Max total drawdown | 10% from peak | Enter "safe mode" — hold USDC only |
| Consecutive losses | 3 losing trades | Mandatory 6h cooldown |
| Slippage ceiling | >2% expected slippage | Reject trade |
| Position concentration | >20% in single asset | Reject new buys of that asset |

```python
class CircuitBreaker:
    def __init__(self, max_daily_loss=0.05, max_total_drawdown=0.10, max_consec_losses=3):
        self.max_daily_loss = max_daily_loss
        self.max_total_drawdown = max_total_drawdown
        self.max_consec_losses = max_consec_losses
        self.consecutive_losses = 0
        self.peak_equity = 0
        self.daily_start_equity = 0

    def check(self, current_equity: float) -> tuple[bool, str]:
        """Returns (is_safe, reason). If not safe, trading must halt."""
        self.peak_equity = max(self.peak_equity, current_equity)

        # Daily loss
        daily_loss = (self.daily_start_equity - current_equity) / self.daily_start_equity
        if daily_loss > self.max_daily_loss:
            return False, f"daily_loss_{daily_loss:.2%}"

        # Total drawdown
        drawdown = (self.peak_equity - current_equity) / self.peak_equity
        if drawdown > self.max_total_drawdown:
            return False, f"max_drawdown_{drawdown:.2%}"

        # Consecutive losses
        if self.consecutive_losses >= self.max_consec_losses:
            return False, f"consecutive_losses_{self.consecutive_losses}"

        return True, "ok"
```

## Stop-Loss Strategy

| Strategy Type | Stop Method | Rationale |
|---------------|-------------|-----------|
| Momentum | ATR-based trailing (2-3x ATR) | Avoids whipsaw better than fixed % |
| Mean-reversion | **Time-based exit** (not stop-loss) | Mean-reversion expects temporary adverse moves |
| All | Hard portfolio-level circuit breakers | Overrides individual trade logic |

## Performance Metrics (computed and logged every cycle)

| Metric | Formula | Target |
|--------|---------|--------|
| Sharpe Ratio | `mean(excess_returns) / std(excess_returns) * sqrt(periods)` | > 1.5 |
| Sortino Ratio | Same as Sharpe but only downside deviation | > 2.0 |
| Max Drawdown | `max(peak - trough) / peak` | < 10% |
| Calmar Ratio | `annualized_return / max_drawdown` | > 1.0 |
| Win Rate | `winning_trades / total_trades` | > 55% |
| Average Slippage | `mean(expected_price - actual_price)` | < 1% |

## Backtesting

Use a **custom NumPy/Pandas vectorized backtester** (30 lines, fastest to build). VectorBT for parameter optimization if time permits. Avoid Zipline (painful setup) and Backtrader (slow).

**Important:** Testnet microstructure differs from mainnet. Backtest for **logic correctness and parameter sensitivity**, not for alpha prediction. Final tuning comes from live testnet rehearsal runs.

## Key Risks

- 13 days is too short for statistical significance in any metric
- Testnet liquidity is thin and erratic — pools can drain unpredictably
- Overfitting danger: strategies that look amazing in backtest may be pure luck
- Regime detection has lookback requirements — first few days will have poor signal quality
- If the Risk Router has its own position/leverage limits, they may override our Kelly sizing

## Resources

- VectorBT: https://vectorbt.dev/
- Freqtrade (strategy patterns): https://github.com/freqtrade/freqtrade
- Hummingbot (DEX execution patterns): https://github.com/hummingbot/hummingbot
- HMM regime detection: https://hmmlearn.readthedocs.io/
