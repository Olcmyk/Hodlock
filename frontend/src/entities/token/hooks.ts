"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HODLOCK_FACTORY_ABI } from "@/shared/contracts/abis";
import { CONTRACTS } from "@/shared/config/contracts";

export function useGetHodlock(tokenAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.HODLOCK_FACTORY,
    abi: HODLOCK_FACTORY_ABI,
    functionName: "getHodlock",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });
}

export function useCanCreateHodlock(tokenAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.HODLOCK_FACTORY,
    abi: HODLOCK_FACTORY_ABI,
    functionName: "canCreateHodlock",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });
}

export function useAllHodlocksLength() {
  return useReadContract({
    address: CONTRACTS.HODLOCK_FACTORY,
    abi: HODLOCK_FACTORY_ABI,
    functionName: "allHodlocksLength",
  });
}

export function useAllHodlocks(index: bigint) {
  return useReadContract({
    address: CONTRACTS.HODLOCK_FACTORY,
    abi: HODLOCK_FACTORY_ABI,
    functionName: "allHodlocks",
    args: [index],
  });
}

export function useCreateHodlock() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createHodlock = async (tokenAddress: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.HODLOCK_FACTORY,
      abi: HODLOCK_FACTORY_ABI,
      functionName: "createHodlock",
      args: [tokenAddress],
    });
  };

  return {
    createHodlock,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
