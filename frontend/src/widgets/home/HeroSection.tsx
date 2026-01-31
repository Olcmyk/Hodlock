"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui";
import { TokenIcon } from "@web3icons/react";

const cryptoIcons = [
  { symbol: "btc", x: "10%", y: "20%", size: 48, delay: 0 },
  { symbol: "eth", x: "85%", y: "15%", size: 56, delay: 0.1 },
  { symbol: "usdc", x: "75%", y: "70%", size: 40, delay: 0.2 },
  { symbol: "usdt", x: "15%", y: "65%", size: 44, delay: 0.3 },
  { symbol: "dai", x: "25%", y: "35%", size: 36, delay: 0.4 },
  { symbol: "link", x: "70%", y: "40%", size: 42, delay: 0.5 },
  { symbol: "uni", x: "50%", y: "75%", size: 38, delay: 0.6 },
  { symbol: "aave", x: "40%", y: "20%", size: 34, delay: 0.7 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-primary-100/30" />

      {/* Glassmorphism container with crypto icons */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-4xl h-[500px] mx-4">
          {/* Floating crypto icons */}
          {cryptoIcons.map((icon, index) => (
            <motion.div
              key={icon.symbol}
              className="absolute"
              style={{ left: icon.x, top: icon.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{
                delay: icon.delay,
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="rounded-full bg-white/80 flex items-center justify-center shadow-lg"
                  style={{ width: icon.size, height: icon.size }}
                >
                  <TokenIcon
                    symbol={icon.symbol}
                    variant="branded"
                    size={icon.size * 0.7}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Background overlay */}
          <div className="absolute inset-0 bg-white/60 rounded-3xl border border-gray-200 shadow-2xl" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
            100% Principal Protected
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Principal-Protected{" "}
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            On-Chain CD
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Lock your tokens, earn rewards from early withdrawers. No Ponzi, no
          impermanent loss, just pure HODL rewards.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/lock">
            <Button size="xl" className="group">
              Start Locking
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
