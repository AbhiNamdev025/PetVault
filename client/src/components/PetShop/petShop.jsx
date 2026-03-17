import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PetGrid from "../PetShop/PetGrid/petGrid";
import styles from "./petShop.module.css";
import { API_BASE_URL } from "../../utils/constants";
import { HandHeart, Headset, PawPrint } from "lucide-react";
import { SearchFilterBar, SectionHeader } from "../common";
import FilterSidebar from "../common/FilterSidebar/FilterSidebar";
import { openAuthModal } from "../../utils/authModalNavigation";
import { useLocation } from "react-router-dom";

const PetShop = () => {
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
    fetchPetsForSale();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, filters]);

  const fetchPetsForSale = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pets?populate=shopId`);
      if (response.ok) {
        const data = await response.json();
        const petsForSale = (data.pets || []).filter(
          (pet) => pet.category === "shop" && pet.available,
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
      const q = filters.search.trim().toLowerCase();
      const shopName = pet.shopId?.businessName || pet.shopId?.name || "";
      const matchesSearch =
        !q ||
        [
          pet.name,
          pet.breed,
          pet.type,
          pet.description,
          pet.category,
          shopName,
          "shop",
        ].some((value) => String(value || "").toLowerCase().includes(q));

      const matchesType = filters.type === "all" || pet.type === filters.type;
      const matchesGender =
        filters.gender === "all" || pet.gender === filters.gender;

      return matchesSearch && matchesType && matchesGender;
    });

    setFilteredPets(filtered);
  };

  const handleViewPet = (petId) => {
    navigate(`/shop-pets/${petId}`);
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

    const shopId =
      typeof pet.shopId === "string" ? pet.shopId : pet.shopId?._id;
    if (!shopId) {
      toast.error("Shop not found for this pet.");
      return;
    }

    const petType =
      typeof pet.type === "string" && pet.type.length > 0
        ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1).toLowerCase()
        : "";

    navigate(
      `/book/shop?providerId=${shopId}&service=shop&mode=enquiry&petId=${pet._id}&petName=${encodeURIComponent(
        pet.name || "",
      )}&petType=${encodeURIComponent(petType)}`,
      {
        state: {
          from: "/pet-shop",
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
      <div className={styles.heroSection}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/video/shop/Shop.mp4" type="video/mp4" />
        </video>

        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.header}>
              <h1 className={styles.heroTitle}>
                Find Your Perfect{" "}
                <span className={styles.highlight}>Companion</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Adopt a loving pet today and give them the home they deserve.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <PawPrint size={35} />
                  </span>
                  100+
                </span>
                <span className={styles.statLabel}>Happy Pets</span>
              </div>

              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <HandHeart size={35} />
                  </span>
                  50+
                </span>
                <span className={styles.statLabel}>Families Matched</span>
              </div>

              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  <span className={styles.statIcon}>
                    <Headset size={35} />
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
          subtitle="Browse pets and refine results with search and filters."
          level="section"
          align="center"
          icon={<PawPrint />}
          actions={
            <SearchFilterBar
              searchPlaceholder="Search by name, breed, type, or shop..."
              searchValue={filters.search}
              onSearchChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              resultText={`${filteredPets.length} pets found`}
              showFilterButton
              onFilterClick={() => setShowFilters(true)}
              hasActiveFilters={hasActiveFilters}
              onClear={() => setFilters({ search: "", type: "all", gender: "all" })}
            />
          }
        />

        <PetGrid
          pets={filteredPets}
          onView={handleViewPet}
          onEnquiry={handleEnquiry}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PetShop;
