'use client';

import { SwapWidget } from '@/features/swap';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

const externalSwapLinks = [
  {
    name: 'Jumper Exchange',
    url: 'https://jumper.exchange',
    description: 'Cross-chain swap aggregator',
    icon: 'https://jumper.exchange/favicon.ico',
  },
  {
    name: 'Uniswap',
    url: 'https://app.uniswap.org',
    description: 'Leading DEX on Ethereum',
    icon: 'https://app.uniswap.org/favicon.png',
  },
  {
    name: '1inch',
    url: 'https://app.1inch.io',
    description: 'DEX aggregator for best rates',
    icon: 'https://app.1inch.io/assets/favicon/favicon-32x32.png',
  },
];

export default function SwapPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Swap{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Tokens
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cross-chain swap any tokens to get the tokens you want to lock
          </p>
        </div>

        <SwapWidget />

        {/* External Swap Links */}
        <div className="mt-12">
          <h3 className="text-center text-sm font-medium text-gray-500 mb-4">
            Or use other swap platforms
          </h3>
          <div className="flex flex-col gap-3">
            {externalSwapLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-pink-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                    {link.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{link.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
