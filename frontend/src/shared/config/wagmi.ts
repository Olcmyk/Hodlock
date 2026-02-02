'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const projectId = '98142860012c5e88d3db516ad6f72950';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const config = getDefaultConfig({
  appName: 'Hodlock',
  projectId,
  chains: [base],
  ssr: true,
});
