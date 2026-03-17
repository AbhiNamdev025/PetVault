import React, { useState } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import styles from "./imageManager.module.css";
import { BASE_URL } from "../../../../utils/constants";
import { Button } from "../../../common";
const ImageManager = ({
  existingImages = [],
  onNewImagesChange,
  onDeleteExisting,
}) => {
  const [newImages, setNewImages] = useState([]);
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const updated = [...newImages, ...files];
    setNewImages(updated);
    if (onNewImagesChange) onNewImagesChange(updated);
  };
  const removeNewImage = (index) => {
    const updated = newImages.filter((_, i) => i !== index);
    setNewImages(updated);
    if (onNewImagesChange) onNewImagesChange(updated);
  };
  return (
    <div className={styles.container}>
      <label className={styles.label}>Manage Gallery Images</label>

      <div className={styles.grid}>
        {/* Existing Images */}
        {existingImages.map((img, idx) => (
          <div key={`existing-${idx}`} className={styles.imageCard}>
            <img
              src={
                img.startsWith("http")
                  ? img
                  : `${BASE_URL}/uploads/roleImages/${img}`
              }
              alt={`Gallery ${idx}`}
              className={styles.image}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <Button
              type="button"
              className={styles.deleteBtn}
              onClick={() => onDeleteExisting(img)}
              variant="ghost"
              size="xs"
              aria-label="Remove image"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        ))}

        {/* New Images */}
        {newImages.map((file, idx) => (
          <div key={`new-${idx}`} className={styles.imageCard}>
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className={styles.image}
            />
            <Button
              type="button"
              className={styles.deleteBtn}
              onClick={() => removeNewImage(idx)}
              variant="ghost"
              size="xs"
              aria-label="Remove image"
            >
              <X size={12} />
            </Button>
            <span className={styles.newBadge}>New</span>
          </div>
        ))}

        {/* Upload Button */}
        <label className={styles.uploadBtn}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          <Upload size={24} />
          <span>Add Photos</span>
        </label>
      </div>
    </div>
  );
};
export default ImageManager;
