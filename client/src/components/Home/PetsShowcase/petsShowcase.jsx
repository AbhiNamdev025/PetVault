import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./petsShowcase.module.css";

const PetsShowcase = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPets();
  }, []);

  const fetchFeaturedPets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const featuredPets = (data.pets || []).filter(
          (pet) => pet.featured === true
        );
        setPets(featuredPets);
      } else {
        toast.error("Failed to load featured pets");
      }
    } catch (error) {
      console.error("Error fetching featured pets:", error);
      toast.error("Error fetching featured pets");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading pets...</div>;
  }

  return (
    <section className={styles.showcase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Meet Our Featured Pets</h2>
          <p className={styles.subtitle}>
            Find your perfect companion from our most loved pets
          </p>
        </div>

        {pets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No featured pets available right now.</p>
          </div>
        ) : (
          <div className={styles.petsFlex}>
            {pets.map((pet) => (
              <div key={pet._id} className={styles.petCard}>
                <div className={styles.imageContainer}>
                  {pet.images && pet.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/uploads/pets/${pet.images[0]}`}
                      alt={pet.name}
                      className={styles.petImage}
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                  <button className={styles.heartButton}>
                    <Heart size={20} />
                  </button>
                </div>

                <div className={styles.petInfo}>
                  <h3 className={styles.petName}>{pet.name}</h3>
                  <p className={styles.petBreed}>{pet.breed}</p>
                  <div className={styles.petDetails}>
                    <span className={styles.petAge}>
                      Age : {pet.age} {pet.ageUnit}
                    </span>
                  </div>

                  <button className={styles.adoptButton}>
                    {pet.category === "shop" ? "Buy Now" : "Adopt Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.ctaSection}>
          <Link to="/pet-adoption" className={styles.ctaButton}>
            View All Pets
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PetsShowcase;
