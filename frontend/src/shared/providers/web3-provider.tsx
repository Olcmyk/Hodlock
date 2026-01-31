"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { base } from "@reown/appkit/networks";
import { wagmiAdapter, projectId } from "@/shared/lib/wagmi";

// Create query client
const queryClient = new QueryClient();

// App metadata
const metadata = {
  name: "Hodlock",
  description: "Principal-Protected On-Chain CD",
  url: "https://hodlock.io",
  icons: ["https://hodlock.io/icon.png"],
};

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#ec4899",
    "--w3m-color-mix": "#ec4899",
    "--w3m-color-mix-strength": 20,
    "--w3m-border-radius-master": "2px",
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
