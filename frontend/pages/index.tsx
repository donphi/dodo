import React from 'react';
import HeroTop from '../components/hero_landing/top';
import HeroMiddle from '../components/hero_landing/middle';
import { FAQ } from '../components/hero_landing/faq';
import Footer from '../components/hero_landing/footer';

const Home: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative isolate overflow-hidden">
    {/* Line pattern background that spans the entire page */}
    <svg
      aria-hidden="true"
      className="absolute inset-0 -z-10 size-full stroke-gray-200 dark:stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
    >
      <defs>
        <pattern
          x="50%"
          y={-1}
          id="hero-pattern"
          width={200}
          height={200}
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect fill="url(#hero-pattern)" width="100%" height="100%" strokeWidth={0} />
    </svg>
    
    {/* Background gradient effect from contact page */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
    >
      <div
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
        className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 via-pink-200 to-indigo-500 opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
      />
    </div>
    
    <main className="flex-1">
      <HeroTop />
      <HeroMiddle />
      <FAQ />
    </main>
    <Footer />
  </div>
);

export default Home;
