'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Trophy, Hourglass, Award } from 'lucide-react';
import { TokenIcon } from '@token-icons/react';
import Image from 'next/image';
import {
  Button,
  Card,
  CardContent,
} from '@/shared/ui';
import { HODLOCK_ABI } from '@/shared/config/abi';
import { TOKEN_INFO } from '@/shared/config/contracts';
import { formatAmount, formatDaysRemaining, formatDate, cn } from '@/shared/lib/utils';

interface DepositInfo {
  amount: bigint;
  originalAmount: bigint;
  share: bigint;
  rewardDebt: bigint;
  depositTimestamp: bigint;
  unlockTimestamp: bigint;
  penaltyBps: bigint;
  withdrawn: boolean;
}

interface DepositWithMeta extends DepositInfo {
  depositId: number;
  tokenSymbol: string;
  hodlockAddress: Address;
  hasNFT: boolean;
}

export function WithdrawList() {
  const { address, isConnected } = useAccount();
  const [deposits, setDeposits] = useState<DepositWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const fetchDeposits = useCallback(async () => {
    if (!address || !publicClient) return;

    setLoading(true);
    const allDeposits: DepositWithMeta[] = [];

    for (const [symbol, info] of Object.entries(TOKEN_INFO)) {
      try {
        const count = await publicClient.readContract({
          address: info.hodlockAddress,
          abi: HODLOCK_ABI,
          functionName: 'getDepositCount',
          args: [address as Address],
        }) as bigint;

        for (let i = 0; i < Number(count); i++) {
          try {
            const deposit = await publicClient.readContract({
              address: info.hodlockAddress,
              abi: HODLOCK_ABI,
              functionName: 'userDeposits',
              args: [address as Address, BigInt(i)],
            }) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];

            if (!deposit[7]) {
              // 查询该存单是否已铸造 NFT
              const hasNFT = await publicClient.readContract({
                address: info.hodlockAddress,
                abi: HODLOCK_ABI,
                functionName: 'hasNFT',
                args: [address as Address, BigInt(i)],
              }) as boolean;

              allDeposits.push({
                amount: deposit[0],
                originalAmount: deposit[1],
                share: deposit[2],
                rewardDebt: deposit[3],
                depositTimestamp: deposit[4],
                unlockTimestamp: deposit[5],
                penaltyBps: deposit[6],
                withdrawn: deposit[7],
                depositId: i,
                tokenSymbol: symbol,
                hodlockAddress: info.hodlockAddress,
                hasNFT,
              });
            }
          } catch (e) {
            console.error(`Error fetching deposit ${i} for ${symbol}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error fetching deposit count for ${symbol}:`, e);
      }
    }

    setDeposits(allDeposits);
    setLoading(false);
  }, [address, publicClient]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  useEffect(() => {
    if (isSuccess) {
      fetchDeposits();
    }
  }, [isSuccess, fetchDeposits]);

  const handleWithdraw = (hodlockAddress: Address, depositId: number) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'withdraw',
      args: [BigInt(depositId)],
    });
  };

  const handleEarlyWithdraw = (hodlockAddress: Address, depositId: number) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'withdrawEarly',
      args: [BigInt(depositId)],
    });
  };

  const handleMintNFT = (hodlockAddress: Address, depositId: number) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'mintNFT',
      args: [BigInt(depositId)],
    });
  };

  if (!isConnected) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to view your deposits</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <p className="text-gray-600">Loading your deposits...</p>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Hourglass className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deposits Found</h3>
          <p className="text-gray-600">You don&apos;t have any active deposits yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {deposits.map((deposit, index) => {
        const tokenInfo = TOKEN_INFO[deposit.tokenSymbol];
        const now = Math.floor(Date.now() / 1000);
        const isUnlocked = now >= Number(deposit.unlockTimestamp);
        const canEarlyWithdraw = Number(deposit.penaltyBps) < 10000;

        return (
          <motion.div
            key={`${deposit.hodlockAddress}-${deposit.depositId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              'overflow-hidden',
              isUnlocked && 'border-green-200 bg-green-50/30'
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {deposit.tokenSymbol === 'wstETH' ? (
                      <Image src="/resource/wstETH.svg" alt="wstETH" width={40} height={40} />
                    ) : deposit.tokenSymbol === 'cbBTC' ? (
                      <Image src="/resource/cbBTC.svg" alt="cbBTC" width={40} height={40} />
                    ) : (
                      <TokenIcon
                        symbol={deposit.tokenSymbol}
                        size={40}
                        variant="branded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {formatAmount(deposit.amount, tokenInfo.decimals)} {deposit.tokenSymbol}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Deposited {formatDate(Number(deposit.depositTimestamp))}
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    isUnlocked
                      ? 'bg-green-100 text-green-700'
                      : 'bg-pink-100 text-pink-700'
                  )}>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDaysRemaining(Number(deposit.unlockTimestamp))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Unlock Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(Number(deposit.unlockTimestamp))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Penalty Rate</p>
                    <p className="font-medium text-gray-900">
                      {Number(deposit.penaltyBps) / 100}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isUnlocked ? (
                    <Button
                      className="flex-1"
                      onClick={() => handleWithdraw(deposit.hodlockAddress, deposit.depositId)}
                      disabled={isPending || isConfirming}
                    >
                      Withdraw
                    </Button>
                  ) : canEarlyWithdraw ? (
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => handleEarlyWithdraw(deposit.hodlockAddress, deposit.depositId)}
                      disabled={isPending || isConfirming}
                    >
                      Early Withdraw ({Number(deposit.penaltyBps) / 100}% penalty)
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled
                    >
                      Cannot Withdraw Early
                    </Button>
                  )}

                  {deposit.hasNFT ? (
                    <Button
                      variant="outline"
                      disabled
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      NFT Minted
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleMintNFT(deposit.hodlockAddress, deposit.depositId)}
                      disabled={isPending || isConfirming}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Mint NFT
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
