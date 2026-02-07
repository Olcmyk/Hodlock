'use client';

import { TokenIcon as BaseTokenIcon } from '@token-icons/react';
import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ symbol, size = 32, className }: TokenIconProps) {
  // For tokens with local icons, use local icon
  if (symbol === 'weETH') {
    return (
      <Image
        src="/resource/weETH.svg"
        alt="weETH"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  if (symbol === 'cbBTC') {
    return (
      <Image
        src="/resource/cbBTC.svg"
        alt="cbBTC"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  // Other tokens use @token-icons/react
  return (
    <BaseTokenIcon
      symbol={symbol}
      size={size}
      variant="branded"
      className={className}
    />
  );
}
