import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import ProductCard from "../ProductCard/productCard";
import styles from "./productGrid.module.css";
import { GridSkeleton } from "../../Skeletons";
import { EmptyState, Pagination } from "../../common";

const ITEMS_PER_PAGE = 8;

const ProductGrid = ({ products, onViewProduct, onAddToCart, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  if (loading) return <GridSkeleton count={8} />;

  if (!products || products.length === 0)
    return (
      <EmptyState
        className={styles.emptyState}
        icon={<ShoppingBag size={32} />}
        title="No Products Found"
        description="We couldn't find products matching your current filters. Try a different search or check back soon."
      />
    );

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const visibleProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <>
      <div className={styles.flexGrid}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onView={onViewProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ProductGrid;
