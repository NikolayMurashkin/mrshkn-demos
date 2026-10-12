import { Changelog } from '@/components/Changelog';
import { Features } from '@/components/Features';
import { Hero } from '@/components/Hero';
import { Pricing } from '@/components/Pricing';

const HomePage = () => (
  <main>
    <Hero />
    <Features />
    <Pricing />
    <Changelog />
  </main>
);

export default HomePage;
