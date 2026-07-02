# Gas Estimator API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://gas-estimator.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Multi-chain gas prices in one call -- ETH, Base, Polygon, Arbitrum, BSC. Compare chains to find cheapest. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "gas-estimator": {
      "url": "https://gas-estimator.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://gas-estimator.api.klymax402.com/api/estimate" \
  -H "Content-Type: application/json" \
  -d '{}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `crypto_estimate_gas` | POST | `/api/estimate` | $0.002 | Get gas price estimates across multiple EVM chains with USD cost |

### `crypto_estimate_gas`

Use this when you need to compare gas prices across multiple EVM chains at once. Returns multi-chain gas estimates in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `chain` | string | no | Chain name: ethereum, base, polygon, arbitrum, bsc. Omit for all chains. |

**Returns**

- `chains` -- array of chain gas data with chain name
- `low` -- gas price in gwei for slow confirmation
- `medium` -- gas price in gwei for standard confirmation
- `high` -- gas price in gwei for fast confirmation
- `transferCostUsd` -- estimated USD cost for a simple transfer on each chain
- `cheapestChain` -- which chain currently has the lowest gas cost

Example response:

```json
{"chains":[{"chain":"base","low":0.005,"medium":0.008,"high":0.012,"transferCostUsd":0.01},{"chain":"ethereum","low":12.5,"medium":18.0,"high":25.0,"transferCostUsd":0.85}],"cheapestChain":"base"}
```

**When to use**: choosing the cheapest chain before a cross-chain transaction. Essential for multi-chain agents that need to optimize gas costs.

**Not for**: swap quotes (use `dex_get_swap_quote`), bridging (use `bridge_find_best_route`).

## Example agent prompts

- "Compare gas prices across multiple EVM chains at once"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
