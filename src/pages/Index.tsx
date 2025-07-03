
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import SearchByStateSection from '@/components/SearchByStateSection';
import GettingStartedSection from '@/components/GettingStartedSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <HeroSection />
      <ServicesSection />
      <SearchByStateSection />
      <GettingStartedSection />
      <Footer />
    </div>
  );
};

export default Index;
