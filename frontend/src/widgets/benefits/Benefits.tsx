'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Gem, Ban } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: '100% Principal Protected',
    description: 'Your original deposit is always safe. Only early withdrawers pay penalties.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Ban,
    title: 'No Ponzi Schemes',
    description: 'Rewards come from early withdrawal penalties, not from new deposits.',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Higher Yields for ERC20',
    description: 'Earn additional rewards on top of your existing token holdings.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Gem,
    title: 'Diamond Hands Win',
    description: 'Paper hands pay penalties that go directly to diamond hand holders.',
    gradient: 'from-sky-400 to-blue-500',
  },
];

export function Benefits() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Hodlock
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A revolutionary way to earn rewards while keeping your principal safe
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-pink-200 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/30">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white mb-6 shadow-lg`}>
                  <benefit.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
