import type { Metadata } from 'next';
import { Suspense } from 'react';
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
  title: 'Hodlock - On-Chain CD with 100% Principal Protection',
  description: 'Lock tokens. Earn from early exits. Principal always safe.',
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
            <Suspense fallback={null}>
              <ReferralCapture />
            </Suspense>
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
