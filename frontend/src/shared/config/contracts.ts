import { Address } from 'viem';

export const CONTRACTS = {
  HodlockNFT: '0x964Bc978543069b586e91A0F81AD149f4C3d171f' as Address,
  HodlockNFTRender: '0xC70d22a74D9914b69ec9e0360F4009Cdd0C28BE2' as Address,
  HodlockFactory: '0x895101d717D8C56E1dd2b4B55fd03dC90D1b9c63' as Address,
} as const;

export const HODLOCK_CONTRACTS = {
  cbBTC: '0xA87b00C356F4a75acB6dbA7350f9f6Ee7E3bc27C' as Address,
  wstETH: '0xD0AcE4e0fe99810dD2329CF12191B319DB9A0B11' as Address,
  USDC: '0x5f3Bf28f8e3797b37B01C610e5F3dA2F18C39145' as Address,
} as const;

export const TOKEN_ADDRESSES = {
  cbBTC: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' as Address,
  wstETH: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452' as Address,
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as Address,
} as const;

export const TOKEN_INFO: Record<string, {
  symbol: string;
  name: string;
  decimals: number;
  hodlockAddress: Address;
  tokenAddress: Address;
}> = {
  cbBTC: {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    hodlockAddress: HODLOCK_CONTRACTS.cbBTC,
    tokenAddress: TOKEN_ADDRESSES.cbBTC,
  },
  wstETH: {
    symbol: 'wstETH',
    name: 'Wrapped stETH',
    decimals: 18,
    hodlockAddress: HODLOCK_CONTRACTS.wstETH,
    tokenAddress: TOKEN_ADDRESSES.wstETH,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    hodlockAddress: HODLOCK_CONTRACTS.USDC,
    tokenAddress: TOKEN_ADDRESSES.USDC,
  },
};

export const BASE_CHAIN_ID = 8453;
