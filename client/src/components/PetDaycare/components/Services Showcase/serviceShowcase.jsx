import React, { useState, useEffect } from "react";
import styles from "./serviceShowcase.module.css";
import { PawPrint, Clock, CheckCircle } from "lucide-react";
import { BASE_URL, API_BASE_URL } from "../../../../utils/constants";
import ServiceBookingForm from "../ServicesBooking/serviceBookingForm";

const ServiceShowcase = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`);
        const data = await res.json();
        if (res.ok) setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className={styles.serviceSection}>
      <h2 className={styles.title}>Our Pet Care Services</h2>
      <p className={styles.subtitle}>
        Premium care for your furry companions — safe, loving, and professional 🐾
      </p>

      <div className={styles.cardGrid}>
        {services.map((service) => (
          <div className={styles.card} key={service._id}>
            <div className={styles.imageContainer}>
              {service.images && service.images.length > 0 ? (
                <img
                  src={`${BASE_URL}/uploads/services/${service.images[0]}`}
                  alt={service.name}
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.noImage}>
                  <PawPrint size={36} />
                </div>
              )}
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{service.name}</h3>
              <p className={styles.description}>{service.description}</p>

              <div className={styles.features}>
                {service.features.map((feature, idx) => (
                  <div key={idx} className={styles.featureItem}>
                    <CheckCircle size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className={styles.details}>
                <div className={styles.detail}>
                  <span>₹{service.price}</span>
                </div>
                <div className={styles.detail}>
                  <Clock size={18} />
                  <span>{service.duration} mins</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedService({ type: service.name });
                  setShowForm(true);
                }}
                className={styles.bookButton}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ServiceBookingForm
          defaultService={selectedService?.type}
          onClose={() => {
            setShowForm(false);
            setSelectedService(null);
          }}
        />
      )}
    </section>
  );
};

export default ServiceShowcase;
