// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import PetFilters from "../PetShop/PetFilters/petFilters";
// import PetGrid from "../PetShop/PetGrid/petGrid";
// import EnquiryModal from "../PetShop/EnquiryModal/enquiryModal";
// import styles from "./petShop.module.css";
// import { API_BASE_URL } from "../../utils/constants";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PetFilters from "../PetShop/PetFilters/petFilters";
import PetGrid from "../PetShop/PetGrid/petGrid";
import EnquiryModal from "../PetShop/EnquiryModal/enquiryModal";
import styles from "./petShop.module.css";
import { API_BASE_URL } from "../../utils/constants";
import Image from "../../../public/images/petShop/Heropetshop.png";

const PetShop = () => {
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
    fetchPetsForSale();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchTerm, filterType, filterGender]);

  const fetchPetsForSale = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pets`);

      if (response.ok) {
        const data = await response.json();
        const petsForSale = (data.pets || []).filter(
          (pet) => pet.category === "shop" && pet.available
        );
        setPets(petsForSale);
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
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || pet.type === filterType;
      const matchesGender =
        filterGender === "all" || pet.gender === filterGender;

      return matchesSearch && matchesType && matchesGender;
    });

    setFilteredPets(filtered);
  };

  const handleViewPet = (petId) => {
    navigate(`/pets/${petId}`);
  };

  const handleEnquiry = (pet) => {
    setSelectedPet(pet);
    setShowEnquiryModal(true);
  };

  const handleEnquirySubmit = async (enquiryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...enquiryData,
          petId: selectedPet._id,
          petName: selectedPet.name,
        }),
      });

      if (response.ok) {
        toast.success("Enquiry sent successfully!");
        setShowEnquiryModal(false);
        setSelectedPet(null);
      } else {
        toast.error("Failed to send enquiry");
      }
    } catch (error) {
      toast.error("Failed to send enquiry");
    }
  };

  return (
    <div className={styles.petShop}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Find Your Perfect{" "}
              <span className={styles.highlight}>Companion</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover loving pets waiting for their forever home. From playful
              puppies to graceful cats, we help you find the perfect match for
              your family and lifestyle.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>Happy Pets</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Loving Families</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Support</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>
              <img src={Image} alt="heroImage" />
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

export default PetShop;
