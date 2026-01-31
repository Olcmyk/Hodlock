"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Copy, Check, Users, Gift } from "lucide-react";
import { Button, Card } from "@/shared/ui";
import { ALL_HODLOCKS, HODLOCK_TO_TOKEN } from "@/shared/config/contracts";
import { generateReferralLink, formatAmount } from "@/shared/lib/utils";
import { useReferrerRewards, useClaimReferrerRewards } from "./hooks";

export function InvitePanel() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  // Get rewards from all Hodlock contracts
  const { data: cbbtcRewards } = useReferrerRewards(ALL_HODLOCKS[0], address);
  const { data: wstethRewards } = useReferrerRewards(ALL_HODLOCKS[1], address);
  const { data: usdcRewards } = useReferrerRewards(ALL_HODLOCKS[2], address);

  const { claimReferrerRewards: claimCbbtc, isPending: isPendingCbbtc, isConfirming: isConfirmingCbbtc } = useClaimReferrerRewards(ALL_HODLOCKS[0]);
  const { claimReferrerRewards: claimWsteth, isPending: isPendingWsteth, isConfirming: isConfirmingWsteth } = useClaimReferrerRewards(ALL_HODLOCKS[1]);
  const { claimReferrerRewards: claimUsdc, isPending: isPendingUsdc, isConfirming: isConfirmingUsdc } = useClaimReferrerRewards(ALL_HODLOCKS[2]);

  const referralLink = address ? generateReferralLink(address) : "";

  const handleCopy = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rewards = [
    {
      hodlock: ALL_HODLOCKS[0],
      token: HODLOCK_TO_TOKEN[ALL_HODLOCKS[0].toLowerCase()],
      amount: cbbtcRewards,
      claim: claimCbbtc,
      isPending: isPendingCbbtc,
      isConfirming: isConfirmingCbbtc,
    },
    {
      hodlock: ALL_HODLOCKS[1],
      token: HODLOCK_TO_TOKEN[ALL_HODLOCKS[1].toLowerCase()],
      amount: wstethRewards,
      claim: claimWsteth,
      isPending: isPendingWsteth,
      isConfirming: isConfirmingWsteth,
    },
    {
      hodlock: ALL_HODLOCKS[2],
      token: HODLOCK_TO_TOKEN[ALL_HODLOCKS[2].toLowerCase()],
      amount: usdcRewards,
      claim: claimUsdc,
      isPending: isPendingUsdc,
      isConfirming: isConfirmingUsdc,
    },
  ];

  if (!isConnected) {
    return (
      <Card variant="glass" className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-500">
          Connect your wallet to view your referral link and rewards
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <Card variant="gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Referral Link</h3>
            <p className="text-sm text-gray-500">Share to earn rewards</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-gray-200 overflow-hidden">
            <p className="text-sm text-gray-600 truncate">{referralLink}</p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          When someone uses your link to deposit, you become their permanent referrer
          and earn a share of their early withdrawal penalties.
        </p>
      </Card>

      {/* Referrer Rewards */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Referral Rewards</h3>
            <p className="text-sm text-gray-500">Earned from your referrals</p>
          </div>
        </div>

        <div className="space-y-3">
          {rewards.map((reward) => {
            const hasReward = reward.amount && reward.amount > BigInt(0);
            const isLoading = reward.isPending || reward.isConfirming;

            return (
              <div
                key={reward.hodlock}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {reward.token?.symbol || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reward.amount
                      ? formatAmount(reward.amount, reward.token?.decimals || 18)
                      : "0"}{" "}
                    available
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={!hasReward || isLoading}
                  isLoading={isLoading}
                  onClick={() => reward.claim()}
                >
                  Claim
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
