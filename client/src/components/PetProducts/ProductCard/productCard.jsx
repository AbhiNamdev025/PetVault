import React from "react";
import { Star } from "lucide-react";
import styles from "./productCard.module.css";

const ProductCard = ({ product, onView, onAddToCart }) => {
  const ratingStars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={16}
      fill={i < Math.floor(product.rating || 0) ? "#facc15" : "none"}
      stroke="#facc15"
    />
  ));

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <img
            src={`http://localhost:5000/uploads/products/${product.images?.[0]}`}
            alt={product.name}
            className={styles.productImage}
          />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
        {product.stock === 0 && (
          <span className={styles.stockBadge}>Out of Stock</span>
        )}
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.brand}>{product.brand || "Generic"}</p>

        <div className={styles.rating}>{ratingStars}</div>

        <div className={styles.priceSection}>
          <span className={styles.price}>₹{product.price}</span>
          <span className={styles.category}>{product.category}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.viewButton}
            onClick={() => onView(product._id)}
          >
            View Details
          </button>
          <button
            className={styles.cartButton}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
