import React from "react";
import styles from "../productManagement.module.css";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  viewMode,
  baseUrl,
  onCardClick,
  onView,
  onDelete,
  onRestore,
  onShopClick,
}) => {
  return (
    <div className={styles.productsGrid}>
      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No products found</p>
        </div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            viewMode={viewMode}
            baseUrl={baseUrl}
            onCardClick={onCardClick}
            onView={onView}
            onDelete={onDelete}
            onRestore={onRestore}
            onShopClick={onShopClick}
          />
        ))
      )}
    </div>
  );
};

export default ProductGrid;
