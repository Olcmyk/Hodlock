"use client";

import { useAccount, useConnect } from "wagmi";

export function useWalletType() {
  const { connector } = useAccount();

  const isCoinbaseWallet = connector?.id === "coinbaseWalletSDK" ||
                           connector?.id === "com.coinbase.wallet" ||
                           connector?.name?.toLowerCase().includes("coinbase");

  return {
    isCoinbaseWallet,
    connectorId: connector?.id,
    connectorName: connector?.name,
  };
}
