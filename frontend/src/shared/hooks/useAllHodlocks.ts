'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { Address } from 'viem';
import { FACTORY_ABI, HODLOCK_ABI, ERC20_ABI } from '@/shared/config/abi';
import { CONTRACTS } from '@/shared/config/contracts';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  hodlockAddress: Address;
  tokenAddress: Address;
}

export interface UseAllHodlocksResult {
  tokens: Record<string, TokenInfo>;
  tokenList: TokenInfo[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useAllHodlocks(): UseAllHodlocksResult {
  // 1. 获取 Hodlock 合约总数
  const { data: hodlocksLength, refetch: refetchLength } = useReadContract({
    address: CONTRACTS.HodlockFactory,
    abi: FACTORY_ABI,
    functionName: 'allHodlocksLength',
  });

  const length = hodlocksLength ? Number(hodlocksLength) : 0;

  // 2. 获取所有 Hodlock 合约地址
  const hodlockAddressesResult = useReadContracts({
    contracts: Array.from({ length }, (_, i) => ({
      address: CONTRACTS.HodlockFactory,
      abi: FACTORY_ABI,
      functionName: 'allHodlocks',
      args: [BigInt(i)],
    })),
    query: { enabled: length > 0 },
  });

  const hodlockAddresses = (hodlockAddressesResult.data || [])
    .map((r) => r.result as Address | undefined)
    .filter((addr): addr is Address => !!addr);

  // 3. 获取每个 Hodlock 合约对应的 token 地址
  const tokenAddressesResult = useReadContracts({
    contracts: hodlockAddresses.map((addr) => ({
      address: addr,
      abi: HODLOCK_ABI,
      functionName: 'token',
    })),
    query: { enabled: hodlockAddresses.length > 0 },
  });

  const tokenAddresses = (tokenAddressesResult.data || [])
    .map((r) => r.result as Address | undefined)
    .filter((addr): addr is Address => !!addr);

  // 4. 获取每个 token 的 symbol, name, decimals
  const tokenInfoResult = useReadContracts({
    contracts: tokenAddresses.flatMap((addr) => [
      { address: addr, abi: ERC20_ABI, functionName: 'symbol' },
      { address: addr, abi: ERC20_ABI, functionName: 'name' },
      { address: addr, abi: ERC20_ABI, functionName: 'decimals' },
    ]),
    query: { enabled: tokenAddresses.length > 0 },
  });

  // 5. 组装结果
  const tokens: Record<string, TokenInfo> = {};
  const tokenList: TokenInfo[] = [];

  if (tokenInfoResult.data && tokenAddresses.length > 0) {
    for (let i = 0; i < tokenAddresses.length; i++) {
      const symbolResult = tokenInfoResult.data[i * 3];
      const nameResult = tokenInfoResult.data[i * 3 + 1];
      const decimalsResult = tokenInfoResult.data[i * 3 + 2];

      if (symbolResult?.result && nameResult?.result && decimalsResult?.result !== undefined) {
        const symbol = symbolResult.result as string;
        const name = nameResult.result as string;
        const decimals = Number(decimalsResult.result);

        const info: TokenInfo = {
          symbol,
          name,
          decimals,
          hodlockAddress: hodlockAddresses[i],
          tokenAddress: tokenAddresses[i],
        };

        tokens[symbol] = info;
        tokenList.push(info);
      }
    }
  }

  const isLoading =
    hodlockAddressesResult.isLoading ||
    tokenAddressesResult.isLoading ||
    tokenInfoResult.isLoading;

  const isError =
    hodlockAddressesResult.isError ||
    tokenAddressesResult.isError ||
    tokenInfoResult.isError;

  const refetch = () => {
    refetchLength();
    hodlockAddressesResult.refetch();
    tokenAddressesResult.refetch();
    tokenInfoResult.refetch();
  };

  return {
    tokens,
    tokenList,
    isLoading,
    isError,
    refetch,
  };
}
