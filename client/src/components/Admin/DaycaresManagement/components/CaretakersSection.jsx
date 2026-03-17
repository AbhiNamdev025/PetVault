import React from "react";
import { Heart } from "lucide-react";
import styles from "../daycareDetail.module.css";

const CaretakersSection = ({ caretakers, baseUrl, onRowClick }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Heart size={20} />
        <h2>Caretakers</h2>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Caretaker Name</th>
              <th>Experience</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {caretakers.length > 0 ? (
              caretakers.map((caretaker) => (
                <tr
                  key={caretaker._id}
                  className={`${styles.clickableRow} ${
                    caretaker.isArchived ? styles.archivedRow : ""
                  }`}
                  onClick={() => onRowClick(caretaker)}
                >
                  <td data-label="Caretaker Name">
                    <div className={styles.caretakerName}>
                      {caretaker.image ? (
                        <img
                          src={`${baseUrl}/uploads/roleImages/${caretaker.image}`}
                          alt={caretaker.name}
                          className={styles.caretakerImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {caretaker.name[0]}
                        </div>
                      )}
                      <span>{caretaker.name}</span>
                      {caretaker.isArchived && (
                        <span className={styles.archivedBadge}>Archived</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Experience">
                    {caretaker.experience} years
                  </td>
                  <td data-label="Contact">{caretaker.email}</td>
                  <td data-label="Status">
                    <span className={styles.activeBadge}>
                      {caretaker.isArchived ? "Inactive" : "Active"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No caretakers registered in this daycare
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaretakersSection;
