import React from "react";
import { Plus } from "lucide-react";
import styles from "../serviceManagement.module.css";
import ServiceCard from "./ServiceCard";
import { Button } from "../../../common";
const ServiceGrid = ({
  services,
  baseUrl,
  onAdd,
  onEdit,
  onDelete
}) => {
  return <div className={styles.servicesGrid}>
      {services.length === 0 ? <div className={styles.emptyState}>
          <p>No services found</p>
          <Button className={styles.addButton} onClick={onAdd} variant="primary" size="md">
            <Plus size={20} />
            Add Your First Service
          </Button>
        </div> : services.map(service => <ServiceCard key={service._id} service={service} baseUrl={baseUrl} onEdit={onEdit} onDelete={onDelete} />)}
    </div>;
};
export default ServiceGrid;
