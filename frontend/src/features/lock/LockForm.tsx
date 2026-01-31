"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Info, ArrowLeftRight } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Checkbox,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui";
import { FEATURED_TOKENS, TOKEN_TO_HODLOCK } from "@/shared/config/contracts";
import { calculateUnlockDate, parseReferrerFromUrl, formatAmount } from "@/shared/lib/utils";
import {
  useDeposit,
  useApprove,
  useAllowance,
  useTokenBalance,
  useTokenDecimals,
  useTokenSymbol,
} from "./hooks";
import { parseUnits } from "viem";
import { PenaltyCurveTooltip } from "./PenaltyCurveTooltip";
import { TokenSelector } from "./TokenSelector";
import { SwapDrawer } from "./SwapDrawer";
import { useGetHodlock, useCreateHodlock } from "@/entities/token/hooks";

const PENALTY_OPTIONS = [
  { value: "1000", label: "10%" },
  { value: "2000", label: "20%" },
  { value: "4000", label: "40%" },
  { value: "custom", label: "Custom" },
];

interface LockFormProps {
  initialTokenAddress?: string;
}

export function LockForm({ initialTokenAddress }: LockFormProps) {
  const { address, isConnected } = useAccount();

  // Token selection state
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(
    initialTokenAddress || null
  );
  const [hodlockAddress, setHodlockAddress] = useState<`0x${string}` | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [lockDays, setLockDays] = useState("");
  const [penaltyOption, setPenaltyOption] = useState("2000");
  const [customPenalty, setCustomPenalty] = useState("");
  const [noEarlyWithdraw, setNoEarlyWithdraw] = useState(false);
  const [mintNFT, setMintNFT] = useState(true);
  const [referrer, setReferrer] = useState<`0x${string}` | null>(null);

  // Swap drawer state
  const [isSwapDrawerOpen, setIsSwapDrawerOpen] = useState(false);

  // Get referrer from URL
  useEffect(() => {
    const ref = parseReferrerFromUrl();
    if (ref && ref.startsWith("0x") && ref.length === 42) {
      setReferrer(ref as `0x${string}`);
    }
  }, []);

  // Get Hodlock address for selected token
  const { data: fetchedHodlock } = useGetHodlock(
    selectedTokenAddress as `0x${string}` | undefined
  );

  // Update hodlock address when token changes
  useEffect(() => {
    if (selectedTokenAddress) {
      const knownHodlock = TOKEN_TO_HODLOCK[selectedTokenAddress.toLowerCase()];
      if (knownHodlock) {
        setHodlockAddress(knownHodlock);
      } else if (fetchedHodlock && fetchedHodlock !== "0x0000000000000000000000000000000000000000") {
        setHodlockAddress(fetchedHodlock as `0x${string}`);
      } else {
        setHodlockAddress(null);
      }
    }
  }, [selectedTokenAddress, fetchedHodlock]);

  // Token info
  const tokenAddress = selectedTokenAddress as `0x${string}` | undefined;
  const { data: decimals } = useTokenDecimals(tokenAddress!);
  const { data: symbol } = useTokenSymbol(tokenAddress!);
  const { data: balance } = useTokenBalance(tokenAddress!, address);
  const { data: allowance, refetch: refetchAllowance } = useAllowance(
    tokenAddress!,
    address,
    hodlockAddress!
  );

  // Contract interactions
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming } = useApprove(tokenAddress!);
  const { deposit, isPending: isDepositing, isConfirming: isDepositConfirming } = useDeposit(hodlockAddress!);
  const { createHodlock, isPending: isCreating, isConfirming: isCreateConfirming } = useCreateHodlock();

  const tokenDecimals = decimals ?? 18;

  // Get token info for display
  const selectedTokenInfo = useMemo(() => {
    if (!selectedTokenAddress) return null;
    return FEATURED_TOKENS.find(
      (t) => t.address.toLowerCase() === selectedTokenAddress.toLowerCase()
    ) || { symbol: symbol || "TOKEN", name: "Custom Token", icon: "eth", decimals: tokenDecimals };
  }, [selectedTokenAddress, symbol, tokenDecimals]);

  // Calculate values
  const amountBigInt = amount && tokenAddress
    ? parseUnits(amount, tokenDecimals)
    : BigInt(0);

  const lockSeconds = lockDays ? BigInt(parseInt(lockDays) * 86400) : BigInt(0);

  const penaltyBps = noEarlyWithdraw
    ? BigInt(10000)
    : penaltyOption === "custom"
    ? BigInt(parseInt(customPenalty || "500") * 100)
    : BigInt(parseInt(penaltyOption));

  const needsApproval = hodlockAddress && allowance !== undefined && amountBigInt > allowance;

  const unlockDate = lockDays ? calculateUnlockDate(parseInt(lockDays)) : null;

  const handleTokenSelect = (tokenAddr: string, hodlock: string | null) => {
    setSelectedTokenAddress(tokenAddr);
    if (hodlock) {
      setHodlockAddress(hodlock as `0x${string}`);
    }
  };

  const handleApprove = async () => {
    if (!hodlockAddress) return;
    await approve(hodlockAddress, amountBigInt);
    setTimeout(() => refetchAllowance(), 2000);
  };

  const handleDeposit = async () => {
    if (!hodlockAddress) return;
    const ref = referrer || ("0x0000000000000000000000000000000000000000" as `0x${string}`);
    await deposit(amountBigInt, lockSeconds, penaltyBps, ref);
  };

  const handleCreateHodlock = async () => {
    if (!tokenAddress) return;
    await createHodlock(tokenAddress);
  };

  const isLoading = isApproving || isApproveConfirming || isDepositing || isDepositConfirming || isCreating || isCreateConfirming;

  const isValid =
    selectedTokenAddress &&
    amount &&
    parseFloat(amount) > 0 &&
    lockDays &&
    parseInt(lockDays) >= 1 &&
    (penaltyOption !== "custom" || (customPenalty && parseInt(customPenalty) >= 5 && parseInt(customPenalty) <= 99));

  const needsHodlockCreation = selectedTokenAddress && !hodlockAddress;

  return (
    <Card variant="glass" className="max-w-lg mx-auto">
      <div className="space-y-6">
        {/* Token Selector */}
        <TokenSelector
          selectedToken={selectedTokenAddress}
          onSelectToken={handleTokenSelect}
        />

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <div className="flex items-center gap-2">
              {balance !== undefined && selectedTokenInfo && (
                <button
                  onClick={() => setAmount(formatAmount(balance, tokenDecimals))}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Max: {formatAmount(balance, tokenDecimals)} {selectedTokenInfo.symbol}
                </button>
              )}
              {selectedTokenAddress && (
                <button
                  onClick={() => setIsSwapDrawerOpen(true)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Swap
                </button>
              )}
            </div>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => selectedTokenAddress && setIsSwapDrawerOpen(true)}
            className="text-lg"
            disabled={!selectedTokenAddress}
          />
        </div>

        {/* Lock Duration */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">Lock Duration (days)</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="w-80 p-0">
                  <PenaltyCurveTooltip />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            placeholder="30"
            value={lockDays}
            onChange={(e) => setLockDays(e.target.value)}
            min={1}
          />
          {unlockDate && (
            <p className="mt-2 text-sm text-gray-500">
              Unlocks on: {unlockDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Penalty Settings */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="penalty-settings"
              checked={!noEarlyWithdraw}
              onCheckedChange={(checked) => setNoEarlyWithdraw(!checked)}
            />
            <div>
              <label htmlFor="penalty-settings" className="text-sm font-medium text-gray-700 cursor-pointer">
                Set early withdrawal penalty rate
              </label>
              <p className="text-xs text-gray-500 mt-1">
                This rate won&apos;t affect your dividend amount
              </p>
            </div>
          </div>

          {!noEarlyWithdraw && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-7"
            >
              <div className="flex flex-wrap gap-2">
                {PENALTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPenaltyOption(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      penaltyOption === option.value
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {penaltyOption === "custom" && (
                <Input
                  type="number"
                  placeholder="5-99"
                  value={customPenalty}
                  onChange={(e) => setCustomPenalty(e.target.value)}
                  min={5}
                  max={99}
                  className="mt-3"
                />
              )}
            </motion.div>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-early"
              checked={noEarlyWithdraw}
              onCheckedChange={(checked) => setNoEarlyWithdraw(!!checked)}
            />
            <label htmlFor="no-early" className="text-sm font-medium text-red-600 cursor-pointer">
              I confirm I will NOT withdraw early (100% penalty)
            </label>
          </div>
        </div>

        {/* Mint NFT Option */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="mint-nft"
            checked={mintNFT}
            onCheckedChange={(checked) => setMintNFT(!!checked)}
          />
          <label htmlFor="mint-nft" className="text-sm font-medium text-gray-700 cursor-pointer">
            Mint Honor NFT immediately
          </label>
        </div>

        {/* Referrer Info */}
        {referrer && (
          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
            <Info className="w-4 h-4 text-primary-600" />      <span className="text-sm text-primary-700">
              Referrer: {referrer.slice(0, 6)}...{referrer.slice(-4)}
            </span>
          </div>
        )}

        {/* Action Button */}
        {needsHodlockCreation ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!isConnected || isLoading}
            isLoading={isCreating || isCreateConfirming}
            onClick={handleCreateHodlock}
          >
            Create Pool for {selectedTokenInfo?.symbol || "Token"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            disabled={!isConnected || !isValid || isLoading}
            isLoading={isLoading}
            onClick={needsApproval ? handleApprove : handleDeposit}
          >
            {!isConnected
              ? "Connect Wallet"
              : !selectedTokenAddress
              ? "Select Token"
              : needsApproval
              ? "Approve & Deposit"
              : "Deposit"}
          </Button>
        )}
      </div>

      {/* Swap Drawer */}
      {selectedTokenAddress && selectedTokenInfo && (
        <SwapDrawer
          isOpen={isSwapDrawerOpen}
          onClose={() => setIsSwapDrawerOpen(false)}
          targetToken={selectedTokenAddress}
          targetTokenSymbol={selectedTokenInfo.symbol}
        />
      )}
    </Card>
  );
}
