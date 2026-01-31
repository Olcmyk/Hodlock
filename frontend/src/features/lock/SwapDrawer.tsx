"use client";

import { ArrowLeftRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/ui";
import { CHAIN_ID } from "@/shared/config/contracts";

interface SwapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetToken: string;
  targetTokenSymbol: string;
}

export function SwapDrawer({
  isOpen,
  onClose,
  targetToken,
  targetTokenSymbol,
}: SwapDrawerProps) {
  // Use LiFi iframe integration to avoid dependency issues with Solana/Sui packages
  const lifiUrl = `https://jumper.exchange/?toChain=${CHAIN_ID}&toToken=${targetToken}&theme=light`;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent side="right" className="w-full max-w-md">
        <DrawerHeader className="pb-4 border-b border-gray-100">
          <DrawerTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary-500" />
            Swap to {targetTokenSymbol}
          </DrawerTitle>
          <DrawerDescription>
            Convert any token to {targetTokenSymbol} on Base
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <iframe
            src={lifiUrl}
            width="100%"
            height="550"
            style={{ border: "none", display: "block" }}
            allow="clipboard-write"
            title="LiFi Swap Widget"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Swapped tokens will appear in your wallet. Then enter the amount above to deposit.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
