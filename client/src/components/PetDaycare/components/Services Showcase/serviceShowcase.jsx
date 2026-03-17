import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Stethoscope,
  Store,
  PawPrint,
  Heart,
  ArrowRight,
  Handshake,
} from "lucide-react";
import styles from "./serviceShowcase.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { ShowcaseSkeleton } from "../../../Skeletons/index";
import { Button, SectionHeader } from "../../../common";
const ServiceShowcase = ({ onJoinNow }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`);
        const data = await res.json();
        if (res.ok) {
          // Filter to only show the "Recruitment" versions of these services by name
          const filtered = data.filter((s) => s.name.startsWith("For "));
          setServices(filtered);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);
  const handleRegister = (role) => {
    if (onJoinNow) {
      // Map 'vet' to 'hospital' for the register form
      onJoinNow(role === "vet" ? "hospital" : role);
    }
  };
  const getIcon = (type) => {
    switch (type) {
      case "vet":
        return <Stethoscope size={20} />;
      case "shop":
        return <Store size={20} />;
      case "daycare":
        return <PawPrint size={20} />;
      case "ngo":
        return <Heart size={20} />;
      default:
        return <PawPrint size={20} />;
    }
  };
  const getCategoryName = (type) => {
    switch (type) {
      case "vet":
        return "Veterinary Clinics";
      case "shop":
        return "Retail Stores";
      case "daycare":
        return "Daycare & Boarding";
      case "ngo":
        return "NGOs & Shelters";
      default:
        return type;
    }
  };
  const getBtnText = (type) => {
    switch (type) {
      case "vet":
        return "Join as a Clinic";
      case "shop":
        return "Join as a Retailer";
      case "daycare":
        return "Join as a Provider";
      case "ngo":
        return "Join as an NGO";
      default:
        return "Join Now";
    }
  };
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}/uploads/services/${imagePath}`;
  };
  return (
    <section className={styles.serviceSection}>
      <div className={styles.container}>
        <SectionHeader
          className={styles.headerArea}
          align="center"
          level="section"
          icon={<Handshake />}
          title={
            <>
              Partner with <span className={styles.brandText}>PetVault</span>
            </>
          }
          subtitle="Join the leading ecosystem for pet professionals. Grow your business and connect with verified pet owners seamlessly."
        />

        <div className={styles.cardList}>
          {loading ? (
            <ShowcaseSkeleton count={3} />
          ) : (
            services.map((service) => (
              <div key={service._id} className={styles.card}>
                <div className={styles.imageSection}>
                  <img
                    src={getImageUrl(service.images[0])}
                    alt=""
                    className={styles.cardImg}
                  />
                  <div className={styles.categoryOverlay}>
                    <h3>{getCategoryName(service.type)}</h3>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconCircle}>
                      {getIcon(service.type)}
                    </div>
                    <div className={styles.titleGroup}>
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                    </div>
                  </div>

                  <ul className={styles.features}>
                    {(service.features || []).map((feature, idx) => (
                      <li key={idx}>
                        <div className={styles.checkWrapper}>
                          <CheckCircle2
                            size={16}
                            className={styles.checkIcon}
                          />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={styles.ctaBtn}
                    onClick={() => handleRegister(service.type)}
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight size={18} className={styles.ctaIcon} />}
                  >
                    {getBtnText(service.type)}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
export default ServiceShowcase;
