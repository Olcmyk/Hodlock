'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/shared/ui';
import { Users, Gift, Infinity, ArrowRight } from 'lucide-react';

export function ReferralBanner() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white mb-8">
            <Users className="w-5 h-5" />
            <span className="font-medium">Referral Program</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Invite Friends, Earn{' '}
            <span className="relative">
              <span className="relative z-10">Forever</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-white/30 -rotate-1" />
            </span>
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Earn <span className="font-bold text-2xl">30%</span> of your referrals&apos; early withdrawal penalties.{' '}
            <span className="font-bold">Permanently.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Gift className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">30%</p>
                <p className="text-sm text-white/80">Commission Rate</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Infinity className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">Forever</p>
                <p className="text-sm text-white/80">Duration</p>
              </div>
            </div>
          </div>

          <Link href="/invite">
            <Button
              size="lg"
              className="bg-white text-pink-600 hover:bg-white/90 shadow-xl shadow-pink-900/20"
            >
              Get Your Invite Link
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
