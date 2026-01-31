"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function NFTShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // Morph from hourglass to trophy based on scroll
  const hourglassOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);
  const trophyOpacity = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-gradient-to-b from-white via-primary-50/30 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          style={{ opacity }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Earn Your{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Honor NFT
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lock your tokens and mint a unique NFT certificate. Watch it transform
            from an hourglass to a trophy when your lock period ends.
          </p>
        </motion.div>

        <motion.div
          className="relative flex justify-center items-center h-[400px]"
          style={{ scale }}
        >
          {/* Hourglass NFT */}
          <motion.div
            className="absolute"
            style={{ opacity: hourglassOpacity }}
          >
            <div className="w-64 h-80 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 border-4 border-primary-300 shadow-2xl flex flex-col items-center justify-center p-6">
              <div className="w-24 h-24 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full text-primary-600">
                  <path
                    fill="currentColor"
                    d="M20 10h60v10c0 15-10 25-25 35 15 10 25 20 25 35v10H20V90c0-15 10-25 25-35C30 45 20 35 20 20V10z"
                  />
                  <rect x="15" y="5" width="70" height="5" fill="currentColor" />
                  <rect x="15" y="90" width="70" height="5" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-2">Locked</h3>
              <p className="text-sm text-primary-600 text-center">
                Your tokens are safely locked. HODL strong!
              </p>
            </div>
          </motion.div>

          {/* Trophy NFT */}
          <motion.div
            className="absolute"
            style={{ opacity: trophyOpacity }}
          >
            <div className="w-64 h-80 rounded-3xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400 shadow-2xl flex flex-col items-center justify-center p-6">
              <div className="w-24 h-24 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-600">
                  <path
                    fill="currentColor"
                    d="M30 20h40v30c0 15-10 25-20 25s-20-10-20-25V20z"
                  />
                  <path
                    fill="currentColor"
                    d="M25 20c-10 0-15 10-15 20s5 15 15 15V20zM75 20c10 0 15 10 15 20s-5 15-15 15V20z"
                  />
                  <rect x="40" y="75" width="20" height="10" fill="currentColor" />
                  <rect x="30" y="85" width="40" height="10" rx="2" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Unlocked</h3>
              <p className="text-sm text-yellow-700 text-center">
                Congratulations! You&apos;ve earned your trophy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
