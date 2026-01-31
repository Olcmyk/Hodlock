// Contract addresses on Base Mainnet (chainId: 8453)

// Hodlock Protocol Contracts
export const CONTRACTS = {
  // NFT Contracts
  HODLOCK_NFT: "0x964Bc978543069b586e91A0F81AD149f4C3d171f" as const,
  HODLOCK_NFT_RENDERER: "0xC70d22a74D9914b69ec9e0360F4009Cdd0C28BE2" as const,

  // Factory
  HODLOCK_FACTORY: "0x895101d717D8C56E1dd2b4B55fd03dC90D1b9c63" as const,

  // Hodlock Pools
  CBBTC_HODLOCK: "0xA87b00C356F4a75acB6dbA7350f9f6Ee7E3bc27C" as const,
  WSTETH_HODLOCK: "0xD0AcE4e0fe99810dD2329CF12191B319DB9A0B11" as const,
  USDC_HODLOCK: "0x5f3Bf28f8e3797b37B01C610e5F3dA2F18C39145" as const,
} as const;

// Token addresses on Base Mainnet
export const TOKENS = {
  CBBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf" as const,
  WSTETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452" as const,
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
} as const;

export const CHAIN_ID = 8453; // Base Mainnet

// Featured tokens for the home page and lock page
export const FEATURED_TOKENS = [
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    address: TOKENS.CBBTC,
    hodlockAddress: CONTRACTS.CBBTC_HODLOCK,
    decimals: 8,
    icon: "btc",
  },
  {
    symbol: "wstETH",
    name: "Wrapped Staked ETH",
    address: TOKENS.WSTETH,
    hodlockAddress: CONTRACTS.WSTETH_HODLOCK,
    decimals: 18,
    icon: "steth",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: TOKENS.USDC,
    hodlockAddress: CONTRACTS.USDC_HODLOCK,
    decimals: 6,
    icon: "usdc",
  },
] as const;

// Token address to Hodlock address mapping
export const TOKEN_TO_HODLOCK: Record<string, `0x${string}`> = {
  [TOKENS.CBBTC.toLowerCase()]: CONTRACTS.CBBTC_HODLOCK,
  [TOKENS.WSTETH.toLowerCase()]: CONTRACTS.WSTETH_HODLOCK,
  [TOKENS.USDC.toLowerCase()]: CONTRACTS.USDC_HODLOCK,
};

// Hodlock address to token info mapping
export const HODLOCK_TO_TOKEN: Record<string, typeof FEATURED_TOKENS[number]> = {
  [CONTRACTS.CBBTC_HODLOCK.toLowerCase()]: FEATURED_TOKENS[0],
  [CONTRACTS.WSTETH_HODLOCK.toLowerCase()]: FEATURED_TOKENS[1],
  [CONTRACTS.USDC_HODLOCK.toLowerCase()]: FEATURED_TOKENS[2],
};

// All Hodlock addresses for querying user deposits
export const ALL_HODLOCKS = [
  CONTRACTS.CBBTC_HODLOCK,
  CONTRACTS.WSTETH_HODLOCK,
  CONTRACTS.USDC_HODLOCK,
] as const;
