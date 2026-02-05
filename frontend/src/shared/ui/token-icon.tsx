'use client';

import { TokenIcon as BaseTokenIcon } from '@token-icons/react';
import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ symbol, size = 32, className }: TokenIconProps) {
  // 对于本地有图标的代币，使用本地图标
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

  // 其他代币使用 @token-icons/react
  return (
    <BaseTokenIcon
      symbol={symbol}
      size={size}
      variant="branded"
      className={className}
    />
  );
}
