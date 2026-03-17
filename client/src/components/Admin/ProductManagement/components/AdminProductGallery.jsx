import React from "react";
import { Image as ImageIcon } from "lucide-react";
import styles from "../AdminProductDetail.module.css";

const AdminProductGallery = ({ images = [], baseUrl }) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.sectionPadding}>
        <h3 className={styles.sectionTitle}>Gallery</h3>
        <div className={styles.gallery}>
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div key={idx} className={styles.galleryItem}>
                <img src={`${baseUrl}/uploads/products/${img}`} alt="" />
              </div>
            ))
          ) : (
            <div className={styles.emptyGallery}>
              <ImageIcon size={20} /> No images
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductGallery;
