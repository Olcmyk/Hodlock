'use client';

import { Address } from 'viem';
import { useEffect, useState, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRightLeft, Shield } from 'lucide-react';

interface SwapWidgetProps {
  toToken?: Address;
}

// Socket public API key - you can get your own at https://sockettech.notion.site/
const SOCKET_API_KEY = '645b2c8c-5825-4930-baf3-d9b997fcd88c';

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
  ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
};

export function SwapWidget({ toToken }: SwapWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [BridgeComponent, setBridgeComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamic import to avoid SSR issues
    import('@socket.tech/plugin').then((mod) => {
      setBridgeComponent(() => mod.Bridge);
    });
  }, []);

  if (!mounted || !BridgeComponent) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-pink-50 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading swap widget...</p>
        </div>
      </div>
    );
  }

  // Get ethereum provider
  const provider = typeof window !== 'undefined' ? (window as any).ethereum : undefined;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100"
      >
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Cross-chain Swap & Bridge</h4>
            <p className="text-sm text-gray-600">
              Swap any token from any chain to Base. Get cbBTC, wstETH, or USDC to lock in Hodlock.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Socket Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="socket-widget-container rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white"
      >
        <BridgeComponent
          API_KEY={SOCKET_API_KEY}
          provider={provider}
          sourceNetworks={[
            CHAINS.ETHEREUM,
            CHAINS.OPTIMISM,
            CHAINS.BSC,
            CHAINS.POLYGON,
            CHAINS.BASE,
            CHAINS.ARBITRUM,
            CHAINS.AVALANCHE,
          ]}
          destNetworks={[CHAINS.BASE]}
          defaultDestNetwork={CHAINS.BASE}
          defaultDestToken={toToken || BASE_TOKENS.USDC}
          enableSameChainSwaps={true}
          singleTxOnly={false}
          customize={{
            width: 420,
            responsiveWidth: true,
            borderRadius: 1,
            accent: 'rgb(236, 72, 153)',
            onAccent: 'rgb(255, 255, 255)',
            primary: 'rgb(255, 255, 255)',
            secondary: 'rgb(249, 250, 251)',
            text: 'rgb(17, 24, 39)',
            secondaryText: 'rgb(107, 114, 128)',
            interactive: 'rgb(243, 244, 246)',
            outline: 'rgb(229, 231, 235)',
          }}
        />
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
          <ArrowRightLeft className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Cross-chain</p>
          <p className="font-semibold text-gray-900 text-sm">7+ Chains</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
          <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Best Rates</p>
          <p className="font-semibold text-gray-900 text-sm">Aggregated</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
          <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Security</p>
          <p className="font-semibold text-gray-900 text-sm">Audited</p>
        </div>
      </motion.div>

      {/* Tip */}
      <p className="text-center text-xs text-gray-400">
        Powered by Socket Protocol. Aggregates best routes across bridges and DEXes.
      </p>
    </div>
  );
}
