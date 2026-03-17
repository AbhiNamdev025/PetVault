import React, { useEffect, useState } from "react";
import PetCard from "../PetCard/petCard";
import styles from "./petGrid.module.css";
import { PawPrint } from "lucide-react";
import { GridSkeleton } from "../../Skeletons";
import { Pagination } from "../../common";

const ITEMS_PER_PAGE = 8;

const PetGrid = ({ pets, onView, onEnquiry, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [pets]);

  if (loading) {
    return <GridSkeleton count={8} />;
  }

  if (!pets || pets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div>
          <PawPrint size={50} />
        </div>
        <h3>No Pets Found</h3>
        <p>We couldn't find any pets matching your criteria.</p>
        <p>Try adjusting your filters or check back later!</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(pets.length / ITEMS_PER_PAGE));
  const visiblePets = pets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <>
      <div className={styles.petGrid}>
        {visiblePets.map((p) => {
          const shopId =
            typeof p.shopId === "object"
              ? p.shopId
              : p.shopId
                ? { _id: p.shopId }
                : null;

          const pet = { ...p, shopId };

          return (
            <PetCard
              key={pet._id}
              pet={pet}
              onView={onView}
              onEnquiry={onEnquiry}
            />
          );
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default PetGrid;
