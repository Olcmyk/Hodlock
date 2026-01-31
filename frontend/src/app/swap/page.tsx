import { SwapWidget } from "@/features/swap";

export default function SwapPage() {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Swap Tokens
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Swap any token to Base chain tokens using LiFi cross-chain aggregator.
          </p>
        </div>

        <SwapWidget />
      </div>
    </div>
  );
}
