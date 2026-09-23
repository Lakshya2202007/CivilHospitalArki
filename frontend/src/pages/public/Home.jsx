import React from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import FeatureCards from '../../components/FeatureCards';
import HospitalServices from '../../components/HospitalServices';
import InfoSection from '../../components/InfoSection';
import Footer from '../../components/Footer';

const Home = () => {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <FeatureCards />
      <HospitalServices />
      <InfoSection />
      <Footer />
    </div>
  );
};

export default Home;
