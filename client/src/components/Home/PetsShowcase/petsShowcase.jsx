import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import styles from "./petsShowcase.module.css";

const PetsShowcase = () => {
  const pets = [
    {
      id: 1,
      name: "Sheru",
      breed: "Golden Retriever",
      age: "2 months",
      location: "Jind, Haryana, India",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWmW-K1K6-QlVmI7PhAKjrYY9zfoH6qxYhLX2vgeT_I633ZQN60M-MkvW1J8bvK8ykya92EpGDnFrSIiAycCOB0QQrYa1racVvPrH869E",
    },
    {
      id: 2,
      name: "Lilly",
      breed: "Siamese Cat",
      age: "1 year",
      location: "Ambala, Haryana, India",
      image:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      name: "Ben",
      breed: "Rabbit",
      age: "6 months",
      location: "Karnal, Haryana, India",
      image:
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <section className={styles.showcase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Meet Our Pets</h2>
          <p className={styles.subtitle}>
            Find your perfect companion from our loving pets
          </p>
        </div>

        <div className={styles.petsFlex}>
          {pets.map((pet) => (
            <div key={pet.id} className={styles.petCard}>
              <div className={styles.imageContainer}>
                <img
                  src={pet.image}
                  alt={pet.name}
                  className={styles.petImage}
                />
                <button className={styles.heartButton}>
                  <Heart size={20} />
                </button>
              </div>

              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.name}</h3>
                <p className={styles.petBreed}>{pet.breed}</p>
                <div className={styles.petDetails}>
                  <span className={styles.petAge}>{pet.age}</span>
                  <div className={styles.location}>
                    <MapPin size={14} />
                    <span>{pet.location}</span>
                  </div>
                </div>

                <button className={styles.adoptButton}>Adopt Now</button>
              </div>
            </div>
          ))}
        </div>

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
