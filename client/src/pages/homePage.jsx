import React from "react";
import HeroSection from "../components/Home/HeroSection/heroSection";
import FeaturesSection from "../components/Home/FeaturesSection/featuresSection";
import PetsShowcase from "../components/Home/PetsShowcase/petsShowcase";
import ServicesGrid from "../components/Home/ServicesGrid/servicesGrid";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ServicesGrid />
      <PetsShowcase />
    </div>
  );
};

export default HomePage;
