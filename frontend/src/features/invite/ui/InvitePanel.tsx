'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { motion } from 'framer-motion';
import { Copy, Check, Gift, Users, AlertCircle, Coins } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TokenIcon,
} from '@/shared/ui';
import { HODLOCK_ABI } from '@/shared/config/abi';
import { useAllHodlocks } from '@/shared/hooks';
import { formatAmount, cn } from '@/shared/lib/utils';

export function InvitePanel() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // 使用动态获取的 Hodlock 列表
  const { tokenList, isLoading: isLoadingTokens } = useAllHodlocks();

  const referrerRewardsResults = useReadContracts({
    contracts: tokenList.map((info) => ({
      address: info.hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'referrerRewards',
      args: address ? [address as Address] : undefined,
    })),
    query: { enabled: !!address && tokenList.length > 0 },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && address) {
      setReferralLink(`${window.location.origin}/lock?ref=${address}`);
    }
  }, [address]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimRewards = (hodlockAddress: Address) => {
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'claimReferrerRewards',
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
          <p className="text-gray-600">Please connect your wallet to get your referral link</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="p-4 bg-pink-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <span className="font-medium text-gray-900">How it works</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 ml-8">
              <li>Share your link with friends</li>
              <li>When they deposit using your link, you become their referrer</li>
              <li>Earn 30% of their early withdrawal penalties forever</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Claimable Rewards Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-pink-500" />
            Claimable Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenList.map((info, index) => {
            const rewardResult = referrerRewardsResults.data?.[index];
            const reward = (rewardResult?.result as bigint) || 0n;
            const hasReward = reward > 0n;

            return (
              <motion.div
                key={info.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border',
                  hasReward ? 'border-pink-200 bg-pink-50/50' : 'border-gray-100 bg-gray-50/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={info.symbol} size={32} />
                  <div>
                    <p className="font-medium text-gray-900">{info.symbol}</p>
                    <p className="text-sm text-gray-500">
                      {formatAmount(reward, info.decimals)} available
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={!hasReward || isPending || isConfirming}
                  onClick={() => handleClaimRewards(info.hodlockAddress)}
                >
                  {isPending || isConfirming ? 'Claiming...' : 'Claim'}
                </Button>
              </motion.div>
            );
          })}

          {(referrerRewardsResults.isLoading || isLoadingTokens) && (
            <div className="text-center py-4">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading rewards...</p>
            </div>
          )}

          {!isLoadingTokens && tokenList.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No Hodlock contracts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
