import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PetGrid from "./AdoptionPetGrid/adoptionPetGrid";
import styles from "./petAdoption.module.css";
import { API_BASE_URL } from "../../utils/constants";
import { HandHeart, Headset, PawPrint } from "lucide-react";
import { SearchFilterBar, SectionHeader } from "../common";
import FilterSidebar from "../common/FilterSidebar/FilterSidebar";
import { openAuthModal } from "../../utils/authModalNavigation";
import { useLocation } from "react-router-dom";

const PetAdoption = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    gender: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const isUserLoggedIn = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const filterOptions = [
    {
      id: "type",
      label: "Pet Type",
      values: [
        { id: "all", label: "All Pets" },
        { id: "dog", label: "Dogs" },
        { id: "cat", label: "Cats" },
        { id: "bird", label: "Birds" },
        { id: "rabbit", label: "Rabbits" },
        { id: "fish", label: "Fish" },
        { id: "other", label: "Others" },
      ],
    },
    {
      id: "gender",
      label: "Gender",
      values: [
        { id: "all", label: "All Genders" },
        { id: "male", label: "Male" },
        { id: "female", label: "Female" },
      ],
    },
  ];

  useEffect(() => {
    fetchPetsForAdoption();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, filters]);

  const fetchPetsForAdoption = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pets?populate=ngoId`);
      if (response.ok) {
        const data = await response.json();
        const adoptionPets = (data.pets || []).filter(
          (pet) => pet.category === "adoption" && pet.available,
        );
        setPets(adoptionPets);
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
    let filtered = pets.filter((pet) => {
      const q = filters.search.trim().toLowerCase();
      const ngoName = pet.ngoId?.businessName || pet.ngoId?.name || "";
      const searchMatch =
        !q ||
        [
          pet.name,
          pet.breed,
          pet.type,
          pet.description,
          pet.category,
          ngoName,
          pet.ngoId ? "ngo" : "",
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q),
        );

      const typeMatch = filters.type === "all" || pet.type === filters.type;
      const genderMatch =
        filters.gender === "all" || pet.gender === filters.gender;

      return searchMatch && typeMatch && genderMatch;
    });

    setFilteredPets(filtered);
  };

  const handleViewPet = (petId) => {
    navigate(`/adopt-pets/${petId}`);
  };

  const handleEnquiry = (pet) => {
    if (!isUserLoggedIn()) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }

    const ngoId = typeof pet.ngoId === "string" ? pet.ngoId : pet.ngoId?._id;
    if (!ngoId) {
      toast.error("NGO not found for this pet.");
      return;
    }

    const petType =
      typeof pet.type === "string" && pet.type.length > 0
        ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1).toLowerCase()
        : "";

    navigate(
      `/book/adoption?providerId=${ngoId}&service=pet_adoption&mode=enquiry&petId=${pet._id}&petName=${encodeURIComponent(
        pet.name || "",
      )}&petType=${encodeURIComponent(petType)}`,
      {
        state: {
          from: "/pet-adoption",
          petContext: {
            id: pet._id,
            name: pet.name || "",
            type: petType,
          },
        },
      },
    );
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.gender !== "all";

  return (
    <div className={styles.petShop}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() => setFilters({ search: "", type: "all", gender: "all" })}
      />
      {/* <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>
              <img
                src="/images/petAdoption/HeroAdoption.png"
                alt="Adopt a pet - happy dog and cat"
              />
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
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <PawPrint />
                  </span>
                  200+
                </span>
                <span className={styles.statLabel}>Pets Adopted</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {" "}
                  <span className={styles.statIcon}>
                    <HandHeart />
                  </span>
                  150+
                </span>
                <span className={styles.statLabel}>Families United</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {" "}
                  <span className={styles.statIcon}>
                    <Headset />
                  </span>
                  24/7
                </span>
                <span className={styles.statLabel}>Care & Support</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className={styles.heroSection}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/video/adoption/Adoption.mp4" type="video/mp4" />
        </video>

        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Find Your <span className={styles.highlight}>Forever Friend</span>{" "}
              Today
            </h1>
            <p className={styles.heroSubtitle}>
              Give a loving home to a pet — because every tail deserves
              a happy ending.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <PawPrint />
                  </span>
                  100+
                </span>
                <span className={styles.statLabel}>Pets Adopted</span>
              </div>

              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <HandHeart />
                  </span>
                  50+
                </span>
                <span className={styles.statLabel}>Families United</span>
              </div>

              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <Headset />
                  </span>
                  24/7
                </span>
                <span className={styles.statLabel}>Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <SectionHeader
          className={styles.resultsInfo}
          title="Available Pets"
          subtitle="Find pets by name, breed, and adoption filters."
          level="section"
          align="center"
          icon={<PawPrint />}
          actions={
            <SearchFilterBar
              searchPlaceholder="Search by name, breed, type, or NGO..."
              searchValue={filters.search}
              onSearchChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              resultText={`${filteredPets.length} ${filteredPets.length === 1 ? "pet" : "pets"} found`}
              showFilterButton
              onFilterClick={() => setShowFilters(true)}
              hasActiveFilters={hasActiveFilters}
              onClear={() =>
                setFilters({ search: "", type: "all", gender: "all" })
              }
            />
          }
        />

        <PetGrid
          pets={filteredPets}
          onViewPet={handleViewPet}
          onEnquiry={handleEnquiry}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PetAdoption;
