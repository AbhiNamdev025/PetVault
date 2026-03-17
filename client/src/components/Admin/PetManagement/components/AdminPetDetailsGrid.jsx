import React from "react";
import { Heart, IndianRupee } from "lucide-react";
import styles from "../AdminPetDetail.module.css";

const AdminPetDetailsGrid = ({ pet }) => {
  return (
    <div className={styles.detailsGrid}>
      <div className={styles.tableContainer}>
        <div className={styles.sectionPadding}>
          <h3 className={styles.sectionTitle}>Pet information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Description</label>
              <p className={styles.infoText}>
                {pet.description || "No description provided."}
              </p>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Details</label>
              <ul className={styles.infoList}>
                <li>
                  <span>Age</span>
                  <span>{pet.age} months</span>
                </li>
                <li>
                  <span>Gender</span>
                  <span>{pet.gender}</span>
                </li>
                <li>
                  <span>Vaccinated</span>
                  <span>{pet.vaccinated ? "Yes" : "No"}</span>
                </li>
                <li>
                  <span>Dewormed</span>
                  <span>{pet.dewormed ? "Yes" : "No"}</span>
                </li>
                <li>
                  <span>Availability</span>
                  <span>{pet.available ? "Available" : "Adopted/Sold"}</span>
                </li>
                <li>
                  <span>Status</span>
                  <span>{pet.isArchived ? "Archived" : "Active"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsColumn}>
        <div className={styles.statCard}>
          <IndianRupee />
          <div>
            <h3>₹{pet.price}</h3>
            <p>Adoption/Sale Price</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Heart />
          <div>
            <h3>{pet.available ? "Yes" : "No"}</h3>
            <p>Available for Adoption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPetDetailsGrid;
