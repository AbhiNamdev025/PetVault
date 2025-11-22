import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
    } catch {
      toast.error("Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    const filtered = pets.filter((pet) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        pet.name.toLowerCase().includes(s) ||
        pet.breed.toLowerCase().includes(s);

      const matchesType = filterType === "all" || pet.type === filterType;
      const matchesGender =
        filterGender === "all" || pet.gender === filterGender;

      return matchesSearch && matchesType && matchesGender;
    });

    setFilteredPets(filtered);
  };

  const handleViewPet = (petId) => {
    navigate(`/shop-pets/${petId}`);
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

      if (!pet || !pet.shopId) {
        toast.error("Shop ID missing");
        return;
      }

      const shopId =
        typeof pet.shopId === "string" ? pet.shopId : pet.shopId._id;

      const formatPetType = (t) =>
        t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();

      const shopRes = await fetch(`${API_BASE_URL}/user/${shopId}`);
      const shop = await shopRes.json();

      const appointmentBody = {
        providerType: "shop",
        providerId: shopId,
        service: "shop",
        petName: pet.name,
        petType: formatPetType(pet.type),
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

      await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryData.name,
          email: enquiryData.email,
          phone: enquiryData.phone,
          message: enquiryData.message,
          petId: pet._id,
          petName: pet.name,
          shopEmail: shop.email,
          shopName: shop.name,
          appointmentId: appointment._id,
        }),
      });

      toast.success("Enquiry sent");
      setShowEnquiryModal(false);
    } catch (err) {
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
              Adopt a loving pet today and give them the home they deserve.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>Happy Pets</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Families Matched</span>
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
            {categories.map((c) => (
              <button
                key={c.value}
                className={`${styles.categoryButton} ${
                  filterType === c.value ? styles.active : ""
                }`}
                onClick={() => setFilterType(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.resultsInfo}>
          <h2>Available Pets</h2>
          <span className={styles.resultsCount}>
            {filteredPets.length} pets found
          </span>
        </div>

        <PetGrid
          pets={filteredPets}
          onView={handleViewPet}
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
