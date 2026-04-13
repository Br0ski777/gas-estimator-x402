import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "gas-estimator",
  slug: "gas-estimator",
  description: "Multi-chain gas prices in one call -- ETH, Base, Polygon, Arbitrum, BSC. Compare chains to find cheapest.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/estimate",
      price: "$0.002",
      description: "Get gas price estimates across multiple EVM chains with USD cost",
      toolName: "crypto_estimate_gas",
      toolDescription: `Use this when you need to compare gas prices across multiple EVM chains at once. Returns multi-chain gas estimates in JSON.

1. chains: array of chain gas data with chain name
2. low: gas price in gwei for slow confirmation
3. medium: gas price in gwei for standard confirmation
4. high: gas price in gwei for fast confirmation
5. transferCostUsd: estimated USD cost for a simple transfer on each chain
6. cheapestChain: which chain currently has the lowest gas cost

Example output: {"chains":[{"chain":"base","low":0.005,"medium":0.008,"high":0.012,"transferCostUsd":0.01},{"chain":"ethereum","low":12.5,"medium":18.0,"high":25.0,"transferCostUsd":0.85}],"cheapestChain":"base"}

Use this FOR choosing the cheapest chain before a cross-chain transaction. Essential for multi-chain agents that need to optimize gas costs.

Do NOT use for single-chain gas only -- use gas_get_current_price instead. Do NOT use for swap quotes -- use dex_get_swap_quote instead. Do NOT use for bridging -- use bridge_find_best_route instead.`,
      inputSchema: {
        type: "object",
        properties: {
          chain: { type: "string", description: "Chain name: ethereum, base, polygon, arbitrum, bsc. Omit for all chains." },
        },
        required: [],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "estimates": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "chain": {
                    "type": "string"
                  },
                  "gasPrice": {
                    "type": "string"
                  },
                  "estimatedCostUsd": {
                    "type": "number"
                  }
                }
              }
            },
            "timestamp": {
              "type": "string"
            }
          },
          "required": [
            "estimates"
          ]
        },
    },
  ],
};
