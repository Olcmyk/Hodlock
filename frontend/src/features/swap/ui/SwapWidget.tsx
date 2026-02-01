'use client';

import { Address } from 'viem';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRightLeft, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import { TOKEN_ADDRESSES } from '@/shared/config/contracts';

interface SwapWidgetProps {
  toToken?: Address;
}

interface SwapOption {
  name: string;
  logo: string;
  description: string;
  buildUrl: (toToken?: Address) => string;
  features: string[];
  color: string;
}

const SWAP_OPTIONS: SwapOption[] = [
  {
    name: 'Jumper Exchange',
    logo: '🦘',
    description: 'Cross-chain swap aggregator powered by LI.FI',
    buildUrl: (toToken) => {
      const params = new URLSearchParams({
        toChain: '8453',
      });
      if (toToken) params.set('toToken', toToken);
      return `https://jumper.exchange/?${params.toString()}`;
    },
    features: ['Cross-chain', 'Best rates', 'Multi-route'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Uniswap',
    logo: '🦄',
    description: 'The largest decentralized exchange on Base',
    buildUrl: (toToken) => {
      const params = new URLSearchParams({
        chain: 'base',
      });
      if (toToken) params.set('outputCurrency', toToken);
      return `https://app.uniswap.org/swap?${params.toString()}`;
    },
    features: ['High liquidity', 'Low fees', 'Trusted'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Aerodrome',
    logo: '✈️',
    description: 'Native DEX on Base with deep liquidity',
    buildUrl: (toToken) => {
      let url = 'https://aerodrome.finance/swap';
      if (toToken) url += `?to=${toToken}`;
      return url;
    },
    features: ['Base native', 've(3,3)', 'Low slippage'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: '1inch',
    logo: '🦏',
    description: 'DEX aggregator for best swap rates',
    buildUrl: (toToken) => {
      let url = 'https://app.1inch.io/#/8453/simple/swap/ETH';
      if (toToken) url += `/${toToken}`;
      return url;
    },
    features: ['Aggregator', 'Lowest gas', 'MEV protection'],
    color: 'from-red-500 to-orange-500',
  },
];

const QUICK_TOKENS = [
  { symbol: 'cbBTC', address: TOKEN_ADDRESSES.cbBTC, emoji: '₿' },
  { symbol: 'wstETH', address: TOKEN_ADDRESSES.wstETH, emoji: 'Ξ' },
  { symbol: 'USDC', address: TOKEN_ADDRESSES.USDC, emoji: '$' },
];

export function SwapWidget({ toToken }: SwapWidgetProps) {
  const [selectedToken, setSelectedToken] = useState<Address | undefined>(toToken);

  const handleOpenSwap = (option: SwapOption) => {
    const url = option.buildUrl(selectedToken);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Quick Token Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-gray-900">Swap to</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_TOKENS.map((token) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token.address)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedToken === token.address
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}
              >
                <span className="text-2xl mb-2 block">{token.emoji}</span>
                <span className="font-medium text-gray-900">{token.symbol}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Swap Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-pink-500" />
          Choose a DEX
        </h3>

        {SWAP_OPTIONS.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleOpenSwap(option)}>
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {option.logo}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{option.name}</h4>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500">{option.description}</p>
                    <div className="flex gap-2 mt-2">
                      {option.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0">
                    Open
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Swap safely</h4>
            <p className="text-sm text-gray-600">
              These DEXes will open in a new tab. After swapping, return here to lock your tokens in Hodlock.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Best Rates</p>
          <p className="font-semibold text-gray-900">Aggregated</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
          <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Security</p>
          <p className="font-semibold text-gray-900">Audited</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
          <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Network</p>
          <p className="font-semibold text-gray-900">Base</p>
        </div>
      </div>
    </div>
  );
}
