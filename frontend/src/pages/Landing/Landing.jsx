import React from 'react';
import Hero from '../../components/landing/Hero';
import TrustIndicators from '../../components/landing/TrustIndicators';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Modules from '../../components/landing/Modules';
import WhyChooseUs from '../../components/landing/WhyChooseUs';
import CTA from '../../components/landing/CTA';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <TrustIndicators />
      <Features />
      <HowItWorks />
      <Modules />
      <WhyChooseUs />
      <CTA />
    </div>
  );
};

export default Landing;