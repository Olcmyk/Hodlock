import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/shared/providers/web3-provider";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import { TooltipProvider } from "@/shared/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hodlock - Principal-Protected On-Chain CD",
  description:
    "Lock your tokens, earn rewards from early withdrawers. 100% principal protected, no Ponzi scheme.",
  keywords: ["DeFi", "staking", "HODL", "crypto", "blockchain", "Ethereum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white antialiased`}>
        <Web3Provider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </TooltipProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
