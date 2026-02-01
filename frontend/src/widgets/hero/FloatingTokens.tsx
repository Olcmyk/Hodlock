'use client';

import { motion } from 'framer-motion';
import { TokenIcon } from '@token-icons/react';

const tokens = [
  { symbol: 'BTC', x: '10%', y: '20%', size: 48, delay: 0 },
  { symbol: 'ETH', x: '85%', y: '15%', size: 56, delay: 0.2 },
  { symbol: 'USDC', x: '15%', y: '70%', size: 40, delay: 0.4 },
  { symbol: 'USDT', x: '80%', y: '75%', size: 44, delay: 0.6 },
  { symbol: 'DAI', x: '25%', y: '40%', size: 36, delay: 0.8 },
  { symbol: 'LINK', x: '75%', y: '45%', size: 42, delay: 1 },
  { symbol: 'UNI', x: '5%', y: '50%', size: 38, delay: 1.2 },
  { symbol: 'AAVE', x: '90%', y: '55%', size: 40, delay: 1.4 },
  { symbol: 'WBTC', x: '30%', y: '85%', size: 46, delay: 1.6 },
  { symbol: 'MATIC', x: '70%', y: '25%', size: 38, delay: 1.8 },
];

export function FloatingTokens() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tokens.map((token, index) => (
        <motion.div
          key={token.symbol}
          className="absolute"
          style={{ left: token.x, top: token.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.6,
            scale: 1,
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: token.delay },
            scale: { duration: 0.5, delay: token.delay },
            y: {
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: token.delay,
            },
          }}
        >
          <div className="p-3 rounded-2xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100">
            <TokenIcon
              symbol={token.symbol}
              size={token.size}
              variant="branded"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
