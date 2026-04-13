import type { Hono } from "hono";

interface ChainConfig {
  name: string;
  rpc: string;
  nativeToken: string;
  ethPriceId: string; // coingecko id for native token
}

const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: "Ethereum",
    rpc: "https://cloudflare-eth.com",
    nativeToken: "ETH",
    ethPriceId: "ethereum",
  },
  base: {
    name: "Base",
    rpc: "https://mainnet.base.org",
    nativeToken: "ETH",
    ethPriceId: "ethereum",
  },
  polygon: {
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
    nativeToken: "MATIC",
    ethPriceId: "matic-network",
  },
  arbitrum: {
    name: "Arbitrum",
    rpc: "https://arb1.arbitrum.io/rpc",
    nativeToken: "ETH",
    ethPriceId: "ethereum",
  },
  bsc: {
    name: "BNB Smart Chain",
    rpc: "https://bsc-dataseed1.binance.org",
    nativeToken: "BNB",
    ethPriceId: "binancecoin",
  },
};

async function getGasPrice(rpc: string): Promise<bigint> {
  const resp = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1,
    }),
  });
  const data = await resp.json() as any;
  if (data.error) throw new Error(data.error.message);
  return BigInt(data.result);
}

async function getNativePrices(ids: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(ids)];
  try {
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${unique.join(",")}&vs_currencies=usd`);
    const data = await resp.json() as any;
    const prices: Record<string, number> = {};
    for (const id of unique) {
      prices[id] = data[id]?.usd || 0;
    }
    return prices;
  } catch {
    return {};
  }
}

function gweiFromWei(wei: bigint): number {
  return Number(wei) / 1e9;
}

function estimateCostUsd(gasPriceWei: bigint, gasLimit: number, nativePriceUsd: number): number {
  const costInNative = (Number(gasPriceWei) * gasLimit) / 1e18;
  return +(costInNative * nativePriceUsd).toFixed(6);
}

const STANDARD_GAS_LIMIT = 21000; // simple transfer

async function estimateChain(chainId: string, config: ChainConfig, nativePrices: Record<string, number>) {
  const gasPriceWei = await getGasPrice(config.rpc);
  const baseGwei = gweiFromWei(gasPriceWei);
  const nativePrice = nativePrices[config.ethPriceId] || 0;

  const low = gasPriceWei * 80n / 100n;
  const medium = gasPriceWei;
  const high = gasPriceWei * 130n / 100n;

  return {
    chain: chainId,
    name: config.name,
    nativeToken: config.nativeToken,
    nativePriceUsd: nativePrice,
    gasPrice: {
      low: +gweiFromWei(low).toFixed(4),
      medium: +gweiFromWei(medium).toFixed(4),
      high: +gweiFromWei(high).toFixed(4),
      unit: "gwei",
    },
    estimatedCost: {
      low: estimateCostUsd(low, STANDARD_GAS_LIMIT, nativePrice),
      medium: estimateCostUsd(medium, STANDARD_GAS_LIMIT, nativePrice),
      high: estimateCostUsd(high, STANDARD_GAS_LIMIT, nativePrice),
      gasLimit: STANDARD_GAS_LIMIT,
      unit: "USD",
    },
  };
}

export function registerRoutes(app: Hono) {
  app.post("/api/estimate", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const requestedChain = body?.chain?.toLowerCase()?.trim();

    try {
      let chainsToQuery: [string, ChainConfig][];

      if (requestedChain) {
        const config = CHAINS[requestedChain];
        if (!config) {
          return c.json({
            error: `Unknown chain: ${requestedChain}. Supported: ${Object.keys(CHAINS).join(", ")}`,
          }, 400);
        }
        chainsToQuery = [[requestedChain, config]];
      } else {
        chainsToQuery = Object.entries(CHAINS);
      }

      // Fetch native token prices
      const priceIds = chainsToQuery.map(([, c]) => c.ethPriceId);
      const nativePrices = await getNativePrices(priceIds);

      // Fetch gas prices in parallel
      const results = await Promise.allSettled(
        chainsToQuery.map(([id, config]) => estimateChain(id, config, nativePrices))
      );

      const estimates = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value);

      const errors = results
        .map((r, i) => r.status === "rejected" ? { chain: chainsToQuery[i][0], error: r.reason?.message } : null)
        .filter(Boolean);

      return c.json({
        estimates,
        ...(errors.length > 0 ? { errors } : {}),
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      return c.json({ error: `Gas estimation failed: ${e.message}` }, 500);
    }
  });
}
