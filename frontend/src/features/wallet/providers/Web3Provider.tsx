'use client';

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';
import { WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter, projectId } from '@/shared/config/wagmi';

const queryClient = new QueryClient();

const metadata = {
  name: 'Hodlock',
  description: 'Principal-protected On-Chain CD',
  url: 'https://hodlock.io',
  icons: ['https://hodlock.io/icon.png'],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#000000',
    '--w3m-border-radius-master': '12px',
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
