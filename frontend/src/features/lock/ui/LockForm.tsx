'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, Address, maxUint256 } from 'viem';
import { Info, ArrowLeftRight, ChevronDown, Search, Plus, AlertCircle } from 'lucide-react';
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
  TokenIcon,
} from '@/shared/ui';
import { HODLOCK_ABI, ERC20_ABI, FACTORY_ABI } from '@/shared/config/abi';
import { CONTRACTS, CREATE_HODLOCK_FEE } from '@/shared/config/contracts';
import { isTokenWhitelisted } from '@/shared/config/whitelist';
import { useAllHodlocks } from '@/shared/hooks';
import { formatAmount, calculateUnlockDate, cn } from '@/shared/lib/utils';
import { getReferrer } from '@/shared/components/ReferralCapture';
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

// Transaction flow steps
type TransactionStep = 'idle' | 'approving' | 'depositing' | 'minting' | 'done';

export function LockForm() {
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState(365);
  const [customLockDays, setCustomLockDays] = useState('');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(3);
  const [penaltyBps, setPenaltyBps] = useState(2000);
  const [customPenalty, setCustomPenalty] = useState('');
  const [selectedPenaltyOption, setSelectedPenaltyOption] = useState(1);
  const [mintNFT, setMintNFT] = useState(true);
  const [neverWithdrawEarly, setNeverWithdrawEarly] = useState(false);
  const [showSwapWidget, setShowSwapWidget] = useState(false);
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [createContractError, setCreateContractError] = useState('');

  // Transaction flow state
  const [txStep, setTxStep] = useState<TransactionStep>('idle');
  const [depositCountBefore, setDepositCountBefore] = useState<bigint | null>(null);
  const [startedWithApproval, setStartedWithApproval] = useState(false);

  const { writeContract, data: hash, isPending, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Use dynamically fetched Hodlock list
  const { tokens, tokenList, isLoading: isLoadingTokens, refetch } = useAllHodlocks();

  const tokenInfo = tokens[selectedToken];
  const hodlockAddress = tokenInfo?.hodlockAddress;
  const tokenAddress = tokenInfo?.tokenAddress;

  // Set default selected token
  useEffect(() => {
    if (tokenList.length > 0 && !selectedToken) {
      setSelectedToken(tokenList[0].symbol);
    }
  }, [tokenList, selectedToken]);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam && tokens[tokenParam]) {
      setSelectedToken(tokenParam);
    }
  }, [searchParams, tokens]);

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    query: { enabled: !!address && !!tokenAddress },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && hodlockAddress ? [address as Address, hodlockAddress] : undefined,
    query: { enabled: !!address && !!tokenAddress && !!hodlockAddress },
  });

  // Get user's current deposit count (for calculating new deposit's depositId)
  const { data: depositCount, refetch: refetchDepositCount } = useReadContract({
    address: hodlockAddress,
    abi: HODLOCK_ABI,
    functionName: 'getDepositCount',
    args: address ? [address as Address] : undefined,
    query: { enabled: !!address && !!hodlockAddress },
  });

  const [referrer, setReferrer] = useState('0x0000000000000000000000000000000000000000');

  useEffect(() => {
    // First check URL params, then fall back to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      setReferrer(ref);
    } else {
      setReferrer(getReferrer());
    }
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

  // Handle transaction flow
  const handleSubmit = async () => {
    if (!hodlockAddress || !amountInWei || !tokenAddress) return;

    // Record current deposit count (for getting new deposit's depositId later)
    if (depositCount !== undefined) {
      setDepositCountBefore(depositCount);
    }

    // Record whether approval is needed at start
    setStartedWithApproval(needsApproval);

    if (needsApproval) {
      // Need to approve first
      setTxStep('approving');
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [hodlockAddress, maxUint256],
      });
    } else {
      // No approval needed, deposit directly
      setTxStep('depositing');
      const lockSeconds = BigInt(actualLockDays * 86400);
      writeContract({
        address: hodlockAddress,
        abi: HODLOCK_ABI,
        functionName: 'deposit',
        args: [amountInWei, lockSeconds, BigInt(actualPenaltyBps), referrer as Address],
      });
    }
  };

  // Watch for transaction success, execute next step
  useEffect(() => {
    if (!isSuccess) return;

    const executeNextStep = async () => {
      if (txStep === 'approving') {
        // Approve success, refresh allowance and execute deposit
        await refetchAllowance();
        resetWrite();
        setTxStep('depositing');
        const lockSeconds = BigInt(actualLockDays * 86400);
        writeContract({
          address: hodlockAddress!,
          abi: HODLOCK_ABI,
          functionName: 'deposit',
          args: [amountInWei, lockSeconds, BigInt(actualPenaltyBps), referrer as Address],
        });
      } else if (txStep === 'depositing') {
        // Deposit success
        if (mintNFT) {
          // Need to mint NFT
          await refetchDepositCount();
          resetWrite();
          setTxStep('minting');
          // New deposit's depositId is the previous deposit count (since index starts from 0)
          const newDepositId = depositCountBefore ?? 0n;
          writeContract({
            address: hodlockAddress!,
            abi: HODLOCK_ABI,
            functionName: 'mintNFT',
            args: [newDepositId],
          });
        } else {
          // No NFT minting needed, flow complete
          setTxStep('done');
          setAmount('');
        }
      } else if (txStep === 'minting') {
        // Mint NFT success, flow complete
        setTxStep('done');
        setAmount('');
      }
    };

    executeNextStep();
  }, [isSuccess, txStep]);

  // Reset state when user changes input
  useEffect(() => {
    if (txStep === 'done') {
      setTxStep('idle');
      setDepositCountBefore(null);
      setStartedWithApproval(false);
    }
  }, [amount, selectedToken]);

  const handleMaxClick = () => {
    if (balance && tokenInfo) {
      setAmount(formatUnits(balance, tokenInfo.decimals));
    }
  };

  const filteredTokens = tokenList.filter((info) =>
    info.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    info.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateContract = () => {
    if (!newTokenAddress) return;

    // Validate token address is in whitelist
    if (!isTokenWhitelisted(newTokenAddress)) {
      setCreateContractError('This token is not in the whitelist. Only Base chain top 500 tokens by market cap are supported.');
      return;
    }

    setCreateContractError('');
    writeContract({
      address: CONTRACTS.HodlockFactory,
      abi: FACTORY_ABI,
      functionName: 'createHodlock',
      args: [newTokenAddress as Address],
      value: parseUnits(String(CREATE_HODLOCK_FEE), 18),
    });
  };

  // Refresh list after contract creation success
  useEffect(() => {
    if (isSuccess && txStep === 'idle') {
      refetch();
      setShowCreateContract(false);
      setNewTokenAddress('');
    }
  }, [isSuccess, refetch, txStep]);

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
                {tokenInfo ? (
                  <>
                    <TokenIcon symbol={selectedToken} size={32} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedToken}</p>
                      <p className="text-sm text-gray-500">{tokenInfo?.name}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">
                    {isLoadingTokens ? 'Loading tokens...' : 'Select a token'}
                  </p>
                )}
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
                  className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 font-medium px-2 py-1 rounded-md transition-colors"
                >
                  Max: {balance && tokenInfo ? formatAmount(balance, tokenInfo.decimals) : '0'} {selectedToken}
                </button>
                <button
                  onClick={() => setShowSwapWidget(true)}
                  className="flex items-center gap-1 text-pink-500 hover:text-pink-600 hover:bg-pink-50 font-medium px-2 py-1 rounded-md transition-colors"
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
            onClick={handleSubmit}
            disabled={isPending || isConfirming || !amount || amountInWei === 0n || (txStep !== 'idle' && txStep !== 'done')}
          >
            {txStep === 'approving'
              ? mintNFT ? 'Step 1/3: Approving...' : 'Step 1/2: Approving...'
              : txStep === 'depositing'
              ? startedWithApproval
                ? mintNFT ? 'Step 2/3: Depositing...' : 'Step 2/2: Depositing...'
                : mintNFT ? 'Step 1/2: Depositing...' : 'Depositing...'
              : txStep === 'minting'
              ? startedWithApproval ? 'Step 3/3: Minting NFT...' : 'Step 2/2: Minting NFT...'
              : txStep === 'done'
              ? 'Success!'
              : needsApproval
              ? mintNFT ? 'Approve & Deposit & Mint NFT' : 'Approve & Deposit'
              : mintNFT ? 'Deposit & Mint NFT' : 'Deposit'}
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
              {isLoadingTokens ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading tokens...</p>
                </div>
              ) : filteredTokens.length > 0 ? (
                filteredTokens.map((info) => (
                  <button
                    key={info.symbol}
                    onClick={() => {
                      setSelectedToken(info.symbol);
                      setShowTokenSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <TokenIcon symbol={info.symbol} size={32} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{info.symbol}</p>
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
      <Dialog open={showCreateContract} onOpenChange={(open) => {
        setShowCreateContract(open);
        if (!open) {
          setCreateContractError('');
          setNewTokenAddress('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hodlock Contract</DialogTitle>
            <DialogDescription>
              Enter the token address to create a new Hodlock contract for it.
              Only Base chain top 500 tokens by market cap are supported.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Fee Required</p>
                  <p>Creating a new Hodlock contract requires a fee of <span className="font-bold">{CREATE_HODLOCK_FEE} ETH</span>.</p>
                </div>
              </div>
            </div>
            <Input
              placeholder="Token address (0x...)"
              value={newTokenAddress}
              onChange={(e) => {
                setNewTokenAddress(e.target.value);
                setCreateContractError('');
              }}
            />
            {createContractError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{createContractError}</p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleCreateContract}
              disabled={!newTokenAddress || isPending}
            >
              {isPending ? 'Creating...' : `Create Contract (${CREATE_HODLOCK_FEE} ETH)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Widget Dialog */}
      <Dialog open={showSwapWidget} onOpenChange={setShowSwapWidget}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Swap Tokens</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SwapWidget toToken={tokenAddress} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
