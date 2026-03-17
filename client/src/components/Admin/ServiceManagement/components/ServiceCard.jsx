import React from "react";
import { Edit, Trash2, Image } from "lucide-react";
import styles from "../serviceManagement.module.css";
import { Button } from "../../../common";
const ServiceCard = ({
  service,
  baseUrl,
  onEdit,
  onDelete
}) => {
  const imageSrc = service.images && service.images.length > 0 ? service.images[0].startsWith("http") ? service.images[0] : `${baseUrl}/uploads/services/${service.images[0]}` : null;
  return <div className={styles.serviceCard}>
      <div className={styles.serviceImage}>
        {imageSrc ? <img src={imageSrc} alt={service.name} /> : <div className={styles.noImage}>
            <Image size={28} /> No Image
          </div>}
      </div>

      <div className={styles.serviceInfo}>
        <h3>{service.name}</h3>
        <p className={styles.desc}>{service.description}</p>
        {service.features?.length > 0 && <ul className={styles.featuresList}>
            {service.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>}
        <div className={styles.details}>
          <span className={styles.type}>{service.type}</span>
          {!service.name.startsWith("For ") && <>
              <span>{service.duration} min</span>
              <span>₹{service.price}</span>
            </>}
          <span className={service.available ? styles.available : styles.unavailable}>
            {service.available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className={styles.actions}>
          <Button className={styles.editBtn} onClick={() => onEdit(service)} variant="primary" size="md">
            <Edit size={16} /> Edit
          </Button>
          <Button className={styles.deleteBtn} onClick={() => onDelete(service)} variant="danger" size="md">
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>
    </div>;
};
export default ServiceCard;
