"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Grid3X3 } from "lucide-react";
import { Card } from "@/shared/ui";
import { CONTRACTS, TOKENS } from "@/shared/config/contracts";
import { TokenIcon } from "@web3icons/react";

const featuredPools = [
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    tokenAddress: TOKENS.CBBTC,
    hodlockAddress: CONTRACTS.CBBTC_HODLOCK,
    icon: "btc",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    symbol: "wstETH",
    name: "Wrapped Staked ETH",
    tokenAddress: TOKENS.WSTETH,
    hodlockAddress: CONTRACTS.WSTETH_HODLOCK,
    icon: "steth",
    gradient: "from-blue-400 to-blue-600",
  },
];

export function FeaturedPools() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Pool
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a token to lock and start earning rewards from early withdrawers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPools.map((pool, index) => (
            <motion.div
              key={pool.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/lock?token=${pool.tokenAddress}`}>
                <Card
                  variant="gradient"
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                      <TokenIcon
                        symbol={pool.icon}
                        variant="branded"
                        size={36}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {pool.symbol}
                      </h3>
                      <p className="text-sm text-gray-500">{pool.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-primary-600 font-medium">
                    Lock {pool.symbol}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Lock Other Coins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/lock">
              <Card
           variant="glass"
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                    <Grid3X3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Other Tokens
                    </h3>
                    <p className="text-sm text-gray-500">Any ERC20 token</p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  Browse All Pools
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
