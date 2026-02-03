'use client';

import { useEffect, useState, ComponentType } from 'react';
import { useAccount } from 'wagmi';
import type { WidgetConfig } from '@lifi/widget';

// LiFi integration ID - use the short name
const LIFI_INTEGRATION_ID = 'hodlock2';

export function SwapWidgetSimple() {
  const [mounted, setMounted] = useState(false);
  const [LiFiWidgetComponent, setLiFiWidgetComponent] = useState<ComponentType<any> | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    import('@lifi/widget').then((mod) => {
      setLiFiWidgetComponent(() => mod.LiFiWidget);
      console.log('LiFi Widget loaded');
    }).catch((err) => {
      console.error('Failed to load LiFi Widget:', err);
    });
  }, []);

  if (!mounted || !LiFiWidgetComponent) {
    return <div>Loading...</div>;
  }

  if (!isConnected || !address) {
    return <div>Please connect wallet</div>;
  }

  // Minimal config - just like Jumper
  const widgetConfig: WidgetConfig = {
    integrator: LIFI_INTEGRATION_ID,
    variant: 'wide',
    appearance: 'dark',
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <LiFiWidgetComponent integrator={LIFI_INTEGRATION_ID} config={widgetConfig} />
    </div>
  );
}
