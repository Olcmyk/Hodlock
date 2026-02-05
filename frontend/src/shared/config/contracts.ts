import { Address } from 'viem';

export const CONTRACTS = {
  HodlockNFT: '0x174763ee3575a61a9587Adc02C53c1Ac7BD657C6' as Address,
  HodlockNFTRender: '0xc3E6330Be8dc7493b2907A45992dEed41fF9Ea23' as Address,
  HodlockFactory: '0xb0294707A2f3dAaA44137D10B44736a893FACF65' as Address,
} as const;

export const HODLOCK_CONTRACTS = {
  cbBTC: '0x2c0bb20849aA526c728cEf6AAb5F08C1e4254b63' as Address,
  weETH: '0x6E900EFeA6c6f1DB0cEBF27b3e6eD83700b12F3d' as Address,
  USDC: '0x927e09F327568759B5AF0F21f4ca65DDe2afD1fA' as Address,
} as const;

export const TOKEN_ADDRESSES = {
  cbBTC: '0xCbb7C0000Ab88B473b1f5aFd9ef808440Eed33bF' as Address,
  weETH: '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a' as Address,
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
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
  weETH: {
    symbol: 'weETH',
    name: 'Wrapped eETH',
    decimals: 18,
    hodlockAddress: HODLOCK_CONTRACTS.weETH,
    tokenAddress: TOKEN_ADDRESSES.weETH,
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
