import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "gas-estimator",
  slug: "gas-estimator",
  description: "Multi-chain gas estimation — ETH, Base, Polygon, Arbitrum, BSC. Low/medium/high gwei + USD cost.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/estimate",
      price: "$0.002",
      description: "Get gas price estimates across multiple EVM chains with USD cost",
      toolName: "crypto_estimate_gas",
      toolDescription: "Use this when you need gas price estimates across multiple EVM chains. Optionally specify a single chain (ethereum, base, polygon, arbitrum, bsc) or get all chains at once. Returns low/medium/high gas prices in gwei and estimated transaction cost in USD for each chain. Useful for choosing the cheapest chain to transact on. Do NOT use for single-chain gas — use crypto_get_gas_price instead. Do NOT use for swap quotes — use dex_get_swap_quote instead.",
      inputSchema: {
        type: "object",
        properties: {
          chain: { type: "string", description: "Chain name: ethereum, base, polygon, arbitrum, bsc. Omit for all chains." },
        },
        required: [],
      },
    },
  ],
};
