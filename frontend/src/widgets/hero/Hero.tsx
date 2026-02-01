'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/shared/ui';
import { ArrowRight } from 'lucide-react';
import { FloatingTokens } from './FloatingTokens';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-pink-50/30 to-white">
      <FloatingTokens />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Principal-Protected{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              On-Chain CD
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Lock your tokens, earn rewards from paper hands. 100% principal protected,
            no Ponzi schemes, just pure diamond hand rewards.
          </p>

          <Link href="/lock">
            <Button size="lg" className="text-lg px-10 py-6 h-auto">
              Start Locking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
