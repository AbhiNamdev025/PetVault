import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Stethoscope,
  Home,
  ShoppingBag,
  Users,
  Shield,
} from "lucide-react";
import styles from "./servicesGrid.module.css";

const ServicesGrid = () => {
  const services = [
    {
      icon: <Stethoscope size={48} strokeWidth={1.5} />,
      title: "Vet Services",
      description:
        "Professional veterinary care for your beloved pets with expert doctors",
      link: "/vet-services",
      color: "#a78bfa",
    },
    {
      icon: <Home size={48} strokeWidth={1.5} />,
      title: "Pet Adoption",
      description:
        "Find your perfect furry companion and give them a forever home",
      link: "/pet-adoption",
      color: "#ec4899",
    },
    {
      icon: <ShoppingBag size={48} strokeWidth={1.5} />,
      title: "Pet Shop",
      description: "Quality pets from trusted breeders with health guarantee",
      link: "/pet-shop",
      color: "#3b82f6",
    },
    {
      icon: <Heart size={48} strokeWidth={1.5} />,
      title: "Pet Daycare",
      description: "Safe and fun daycare for your pets while you are away",
      link: "/pet-daycare",
      color: "#f59e0b",
    },
    {
      icon: <Shield size={48} strokeWidth={1.5} />,
      title: "Pet Products",
      description: "Premium products for pet care, food, and accessories",
      link: "/pet-products",
      color: "#10b981",
    },
    {
      icon: <Users size={48} strokeWidth={1.5} />,
      title: "Pet Training",
      description: "Professional training sessions for better pet behavior",
      link: "/vet-services",
      color: "#8b5cf6",
    },
  ];

  return (
    <section className={styles.services}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <p className={styles.sectionSubtitle}>
            Complete care for your furry friends. We provide everything your pet
            needs for a happy and healthy life.
          </p>
        </div>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <Link key={index} to={service.link} className={styles.serviceCard}>
              <div
                className={styles.serviceIcon}
                style={{ backgroundColor: service.color }}
              >
                {service.icon}
              </div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              <div className={styles.serviceArrow}>Learn More →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
