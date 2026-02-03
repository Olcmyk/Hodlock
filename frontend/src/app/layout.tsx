import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Web3Provider } from '@/features/wallet';
import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';
import { TooltipProvider } from '@/shared/ui';
import { ReferralCapture } from '@/shared/components/ReferralCapture';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hodlock - Principal-Protected On-Chain CD',
  description: 'Lock your tokens, earn rewards from paper hands. 100% principal protected, no Ponzi schemes.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Web3Provider>
          <TooltipProvider>
            <ReferralCapture />
            <Header />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
          </TooltipProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
