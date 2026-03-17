import React from "react";
import styles from "./tenantPagination.module.css";
import { Pagination, Select } from "../../../../common";
const TenantPagination = ({
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className={styles.paginationWrapper}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPageInfo={true}
        className={styles.paginationControl}
      />
    </div>
  );
};
export default TenantPagination;
