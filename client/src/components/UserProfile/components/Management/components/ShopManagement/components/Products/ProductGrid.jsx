import React from "react";
import styles from "../ShopProducts/ShopProducts.module.css";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
