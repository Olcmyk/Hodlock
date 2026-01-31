"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Users, Zap } from "lucide-react";
import { Card } from "@/shared/ui";

const features = [
  {
    icon: Shield,
    title: "100% Principal Protected",
    description:
      "Your deposited tokens are always safe. You can withdraw your full principal at any time.",
    gradient: "from-green-400 to-green-600",
  },
  {
    icon: TrendingUp,
    title: "No Ponzi Scheme",
    description:
      "Rewards come from early withdrawers' penalties, not from new deposits. Sustainable and transparent.",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: Users,
    title: "Referral Rewards",
    description:
      "Invite friends and earn a share of their early withdrawal penalties. Build your network.",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    icon: Zap,
    title: "Instant Withdrawals",
    description:
      "Need your tokens? Withdraw anytime. Just pay the penalty you set when depositing.",
    gradient: "from-orange-400 to-orange-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Hodlock?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A revolutionary approach to token locking that rewards patience and
            commitment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
