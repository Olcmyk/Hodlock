"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HODLOCK_ABI, ERC20_ABI } from "@/shared/contracts/abis";
import { parseUnits } from "viem";

export interface DepositInfo {
  amount: bigint;
  originalAmount: bigint;
  share: bigint;
  rewardDebt: bigint;
  depositTimestamp: bigint;
  unlockTimestamp: bigint;
  penaltyBps: bigint;
  withdrawn: boolean;
}

export function useDeposit(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (
    amount: bigint,
    lockSeconds: bigint,
    penaltyBps: bigint,
    referrer: `0x${string}`
  ) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "deposit",
      args: [amount, lockSeconds, penaltyBps, referrer],
    });
  };

  return {
    deposit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useApprove(tokenAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useAllowance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}` | undefined,
  spender: `0x${string}`
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner,
    },
  });
}

export function useTokenBalance(
  tokenAddress: `0x${string}`,
  account: `0x${string}` | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: {
      enabled: !!account,
    },
  });
}

export function useTokenDecimals(tokenAddress: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });
}

export function useTokenSymbol(tokenAddress: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
  });
}

export function useDepositCount(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "getDepositCount",
    args: user ? [user] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useUserDeposit(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined,
  depositId: bigint
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "userDeposits",
    args: user ? [user, depositId] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function usePendingReward(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined,
  depositId: bigint
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "pendingReward",
    args: user ? [user, depositId] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useHasNFT(
  hodlockAddress: `0x${string}`,
  user: `0x${string}` | undefined,
  depositId: bigint
) {
  return useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: "hasNFT",
    args: user ? [user, depositId] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useWithdraw(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async (depositId: bigint) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "withdraw",
      args: [depositId],
    });
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useWithdrawEarly(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawEarly = async (depositId: bigint) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "withdrawEarly",
      args: [depositId],
    });
  };

  return {
    withdrawEarly,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useClaimReward(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimReward = async (depositId: bigint) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "claimReward",
      args: [depositId],
    });
  };

  return {
    claimReward,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useMintNFT(hodlockAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintNFT = async (depositId: bigint) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: "mintNFT",
      args: [depositId],
    });
  };

  return {
    mintNFT,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
