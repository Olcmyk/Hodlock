"use client";

import { Card } from "@/shared/ui";
import { CHAIN_ID } from "@/shared/config/contracts";

export function SwapWidget() {
  // Use LiFi iframe integration instead of the widget to avoid dependency issues
  const lifiUrl = `https://jumper.exchange/?toChain=${CHAIN_ID}&theme=light`;

  return (
    <Card variant="glass" className="max-w-lg mx-auto overflow-hidden">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Swap to Base
        </h3>
        <p className="text-sm text-gray-500">
          Powered by LiFi / Jumper Exchange
        </p>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <iframe
          src={lifiUrl}
          width="100%"
          height="600"
          style={{ border: "none", display: "block" }}
          allow="clipboard-write"
          title="LiFi Swap Widget"
        />
      </div>
    </Card>
  );
}
