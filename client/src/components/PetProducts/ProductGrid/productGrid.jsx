import React from "react";
import ProductCard from "../ProductCard/productCard";
import styles from "./productGrid.module.css";

const ProductGrid = ({ products, onViewProduct, onAddToCart, loading }) => {
  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );

  if (!products || products.length === 0)
    return (
      <div className={styles.empty}>
        <p>No products available right now.</p>
      </div>
    );

  return (
    <div className={styles.flexGrid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onView={onViewProduct}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
