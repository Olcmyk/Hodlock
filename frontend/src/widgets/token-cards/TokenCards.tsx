'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TokenIcon } from '@token-icons/react';
import { ArrowRight } from 'lucide-react';

const tokenCards = [
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    href: '/lock?token=cbBTC',
    gradient: 'from-pink-400 to-rose-500',
    hasLocalIcon: true,
    localIconPath: '/resource/cbBTC.svg',
  },
  {
    symbol: 'weETH',
    name: 'Wrapped eETH',
    href: '/lock?token=weETH',
    gradient: 'from-rose-400 to-pink-500',
    hasLocalIcon: true,
    localIconPath: '/resource/weETH.svg',
  },
  {
    symbol: 'other',
    name: 'Lock Other Coins',
    href: '/lock',
    gradient: 'from-pink-500 to-rose-600',
    isOther: true,
  },
];

export function TokenCards() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Token
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a token to lock and start earning rewards from early withdrawals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tokenCards.map((card, index) => (
            <motion.div
              key={card.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className="group relative h-[40vh] min-h-[300px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-pink-300 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative h-full flex flex-col items-center justify-center p-8">
                    {card.isOther ? (
                      <div className="relative w-32 h-32 mb-6">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="grid grid-cols-3 gap-2">
                            {['ETH', 'USDC', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX'].map((symbol) => (
                              <div key={symbol} className="w-8 h-8">
                                <TokenIcon symbol={symbol} size={32} variant="branded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : card.hasLocalIcon ? (
                      <div className="w-32 h-32 mb-6 relative">
                        <Image
                          src={card.localIconPath!}
                          alt={card.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 mb-6 flex items-center justify-center">
                        <TokenIcon symbol={card.symbol} size={100} variant="branded" />
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {card.isOther ? 'Other Tokens' : card.symbol}
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      {card.name}
                    </p>

                    <div className="flex items-center gap-2 text-pink-500 font-medium group-hover:gap-3 transition-all">
                      <span>Lock Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
