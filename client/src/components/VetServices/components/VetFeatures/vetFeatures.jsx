import React from "react";
import styles from "./vetFeatures.module.css";
import {
  Stethoscope,
  Scissors,
  Activity,
  HeartPulse,
  Bone,
  Clock,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: <Stethoscope size={30} />,
    title: "Vet Consultation",
    points: [
      "Multiple Active OPDs",
      "Cat & Dog Specialists",
      "Multi-Speciality Senior Vets",
      "Spacious & Hygienic Clinics",
    ],
  },
  {
    id: 2,
    icon: <Scissors size={30} />,
    title: "Pet Grooming",
    points: [
      "Cat & Dog Baths",
      "Haircuts & Styling",
      "Tick & Flea Treatments",
      "Skin & Coat Care",
    ],
  },
  {
    id: 3,
    icon: <Activity size={30} />,
    title: "Diagnostics",
    points: ["Blood Test", "USG / X-ray", "Endoscopy", "Dental Checkups"],
  },
  {
    id: 4,
    icon: <Bone size={30} />,
    title: "Surgery",
    points: [
      "Spaying & Neutering",
      "Cancer & Tumor Removal",
      "Orthopedic & Hernia Surgery",
      "Post-Op Care",
    ],
  },
  {
    id: 5,
    icon: <HeartPulse size={30} />,
    title: "Pet Physiotherapy",
    points: [
      "Post-Surgery Recovery",
      "Hip Dysplasia",
      "Pain Management",
      "Arthritis & Mobility Therapy",
    ],
  },
  {
    id: 6,
    icon: <Clock size={30} />,
    title: "24×7 Emergency Care",
    points: [
      "Round-the-Clock Vet Team",
      "ICU & Oxygen Support",
      "Emergency Surgery",
      "Blood Transfusion",
    ],
  },
];

const VetFeatures = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          What to Expect When Visiting Our Veterinary Center
        </h2>
        <p className={styles.subtitle}>
          Trusted and compassionate care, from checkups to critical care 🩺
        </p>
      </div>

      <div className={styles.grid}>
        {features.map((f) => (
          <div key={f.id} className={styles.card}>
            <div className={styles.icon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <ul className={styles.list}>
              {f.points.map((p, index) => (
                <li key={index}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VetFeatures;
