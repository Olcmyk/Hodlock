'use client';

import { SwapWidget } from '@/features/swap';

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
            Swap any token across chains to get the tokens you want to lock
          </p>
        </div>

        <SwapWidget />
      </div>
    </div>
  );
}
