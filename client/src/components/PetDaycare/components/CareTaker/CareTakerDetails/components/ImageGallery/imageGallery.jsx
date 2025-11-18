import React from "react";
import { Images } from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";
import styles from "./imageGallery.module.css";

export default function ImageGallery({
  caretaker,
  roleImages,
  mainImage,
  selectedImageIndex,
  setSelectedImageIndex,
  availabilityInfo,
}) {
  return (
    <div className={styles.leftImgBox}>
      <img src={mainImage} alt={caretaker.name} className={styles.img} />

      {roleImages.length > 1 && (
        <div className={styles.imageThumbnails}>
          {roleImages.map((img, index) => (
            <img
              key={index}
              src={
                img
                  ? `${BASE_URL}/uploads/roleImages/${img}`
                  : "https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png"
              }
              className={`${styles.thumbnail} ${
                selectedImageIndex === index ? styles.thumbnailActive : ""
              }`}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>
      )}

      <div
        className={styles.availabilityBadge}
        style={{ borderColor: availabilityInfo.color }}
      >
        {availabilityInfo.icon}
        <span style={{ color: availabilityInfo.color }}>
          {availabilityInfo.text}
        </span>
      </div>

      {roleImages.length > 0 && (
        <div className={styles.imageCountBadge}>
          <Images size={16} /> {roleImages.length} Photos
        </div>
      )}
    </div>
  );
}
