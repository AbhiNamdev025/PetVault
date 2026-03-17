import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Stethoscope,
  Home,
  ShoppingBag,
  Users,
  Shield,
  BriefcaseBusiness,
} from "lucide-react";
import styles from "./servicesGrid.module.css";
import { SectionHeader } from "../../common";

const ServicesGrid = () => {
  const services = [
    {
      icon: <Stethoscope size={48} strokeWidth={1.5} />,
      title: "Vet Services",
      description:
        "Professional veterinary care for your beloved pets with expert doctors",
      link: "/vet-services",
      color: "var(--color-primary-400)",
    },
    {
      icon: <Home size={48} strokeWidth={1.5} />,
      title: "Pet Adoption",
      description:
        "Find your perfect furry companion and give them a forever home",
      link: "/pet-adoption",
      color: "var(--color-secondary-500)",
    },
    {
      icon: <ShoppingBag size={48} strokeWidth={1.5} />,
      title: "Pet Shop",
      description: "Quality pets from trusted breeders with health guarantee",
      link: "/pet-shop",
      color: "var(--color-info)",
    },
    {
      icon: <Heart size={48} strokeWidth={1.5} />,
      title: "Pet Daycare",
      description: "Safe and fun daycare for your pets while you are away",
      link: "/pet-daycare",
      color: "var(--color-warning)",
    },
    {
      icon: <Shield size={48} strokeWidth={1.5} />,
      title: "Pet Products",
      description: "Premium products for pet care, food, and accessories",
      link: "/pet-products",
      color: "var(--color-success)",
    },
    {
      icon: <Users size={48} strokeWidth={1.5} />,
      title: "Pet Training",
      description: "Professional training sessions for better pet behavior",
      link: "/pet-daycare",
      color: "var(--color-primary-600)",
    },
  ];

  return (
    <section className={styles.services}>
      <div className={styles.container}>
        <SectionHeader
          className={styles.sectionHeader}
          align="center"
          level="section"
          icon={<BriefcaseBusiness size={32} className={styles.titleIcon} />}
          title="Our Services"
          subtitle="Complete care for your furry friends. We provide everything your pet needs for a happy and healthy life."
        />
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
