'use client';

import { Address } from 'viem';
import { useEffect, useState, ComponentType } from 'react';
import { useAccount } from 'wagmi';

interface SwapWidgetProps {
  toToken?: Address;
}

// LiFi integration ID
const LIFI_INTEGRATION_ID = '90c75604-5979-442d-9a9c-16fc29abfea2.661bf9c9-be2a-4a81-936a-1d07151deaa2';

// Chain IDs
const CHAINS = {
  ETHEREUM: 1,
  OPTIMISM: 10,
  BSC: 56,
  POLYGON: 137,
  BASE: 8453,
  ARBITRUM: 42161,
  AVALANCHE: 43114,
};

// Token addresses on Base
const BASE_TOKENS = {
  cbBTC: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
  wstETH: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  ETH: '0x0000000000000000000000000000000000000000',
};

export function SwapWidget({ toToken }: SwapWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [LiFiWidgetComponent, setLiFiWidgetComponent] = useState<ComponentType<any> | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    // Dynamic import to avoid SSR issues
    import('@lifi/widget').then((mod) => {
      setLiFiWidgetComponent(() => mod.LiFiWidget);
    }).catch((err) => {
      console.error('Failed to load LiFi Widget:', err);
    });
  }, []);

  if (!mounted || !LiFiWidgetComponent) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading swap widget...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="text-center">
          <p className="text-sm text-gray-500">请先连接钱包以使用换币功能</p>
        </div>
      </div>
    );
  }

  const widgetConfig = {
    integrator: LIFI_INTEGRATION_ID,
    chains: {
      allow: [
        CHAINS.ETHEREUM,
        CHAINS.OPTIMISM,
        CHAINS.BSC,
        CHAINS.POLYGON,
        CHAINS.BASE,
        CHAINS.ARBITRUM,
        CHAINS.AVALANCHE,
      ],
    },
    toChain: CHAINS.BASE,
    toToken: toToken || BASE_TOKENS.USDC,
    appearance: 'light' as const,
    theme: {
      palette: {
        primary: {
          main: '#000000',
        },
        secondary: {
          main: '#ec4899',
        },
      },
      shape: {
        borderRadius: 12,
      },
    },
  };

  return (
    <div className="space-y-2">
      {/* LiFi Widget */}
      <div className="lifi-widget-container rounded-2xl overflow-hidden">
        <LiFiWidgetComponent integrator={LIFI_INTEGRATION_ID} config={widgetConfig} />
      </div>

      {/* Powered by */}
      <p className="text-center text-xs text-gray-400">
        Powered by LiFi Protocol
      </p>
    </div>
  );
}
