import React from 'react';
import HeroTop from '../components/hero_landing/top';
import HeroMiddle from '../components/hero_landing/middle';
import Footer from '../components/hero_landing/footer';

const Home: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <main className="flex-1">
      <HeroTop />
      <HeroMiddle />
    </main>
    <Footer />
  </div>
);

export default Home;
