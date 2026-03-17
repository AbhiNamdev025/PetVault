import React from "react";
import styles from "../AdminPetDetail.module.css";

const AdminPetGallery = ({ images = [], baseUrl }) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.sectionPadding}>
        <h3 className={styles.sectionTitle}>Gallery</h3>
        <div className={styles.gallery}>
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div key={idx} className={styles.galleryItem}>
                <img src={`${baseUrl}/uploads/pets/${img}`} alt="" />
              </div>
            ))
          ) : (
            <div className={styles.emptyGallery}>No images</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPetGallery;
