import React, { useState } from "react";
import {
  PawPrint,
  Heart,
  Bone,
  Stethoscope,
  Syringe,
  Ambulance,
  Dog,
  Cat,
  Pill,
} from "lucide-react";
import ServiceBookingForm from "../../../PetDaycare/components/ServicesBooking/serviceBookingForm";
import styles from "./vetHero.module.css";

const VetHero = () => {
  const [showForm, setShowForm] = useState(false);

  const features = [
    {
      id: 1,
      icon: <Stethoscope size={22} strokeWidth={1.6} />,
      text: "Top Vets",
    },
    {
      id: 2,
      icon: <Syringe size={22} strokeWidth={1.6} />,
      text: "150k+ Pets Healed",
    },
    {
      id: 3,
      icon: <Ambulance size={22} strokeWidth={1.6} />,
      text: "24×7 Care",
    },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.floatingIcons}>
        <div className={`${styles.icon} ${styles.paw1}`}>
          <PawPrint size={40} />
        </div>
        <div className={`${styles.icon} ${styles.heart1}`}>
          <Heart size={38} />
        </div>
        <div className={`${styles.icon} ${styles.bone1}`}>
          <Bone size={42} />
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.iconGroup}>
            <PawPrint className={`${styles.sideIcon} ${styles.iconTopLeft}`} />
            <Bone className={`${styles.sideIcon} ${styles.iconTopRight}`} />
            <Dog className={`${styles.sideIcon} ${styles.iconBottomLeft}`} />
            <Heart className={`${styles.sideIcon} ${styles.iconBottomRight}`} />
          </div>

          <img
            src="https://img.freepik.com/free-photo/veterinarian-check-ing-puppy-s-health_23-2148728396.jpg?semt=ais_hybrid&w=740&q=80"
            className={styles.petImage}
            alt="Pet"
          />
        </div>

        <div className={styles.center}>
          <h1 className={styles.title}>
            Compassionate Veterinary Care for Your Pets 🩺
          </h1>

          <p className={styles.subtitle}>
            Experienced veterinarians, modern facilities, and heartfelt care —
            because your pets deserve nothing less.
          </p>

          <button
            className={styles.bookButton}
            onClick={() => setShowForm(true)}
          >
            Book Appointment
          </button>

          <div className={styles.featureCards}>
            {features.map((f) => (
              <div key={f.id} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <p className={styles.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.iconGroup}>
            <Pill className={`${styles.sideIcon} ${styles.iconTopLeft}`} />
            <Cat className={`${styles.sideIcon} ${styles.iconTopRight}`} />
            <Heart className={`${styles.sideIcon} ${styles.iconBottomLeft}`} />
            <Stethoscope
              className={`${styles.sideIcon} ${styles.iconBottomRight}`}
            />
          </div>

          <img
            src="https://www.shutterstock.com/image-photo/young-handsome-veterinarian-petting-noble-600nw-2285054231.jpg"
            className={styles.vetImage}
            alt="Veterinarian"
          />
        </div>
      </div>

      {showForm && (
        <ServiceBookingForm
          defaultService="Vet Appointment"
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
};

export default VetHero;
