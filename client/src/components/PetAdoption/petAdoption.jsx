import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PetFilters from "../PetShop/PetFilters/petFilters";
import PetGrid from "./AdoptionPetGrid/adoptionPetGrid";
import EnquiryModal from "./AdoptionEnquiryModal/adoptionEnquiryModal";
import styles from "./petAdoption.module.css";
import { API_BASE_URL } from "../../utils/constants";
import Image from "../../../public/images/petAdoption/heroAdoption.png";

const PetAdoption = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  const categories = [
    { value: "all", label: "All Pets" },
    { value: "dog", label: "Dogs" },
    { value: "cat", label: "Cats" },
    { value: "bird", label: "Birds" },
    { value: "rabbit", label: "Rabbits" },
    { value: "fish", label: "Fish" },
    { value: "other", label: "Others" },
  ];

  useEffect(() => {
    fetchPetsForAdoption();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchTerm, filterType, filterGender]);

  const fetchPetsForAdoption = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pets?populate=ngoId`);
      if (response.ok) {
        const data = await response.json();
        const adoptionPets = (data.pets || []).filter(
          (pet) => pet.category === "adoption" && pet.available
        );
        setPets(adoptionPets);
      } else {
        toast.error("Failed to fetch pets");
      }
    } catch (error) {
      toast.error("Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = pets.filter((pet) => {
      const searchMatch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = filterType === "all" || pet.type === filterType;
      const genderMatch = filterGender === "all" || pet.gender === filterGender;

      return searchMatch && typeMatch && genderMatch;
    });

    setFilteredPets(filtered);
  };

  const handleViewPet = (petId) => {
    navigate(`/adopt-pets/${petId}`);
  };

  const handleEnquiry = (pet) => {
    setSelectedPet(pet);
    setShowEnquiryModal(true);
  };

  const handleEnquirySubmit = async (enquiryData) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      if (!token || !user) {
        toast.error("Please login first");
        return;
      }

      if (!selectedPet || !selectedPet.ngoId) {
        toast.error("NGO ID missing");
        return;
      }

      // NGO ID (same as shopId logic)
      const ngoId =
        typeof selectedPet.ngoId === "string"
          ? selectedPet.ngoId
          : selectedPet.ngoId._id;

      // FETCH NGO DETAILS
      const ngoRes = await fetch(`${API_BASE_URL}/user/${ngoId}`);
      const ngo = await ngoRes.json();

      if (!ngo || !ngo.email) {
        toast.error("NGO email not found");
        return;
      }

      // Create appointment
      const appointmentBody = {
        providerType: "ngo",
        providerId: ngoId,
        service: "pet_adoption",
        petName: selectedPet.name,
        petType: selectedPet.type,
        parentPhone: enquiryData.phone,
        date: enquiryData.preferredDate,
        time: enquiryData.preferredTime,
        reason: enquiryData.message,
        healthIssues: "N/A",
        userName: enquiryData.name,
        userEmail: enquiryData.email,
      };

      const appointmentRes = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentBody),
      });

      const appointment = await appointmentRes.json();

      // SEND ENQUIRY TO BACKEND
      await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryData.name,
          email: enquiryData.email,
          phone: enquiryData.phone,
          message: enquiryData.message,
          petId: selectedPet._id,
          petName: selectedPet.name,
          providerEmail: ngo.email,
          providerName: ngo.name || ngo.businessName,
          providerType: "ngo",
          appointmentId: appointment._id,
        }),
      });

      toast.success("Enquiry sent");
      setShowEnquiryModal(false);
      setSelectedPet(null);
    } catch (error) {
      toast.error("Failed to send enquiry");
    }
  };

  return (
    <div className={styles.petShop}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>
              <img src={Image} alt="Adopt a pet - happy dog and cat" />
            </div>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Find Your <span className={styles.highlight}>Forever Friend</span>{" "}
              Today
            </h1>
            <p className={styles.heroSubtitle}>
              Give a loving home to a rescued pet — because every tail deserves
              a happy ending.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>200+</span>
                <span className={styles.statLabel}>Pets Adopted</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>150+</span>
                <span className={styles.statLabel}>Families United</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Care & Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <PetFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onTypeChange={setFilterType}
          filterGender={filterGender}
          onGenderChange={setFilterGender}
        />

        <div className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>Browse by Category</h2>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.categoryButton} ${
                  filterType === category.value ? styles.active : ""
                }`}
                onClick={() => setFilterType(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.resultsInfo}>
          <h2>Available Pets</h2>
          <span className={styles.resultsCount}>
            {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}{" "}
            found
          </span>
        </div>

        <PetGrid
          pets={filteredPets}
          onViewPet={handleViewPet}
          onEnquiry={handleEnquiry}
          loading={loading}
        />
      </div>

      {showEnquiryModal && selectedPet && (
        <EnquiryModal
          pet={selectedPet}
          onClose={() => {
            setShowEnquiryModal(false);
            setSelectedPet(null);
          }}
          onSubmit={handleEnquirySubmit}
        />
      )}
    </div>
  );
};

export default PetAdoption;
