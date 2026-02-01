'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, Address, maxUint256 } from 'viem';
import { motion } from 'framer-motion';
import { Info, ArrowLeftRight, ChevronDown, Search, Plus, AlertCircle } from 'lucide-react';
import { TokenIcon } from '@token-icons/react';
import Image from 'next/image';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui';
import { HODLOCK_ABI, ERC20_ABI, FACTORY_ABI } from '@/shared/config/abi';
import { TOKEN_INFO, CONTRACTS, HODLOCK_CONTRACTS } from '@/shared/config/contracts';
import { formatAmount, calculateUnlockDate, cn } from '@/shared/lib/utils';
import { SwapWidget } from '@/features/swap';

const LOCK_PERIODS = [
  { label: '1 Day', days: 1 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '365 Days', days: 365 },
  { label: 'Custom', days: 0 },
];

const PENALTY_OPTIONS = [
  { label: '10%', value: 1000 },
  { label: '20%', value: 2000 },
  { label: '40%', value: 4000 },
  { label: 'Custom', value: 0 },
];

export function LockForm() {
  const searchParams = useSearchParams();
  const { address, isConnected } = useAppKitAccount();
  const [selectedToken, setSelectedToken] = useState<string>('cbBTC');
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState(365);
  const [customLockDays, setCustomLockDays] = useState('');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(3);
  const [penaltyBps, setPenaltyBps] = useState(2000);
  const [customPenalty, setCustomPenalty] = useState('');
  const [selectedPenaltyOption, setSelectedPenaltyOption] = useState(1);
  const [mintNFT, setMintNFT] = useState(true);
  const [showPenaltyOptions, setShowPenaltyOptions] = useState(true);
  const [neverWithdrawEarly, setNeverWithdrawEarly] = useState(false);
  const [showSwapWidget, setShowSwapWidget] = useState(false);
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const tokenInfo = TOKEN_INFO[selectedToken];
  const hodlockAddress = tokenInfo?.hodlockAddress;
  const tokenAddress = tokenInfo?.tokenAddress;

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam && TOKEN_INFO[tokenParam]) {
      setSelectedToken(tokenParam);
    }
  }, [searchParams]);

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    query: { enabled: !!address && !!tokenAddress },
  });

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && hodlockAddress ? [address as Address, hodlockAddress] : undefined,
    query: { enabled: !!address && !!tokenAddress && !!hodlockAddress },
  });

  const referrer = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('ref') || '0x0000000000000000000000000000000000000000';
    }
    return '0x0000000000000000000000000000000000000000';
  }, []);

  const actualLockDays = selectedLockPeriod === 4 ? parseInt(customLockDays) || 0 : lockDays;
  const actualPenaltyBps = neverWithdrawEarly ? 10000 : (selectedPenaltyOption === 3 ? parseInt(customPenalty) * 100 || 500 : penaltyBps);

  const unlockDate = calculateUnlockDate(actualLockDays);

  const amountInWei = useMemo(() => {
    if (!amount || !tokenInfo) return 0n;
    try {
      return parseUnits(amount, tokenInfo.decimals);
    } catch {
      return 0n;
    }
  }, [amount, tokenInfo]);

  const needsApproval = allowance !== undefined && amountInWei > 0n && allowance < amountInWei;

  const handleApprove = () => {
    if (!tokenAddress || !hodlockAddress) return;
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [hodlockAddress, maxUint256],
    });
  };

  const handleDeposit = () => {
    if (!hodlockAddress || !amountInWei) return;
    const lockSeconds = BigInt(actualLockDays * 86400);
    writeContract({
      address: hodlockAddress,
      abi: HODLOCK_ABI,
      functionName: 'deposit',
      args: [amountInWei, lockSeconds, BigInt(actualPenaltyBps), referrer as Address],
    });
  };

  const handleMaxClick = () => {
    if (balance && tokenInfo) {
      setAmount(formatUnits(balance, tokenInfo.decimals));
    }
  };

  const filteredTokens = Object.entries(TOKEN_INFO).filter(([key, info]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    info.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateContract = () => {
    if (!newTokenAddress) return;
    writeContract({
      address: CONTRACTS.HodlockFactory,
      abi: FACTORY_ABI,
      functionName: 'createHodlock',
      args: [newTokenAddress as Address],
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
          <p className="text-gray-600">Please connect your wallet to start locking tokens</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Lock Your Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Select Token</Label>
            <button
              onClick={() => setShowTokenSearch(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-pink-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedToken === 'wstETH' ? (
                  <Image src="/resource/wstETH.svg" alt="wstETH" width={32} height={32} />
                ) : selectedToken === 'cbBTC' ? (
                  <Image src="/resource/cbBTC.svg" alt="cbBTC" width={32} height={32} />
                ) : (
                  <TokenIcon symbol={selectedToken} size={32} variant="branded" />
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedToken}</p>
                  <p className="text-sm text-gray-500">{tokenInfo?.name}</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount</Label>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={handleMaxClick}
                  className="text-pink-500 hover:text-pink-600 font-medium"
                >
                  Max: {balance && tokenInfo ? formatAmount(balance, tokenInfo.decimals) : '0'} {selectedToken}
                </button>
                <button
                  onClick={() => setShowSwapWidget(true)}
                  className="flex items-center gap-1 text-pink-500 hover:text-pink-600 font-medium"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  SWAP
                </button>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Lock Period */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Lock Period</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4">
                  <p className="font-medium mb-2">Lock longer for higher rewards</p>
                  <p className="text-xs text-gray-300">
                    Your share of rewards follows the formula: t²/(t+365 days).
                    Longer locks = higher share of penalty rewards.
                  </p>
                  <div className="mt-3 h-20 bg-gray-800 rounded flex items-end justify-around px-2 pb-2">
                    {[30, 90, 180, 365].map((d, i) => (
                      <div key={d} className="flex flex-col items-center">
                        <div
                          className="w-4 bg-pink-500 rounded-t"
                          style={{ height: `${(d * d / (d + 365)) / 3}px` }}
                        />
                        <span className="text-[10px] mt-1">{d}d</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {LOCK_PERIODS.map((period, index) => (
                <button
                  key={period.label}
                  onClick={() => {
                    setSelectedLockPeriod(index);
                    if (period.days > 0) setLockDays(period.days);
                  }}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                    selectedLockPeriod === index
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {selectedLockPeriod === 4 && (
              <Input
                type="number"
                placeholder="Enter days"
                value={customLockDays}
                onChange={(e) => setCustomLockDays(e.target.value)}
                className="mt-2"
              />
            )}
            {actualLockDays > 0 && (
              <p className="text-sm text-gray-500">
                Unlock date: {unlockDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Penalty Options */}
          {!neverWithdrawEarly && (
            <div className="space-y-2">
              <Label className="text-sm">
                Set early withdrawal penalty rate (does not affect your dividend amount)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {PENALTY_OPTIONS.map((option, index) => (
                  <button
                    key={option.label}
                    onClick={() => {
                      setSelectedPenaltyOption(index);
                      if (option.value > 0) setPenaltyBps(option.value);
                    }}
                    className={cn(
                      'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                      selectedPenaltyOption === index
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {selectedPenaltyOption === 3 && (
                <Input
                  type="number"
                  placeholder="5-99"
                  min={5}
                  max={99}
                  value={customPenalty}
                  onChange={(e) => setCustomPenalty(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          )}

          {/* Mint NFT Option */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="mintNFT"
              checked={mintNFT}
              onCheckedChange={(checked) => setMintNFT(checked as boolean)}
            />
            <Label htmlFor="mintNFT">Mint Honor NFT immediately</Label>
          </div>

          {/* Advanced Options */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Advanced Options
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="neverWithdraw"
                  checked={neverWithdrawEarly}
                  onCheckedChange={(checked) => setNeverWithdrawEarly(checked as boolean)}
                />
                <Label htmlFor="neverWithdraw" className="text-sm">
                  I confirm I will never withdraw early (100% penalty)
                </Label>
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={needsApproval ? handleApprove : handleDeposit}
            disabled={isPending || isConfirming || !amount || amountInWei === 0n}
          >
            {isPending || isConfirming
              ? 'Processing...'
              : needsApproval
              ? 'Approve & Deposit'
              : 'Deposit'}
          </Button>

          {/* Create Contract Link */}
          <button
            onClick={() => setShowCreateContract(true)}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
          >
            I can&apos;t find the token I want to deposit
          </button>
        </CardContent>
      </Card>

      {/* Token Search Dialog */}
      <Dialog open={showTokenSearch} onOpenChange={setShowTokenSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTokens.length > 0 ? (
                filteredTokens.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedToken(key);
                      setShowTokenSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {key === 'wstETH' ? (
                      <Image src="/resource/wstETH.svg" alt="wstETH" width={32} height={32} />
                    ) : key === 'cbBTC' ? (
                      <Image src="/resource/cbBTC.svg" alt="cbBTC" width={32} height={32} />
                    ) : (
                      <TokenIcon symbol={key} size={32} variant="branded" />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{key}</p>
                      <p className="text-sm text-gray-500">{info.name}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Token not found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTokenSearch(false);
                      setShowCreateContract(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract for This Token
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Contract Dialog */}
      <Dialog open={showCreateContract} onOpenChange={setShowCreateContract}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hodlock Contract</DialogTitle>
            <DialogDescription>
              Enter the token address to create a new Hodlock contract for it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Token address (0x...)"
              value={newTokenAddress}
              onChange={(e) => setNewTokenAddress(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleCreateContract}
              disabled={!newTokenAddress || isPending}
            >
              {isPending ? 'Creating...' : 'Create Contract'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Widget Dialog */}
      <Dialog open={showSwapWidget} onOpenChange={setShowSwapWidget}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Swap Tokens</DialogTitle>
          </DialogHeader>
          <SwapWidget toToken={tokenAddress} />
        </DialogContent>
      </Dialog>
    </>
  );
}
