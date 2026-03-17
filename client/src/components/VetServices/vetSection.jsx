import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VetHero from "./components/VetHero/vetHero";
import VetCards from "./components/VetCards/vetCards";
import VetCTA from "./components/VetCTA/vetCta";
import VetReviews from "./components/VetReviews/vetReviews";
import VetFeatures from "./components/VetFeatures/vetFeatures";
import { openAuthModal } from "../../utils/authModalNavigation";

const VetSection = () => {
  const vetCardsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToVetCards = () => {
    vetCardsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isAuthenticated = () =>
    !!(localStorage.getItem("token") || sessionStorage.getItem("token"));

  const openForm = (doctor) => {
    if (!doctor?._id) return;
    if (!isAuthenticated()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    navigate(`/book/vet?doctorId=${doctor._id}`, {
      state: {
        from: location.pathname,
        doctor,
      },
    });
  };

  return (
    <>
      <VetHero onBookClick={scrollToVetCards} />
      <div ref={vetCardsRef}>
        <VetCards onBookNow={openForm} />
      </div>

      <VetCTA onBookNow={scrollToVetCards} />
      <VetFeatures />
      <VetReviews />
    </>
  );
};

export default VetSection;
