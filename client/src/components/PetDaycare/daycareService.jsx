import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DaycareHero from "./components/DaycareHero/daycareHero";
import DaycareFeatured from "./components/Featured/daycareFeatured";
import DaycareCTA from "./components/DaycareCTA/DycareCTA";
import ServiceShowcase from "./components/Services Showcase/serviceShowcase";
import DaycareReviews from "./components/DaycareReviews/daycareReviews";
import CaretakerCards from "./components/CareTaker/CareTakerCards/caretakerCards";

import AuthModal from "../Auth/AuthModal/authModal";
import { openAuthModal } from "../../utils/authModalNavigation";

const DaycareService = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [joinRole, setJoinRole] = useState(null);

  const caretakerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToCaretakers = () => {
    caretakerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isAuthenticated = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

  const openFormFromCaretaker = (caretaker, serviceType) => {
    if (!isAuthenticated()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    const selected = typeof serviceType === "string" ? serviceType : "";
    const selectedProviderId = caretaker?._id || "";
    const queryParts = [];
    if (selected) queryParts.push(`service=${encodeURIComponent(selected)}`);
    if (selectedProviderId) queryParts.push(`providerId=${encodeURIComponent(selectedProviderId)}`);
    queryParts.push("providerType=caretaker");
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";
    navigate(`/book/daycare${query}`, {
      state: {
        from: location.pathname,
        caretaker: caretaker || null,
      },
    });
  };

  const handleJoinRole = (role) => {
    setJoinRole(role);
    setShowAuthModal(true);
  };

  return (
    <>
      <DaycareHero onBookClick={scrollToCaretakers} />

      <div ref={caretakerRef}>
        <CaretakerCards onBookNow={openFormFromCaretaker} />
      </div>

      <ServiceShowcase onJoinNow={handleJoinRole} />
      <DaycareCTA onBookNow={scrollToCaretakers} />
      <DaycareFeatured />
      <DaycareReviews />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setJoinRole(null);
        }}
        defaultView="signup"
        selectedRole={joinRole}
      />
    </>
  );
};

export default DaycareService;
