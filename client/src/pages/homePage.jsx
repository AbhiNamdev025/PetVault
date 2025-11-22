import React from "react";
import HeroSection from "../components/Home/HeroSection/heroSection";
import FeaturesSection from "../components/Home/FeaturesSection/featuresSection";
import PetsShowcase from "../components/Home/PetsShowcase/petsShowcase";
import ServicesGrid from "../components/Home/ServicesGrid/servicesGrid";
import AbandonedPetReportSection from "../components/Home/AbandonPetSection/abandonedPetReport";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ServicesGrid />
      <PetsShowcase />
      <AbandonedPetReportSection />
    </div>
  );
};

export default HomePage;
