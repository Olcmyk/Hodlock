'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Button } from '@/shared/ui';
import { Wallet, LogOut } from 'lucide-react';
import { formatAddress } from '@/shared/lib/utils';

export function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => open({ view: 'Account' })}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button onClick={() => open()} className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
