import React, { useState } from "react";
import HeroSection from "../../components/Home/HeroSection/heroSection";
import FeaturesSection from "../../components/Home/FeaturesSection/featuresSection";
import PetsShowcase from "../../components/Home/PetsShowcase/petsShowcase";
import ServicesGrid from "../../components/Home/ServicesGrid/servicesGrid";
import AbandonedPetReportSection from "../../components/Home/AbandonPetSection/abandonedPetReport";
import ServiceShowcase from "../../components/PetDaycare/components/Services Showcase/serviceShowcase";
import AuthModal from "../../components/Auth/AuthModal/authModal";

const HomePage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleJoinNow = (role) => {
    setSelectedRole(role);
    setShowAuthModal(true);
  };

  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ServicesGrid />
      <ServiceShowcase onJoinNow={handleJoinNow} />
      <AbandonedPetReportSection />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView="signup"
        selectedRole={selectedRole}
      />
    </div>
  );
};

export default HomePage;
