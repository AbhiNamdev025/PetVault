import React from "react";
import styles from "./vetCards.module.css";
import { Stethoscope, GraduationCap, MapPin } from "lucide-react";

const vets = [
  {
    id: 1,
    name: "Dr. Aisha Mehra",
    specialization: "Small Animal Surgery & Orthopedics",
    experience: "10+ Years Experience",
    location: "PetLife Clinic, Ambala",
    image:
      "https://t4.ftcdn.net/jpg/03/20/74/45/360_F_320744517_TaGkT7aRlqqWdfGUuzRKDABtFEoN5CiO.jpg",
    about:
      "Dr. Aisha is known for her compassionate approach and expertise in pet surgeries, vaccinations, and preventive care.",
  },
  {
    id: 2,
    name: "Dr. Karan Patel",
    specialization: "Exotic Animal Specialist",
    experience: "8+ Years Experience",
    location: "PetWell Center, Chandigarh",
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg",
    about:
      "Specializes in treating birds, rabbits, and reptiles. His gentle handling and holistic care make him a favorite among pet parents.",
  },
  {
    id: 3,
    name: "Dr. Sneha Verma",
    specialization: "Pet Nutrition & General Medicine",
    experience: "6+ Years Experience",
    location: "HealthyPaws Vet Hub, Zirakpur",
    image:
      "https://images.unsplash.com/photo-1659353888906-adb3e0041693?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVtYWxlJTIwZG9jdG9yfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
    about:
      "Dedicated to helping pets live healthier lives through balanced nutrition and modern veterinary care.",
  },
];

const VetCards = ({ onBookNow }) => {
  return (
    <section className={styles.vetCardsSection}>
      <h2 className={styles.heading}>Meet Our Trusted Veterinarians</h2>
      <div className={styles.cardsContainer}>
        {vets.map((vet, index) => (
          <div
            key={vet.id}
            className={`${styles.card} ${
              index % 2 === 0 ? styles.normal : styles.reverse
            }`}
          >
            <div className={styles.imageWrapper}>
              <img src={vet.image} alt={vet.name} className={styles.image} />
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>
                <Stethoscope className={styles.icon} />
                {vet.name}
              </h3>
              <p className={styles.specialization}>{vet.specialization}</p>
              <div className={styles.meta}>
                <span>
                  <GraduationCap size={16} /> {vet.experience}
                </span>
                <span>
                  <MapPin size={16} /> {vet.location}
                </span>
              </div>
              <p className={styles.about}>{vet.about}</p>
              <button
                className={styles.bookButton}
                onClick={() => onBookNow(vet)}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VetCards;
