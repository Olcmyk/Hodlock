'use client';

import { Address } from 'viem';
import { useEffect, useState, ComponentType } from 'react';
import { useAccount, useWalletClient, useConfig } from 'wagmi';
import type { WidgetConfig } from '@lifi/widget';

interface SwapWidgetProps {
  toToken?: Address;
  fromChain?: number;
  toChain?: number;
}

// LiFi integration ID - use the short name, not the full UUID
const LIFI_INTEGRATION_ID = 'hodlock2';

// Chain IDs - Extended list like Jumper Exchange
const CHAINS = {
  ETHEREUM: 1,
  OPTIMISM: 10,
  BSC: 56,
  GNOSIS: 100,
  POLYGON: 137,
  FANTOM: 250,
  BOBA: 288,
  MOONRIVER: 1285,
  MOONBEAM: 1284,
  CELO: 42220,
  AVALANCHE: 43114,
  ARBITRUM: 42161,
  HARMONY: 1666600000,
  FUSE: 122,
  OKX: 66,
  CRONOS: 25,
  VELAS: 106,
  METIS: 1088,
  BASE: 8453,
  LINEA: 59144,
  POLYGON_ZKEVM: 1101,
  SCROLL: 534352,
  ZKSYNC: 324,
  MANTLE: 5000,
  BLAST: 81457,
  MODE: 34443,
};

// Token addresses on Base
const BASE_TOKENS = {
  cbBTC: '0xCbb7C0000Ab88B473b1f5aFd9ef808440Eed33bF',
  weETH: '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  ETH: '0x0000000000000000000000000000000000000000',
};

export function SwapWidget({ toToken, fromChain, toChain }: SwapWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [LiFiWidgetComponent, setLiFiWidgetComponent] = useState<ComponentType<any> | null>(null);
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();

  useEffect(() => {
    setMounted(true);
    // Dynamic import to avoid SSR issues
    import('@lifi/widget').then((mod) => {
      setLiFiWidgetComponent(() => mod.LiFiWidget);
      console.log('LiFi Widget loaded successfully');
    }).catch((err) => {
      console.error('Failed to load LiFi Widget:', err);
    });
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('SwapWidget state:', {
      mounted,
      isConnected,
      address,
      chainId: chain?.id,
      hasWalletClient: !!walletClient,
      hasWagmiConfig: !!wagmiConfig,
    });
  }, [mounted, isConnected, address, chain, walletClient, wagmiConfig]);

  if (!mounted || !LiFiWidgetComponent) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-white rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
          <p className="text-sm text-gray-500">加载交换组件中...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address || !walletClient) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-white rounded-2xl">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {!isConnected ? '请先连接钱包以使用换币功能' : '正在连接钱包...'}
          </p>
        </div>
      </div>
    );
  }

  // Widget config with better settings
  const widgetConfig: WidgetConfig = {
    integrator: LIFI_INTEGRATION_ID,
    variant: 'compact',
    appearance: 'light',

    // Optional: Add theme for better styling
    theme: {
      palette: {
        primary: {
          main: '#ec4899',
        },
        background: {
          default: '#ffffff',
          paper: '#ffffff',
        },
      },
    },

    // Optional: Language settings
    languages: {
      default: 'en',
      allow: ['zh', 'en'],
    },
  };

  console.log('Widget config:', {
    fromChain: widgetConfig.fromChain,
    toChain: widgetConfig.toChain,
    toToken: widgetConfig.toToken,
  });

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      {/* LiFi Widget */}
      <div className="lifi-widget-container">
        <LiFiWidgetComponent integrator={LIFI_INTEGRATION_ID} config={widgetConfig} />
      </div>

      {/* Powered by footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>Powered by</span>
        <a
          href="https://li.fi"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-pink-500 hover:text-pink-400 transition-colors"
        >
          LiFi Protocol
        </a>
        <span>·</span>
        <span>与 Jumper Exchange 相同的技术</span>
      </div>
    </div>
  );
}
