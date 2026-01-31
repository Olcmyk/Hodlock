# Hodlock Frontend

A Next.js frontend for the Hodlock protocol - a principal-protected on-chain certificate of deposit.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Add your WalletConnect Project ID to `.env.local`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Contract Addresses (Sepolia)

- HodlockNFT: `0x5DbaC997C524FbF6a32B903Fc4cF7FB0871Cc115`
- HodlockNFTRender: `0xB663CDeCF276460eDE3180d1D55BFa2e1c407911`
- HodlockFactory: `0xaDD05578dCB8096D52bFba7dd7Bc4B49651177BD`
- TEST Token: `0x329D84491C103ac2dCF2EdcDa3A1D0c70D7cdCDc`
- TEST Hodlock: `0xBb560d98125c82990F30B195dd7475B52432CD2C`

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- RainbowKit
- wagmi v2
- viem
- Framer Motion
- Radix UI
