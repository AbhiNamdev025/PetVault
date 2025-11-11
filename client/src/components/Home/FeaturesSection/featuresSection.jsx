import React from "react";
import { Shield, Heart, Clock, Users } from "lucide-react";
import styles from "./featuresSection.module.css";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield size={40} strokeWidth={2} />,
      title: "Safe & Secure",
      description:
        "All our pets are health-checked and vaccinated for your peace of mind",
    },
    {
      icon: <Heart size={40} strokeWidth={2} />,
      title: "Loving Care",
      description:
        "We treat every pet like family with compassion and dedication",
    },
    {
      icon: <Clock size={40} strokeWidth={2} />,
      title: "24/7 Support",
      description:
        "Round-the-clock veterinary services available whenever you need",
    },
    {
      icon: <Users size={40} strokeWidth={2} />,
      title: "Expert Team",
      description:
        "Licensed veterinarians and trained specialists at your service",
    },
  ];

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
          <p className={styles.sectionSubtitle}>
            We provide the best care and support for your furry friends
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
