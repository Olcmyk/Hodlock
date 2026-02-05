'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Hourglass, Trophy } from 'lucide-react';

export function NFTShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const hourglassOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);
  const hourglassScale = useTransform(scrollYProgress, [0.2, 0.5], [1, 0.8]);
  const trophyOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const trophyScale = useTransform(scrollYProgress, [0.4, 0.7], [0.8, 1]);

  return (
    <section ref={containerRef} className="py-32 px-4 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="relative w-80 h-80">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: hourglassOpacity, scale: hourglassScale }}
              >
                <div className="relative">
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-200 shadow-2xl shadow-pink-200/50 flex items-center justify-center">
                    <div className="text-center">
                      <Hourglass className="w-24 h-24 text-pink-500 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-pink-600 font-medium">Locked</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                    #1
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: trophyOpacity, scale: trophyScale }}
              >
                <div className="relative">
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-200 shadow-2xl shadow-amber-200/50 flex items-center justify-center">
                    <div className="text-center">
                      <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-amber-600 font-medium">Unlocked</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">
                    #1
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Hodlock Certificate{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                #1
              </span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              A certificate representing a locked token deposit in Hodlock protocol.
              This NFT represents <span className="font-semibold text-gray-900">5 weETH</span> locked
              for <span className="font-semibold text-gray-900">365 days</span>.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Soul-bound until unlock date</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Proof of diamond hands</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Transferable after maturity</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
