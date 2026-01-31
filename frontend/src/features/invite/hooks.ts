"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HODLOCK_ABI } from "@/shared/contracts/abis";

export function useUserReferrer(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "userReferrer",
    args: user ? [user] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useReferrerRewards(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "referrerRewards",
    args: user ? [user] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useClaimReferrerRewards(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimReferrerRewards = async () => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "claimReferrerRewards",
      args: [],
    });
  };

  return {
    claimReferrerRewards,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
