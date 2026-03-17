import React, { useRef } from "react";
import { Camera, X } from "lucide-react";
import styles from "./petImageUploader.module.css"; // Create this CSS module
import { Button } from "../../../common";
const PetImageUploader = ({ images, setImages }) => {
  const fileInputRef = useRef(null);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // For now, let's assume single image for the main display, or the first one if multiple
      // We can extend this to multiple images later if required
      setImages((prev) => [...prev, ...files]);
    }
  };
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handlePlaceholderClick = () => {
    fileInputRef.current.click();
  };
  return (
    <div className={styles.imageUploaderContainer}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className={styles.hiddenFileInput}
        multiple // Allow multiple files, though we might only display one prominently
      />

      {images.length > 0 ? (
        <div className={styles.imagePreviewWrapper}>
          <img
            src={URL.createObjectURL(images[0])} // Display the first image as the main one
            alt="Pet Preview"
            className={styles.mainImagePreview}
          />
          <Button
            type="button"
            onClick={() => removeImage(0)} // Remove the main image
            className={styles.removeMainImageButton}
            variant="ghost"
            size="sm"
            aria-label="Remove image"
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <div
          className={styles.imagePlaceholder}
          onClick={handlePlaceholderClick}
        >
          <Camera size={48} />
          <span>Add Pet Image</span>
        </div>
      )}

      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {images.slice(1).map((image, index) => (
            <div key={index} className={styles.thumbnailItem}>
              <img
                src={URL.createObjectURL(image)}
                alt={`Thumbnail ${index + 1}`}
                className={styles.thumbnailImage}
              />
              <Button
                type="button"
                onClick={() => removeImage(index + 1)}
                className={styles.removeThumbnailButton}
                variant="ghost"
                size="sm"
                aria-label="Remove image"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <Button
          type="button"
          onClick={handlePlaceholderClick}
          className={styles.addMoreImagesButton}
          variant="ghost"
          size="md"
        >
          Add More Images
        </Button>
      )}
    </div>
  );
};
export default PetImageUploader;
