"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Clock, Coins, Award, AlertTriangle } from "lucide-react";
import { Button, Card } from "@/shared/ui";
import { ALL_HODLOCKS, HODLOCK_TO_TOKEN } from "@/shared/config/contracts";
import { formatAmount, formatDaysRemaining, formatDate } from "@/shared/lib/utils";
import {
  useDepositCount,
  useUserDeposit,
  usePendingReward,
  useHasNFT,
  useWithdraw,
  useWithdrawEarly,
  useClaimReward,
  useMintNFT,
} from "@/features/lock/hooks";
import { TokenIcon } from "@web3icons/react";

interface DepositCardProps {
  hodlockAddress: `0x${string}`;
  depositId: number;
  userAddress: `0x${string}`;
  tokenInfo: {
    symbol: string;
    decimals: number;
    icon: string;
  };
}

function DepositCard({ hodlockAddress, depositId, userAddress, tokenInfo }: DepositCardProps) {
  const { data: deposit } = useUserDeposit(hodlockAddress, userAddress, BigInt(depositId));
  const { data: pendingReward } = usePendingReward(hodlockAddress, userAddress, BigInt(depositId));
  const { data: hasNFT } = useHasNFT(hodlockAddress, userAddress, BigInt(depositId));

  const { withdraw, isPending: isWithdrawing, isConfirming: isWithdrawConfirming } = useWithdraw(hodlockAddress);
  const { withdrawEarly, isPending: isWithdrawingEarly, isConfirming: isWithdrawEarlyConfirming } = useWithdrawEarly(hodlockAddress);
  const { claimReward, isPending: isClaiming, isConfirming: isClaimConfirming } = useClaimReward(hodlockAddress);
  const { mintNFT, isPending: isMinting, isConfirming: isMintConfirming } = useMintNFT(hodlockAddress);

  if (!deposit || deposit[7]) return null; // withdrawn

  const amount = deposit[0];
  const unlockTimestamp = Number(deposit[5]);
  const penaltyBps = Number(deposit[6]);
  const isUnlocked = Date.now() / 1000 >= unlockTimestamp;

  const handleWithdraw = async () => {
    if (isUnlocked) {
      await withdraw(BigInt(depositId));
    } else {
      await withdrawEarly(BigInt(depositId));
    }
  };

  const handleClaim = async () => {
    await claimReward(BigInt(depositId));
  };

  const handleMintNFT = async () => {
    await mintNFT(BigInt(depositId));
  };

  const isLoading =
    isWithdrawing ||
    isWithdrawConfirming ||
    isWithdrawingEarly ||
    isWithdrawEarlyConfirming ||
    isClaiming ||
    isClaimConfirming ||
    isMinting ||
    isMintConfirming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: depositId * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
              <TokenIcon symbol={tokenInfo.icon} variant="branded" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {tokenInfo.symbol} Deposit #{depositId + 1}
              </h3>
              <p className="text-sm text-gray-500">
                {isUnlocked ? "Unlocked" : formatDaysRemaining(unlockTimestamp)}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isUnlocked
                ? "bg-green-100 text-green-700"
                : "bg-primary-100 text-primary-700"
            }`}
          >
            {isUnlocked ? "Ready" : "Locked"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="font-semibold text-gray-900">
              {formatAmount(amount, tokenInfo.decimals)} {tokenInfo.symbol}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Pending Reward</p>
            <p className="font-semibold text-gray-900">
              {pendingReward ? formatAmount(pendingReward, tokenInfo.decimals) : "0"} {tokenInfo.symbol}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Unlock Date</p>
            <p className="font-semibold text-gray-900">{formatDate(unlockTimestamp)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Penalty Rate</p>
            <p className="font-semibold text-gray-900">{penaltyBps / 100}%</p>
          </div>
        </div>

        {!isUnlocked && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Early withdrawal will incur a {penaltyBps / 100}% penalty
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={isUnlocked ? "default" : "outline"}
            className="flex-1"
            onClick={handleWithdraw}
            isLoading={isWithdrawing || isWithdrawConfirming || isWithdrawingEarly || isWithdrawEarlyConfirming}
            disabled={isLoading}
          >
            {isUnlocked ? "Withdraw" : "Withdraw Early"}
          </Button>

          {pendingReward && pendingReward > BigInt(0) && (
            <Button
              variant="secondary"
              onClick={handleClaim}
              isLoading={isClaiming || isClaimConfirming}
              disabled={isLoading}
            >
              Claim
            </Button>
          )}

          {!hasNFT && (
            <Button
              variant="secondary"
              onClick={handleMintNFT}
              isLoading={isMinting || isMintConfirming}
              disabled={isLoading}
            >
              Mint NFT
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface PoolDepositsProps {
  hodlockAddress: `0x${string}`;
  userAddress: `0x${string}`;
  tokenInfo: {
    symbol: string;
    decimals: number;
    icon: string;
  };
}

function PoolDeposits({ hodlockAddress, userAddress, tokenInfo }: PoolDepositsProps) {
  const { data: depositCount } = useDepositCount(hodlockAddress, userAddress);
  const count = depositCount ? Number(depositCount) : 0;

  if (count === 0) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <DepositCard
          key={`${hodlockAddress}-${i}`}
          hodlockAddress={hodlockAddress}
          depositId={i}
          userAddress={userAddress}
          tokenInfo={tokenInfo}
        />
      ))}
    </>
  );
}

export function DepositList() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Card variant="glass" className="text-center py-12">
        <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-500">
          Connect your wallet to view your deposits
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ALL_HODLOCKS.map((hodlock) => {
        const tokenInfo = HODLOCK_TO_TOKEN[hodlock.toLowerCase()];
        if (!tokenInfo) return null;

        return (
          <PoolDeposits
            key={hodlock}
            hodlockAddress={hodlock}
            userAddress={address!}
            tokenInfo={{
              symbol: tokenInfo.symbol,
              decimals: tokenInfo.decimals,
              icon: tokenInfo.icon,
            }}
          />
        );
      })}
    </div>
  );
}
