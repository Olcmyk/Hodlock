import { Hero } from '@/widgets/hero';
import { TokenCards } from '@/widgets/token-cards';
import { NFTShowcase } from '@/widgets/nft-showcase';
import { Benefits } from '@/widgets/benefits';
import { ReferralBanner } from '@/widgets/referral-banner';

export default function Home() {
  return (
    <>
      <Hero />
      <TokenCards />
      <NFTShowcase />
      <Benefits />
      <ReferralBanner />
    </>
  );
}
