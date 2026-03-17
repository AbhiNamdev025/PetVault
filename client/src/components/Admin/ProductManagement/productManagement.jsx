import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DeletionReasonModal from "../DeletionReasonModal/deletionReasonModal";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import styles from "./productManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import { GridSkeleton } from "../../Skeletons";
import { useNavigate } from "react-router-dom";
import ProductHeader from "./components/ProductHeader";
import ProductGrid from "./components/ProductGrid";
import { Pagination } from "../../common";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [productToRestore, setProductToRestore] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("active");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, [viewMode]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products?status=${viewMode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else toast.error("Failed to fetch products");
    } catch {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (product) => {
    setProductToRestore(product);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!productToRestore) return;
    setRestoreLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/products/${productToRestore._id}/restore`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        toast.success("Product restored successfully");
        setShowRestoreModal(false);
        setProductToRestore(null);
        fetchProducts();
      } else {
        toast.error("Failed to restore product");
      }
    } catch {
      toast.error("Error restoring product");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleDeleteConfirm = async (deletionReason) => {
    if (!productToDelete) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deletion_reason: deletionReason }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        if (data.email_queued) {
          toast.success(
            "Product deleted successfully. Owner will be notified via email.",
          );
        } else {
          toast.success("Product deleted successfully");
        }
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
        throw new Error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error(error.message || "Error deleting product");
      throw error;
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchCat;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, viewMode]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = React.useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  if (loading) return <GridSkeleton count={6} />;

  const handleCardClick = (product) => {
    navigate(`/admin/products/${product._id}`);
  };

  const handleViewProduct = (product) => {
    window.open(`/products/${product._id}`, "_blank");
  };

  const handleShopClick = (product) => {
    const shopId =
      typeof product.shopId === "object" ? product.shopId._id : product.shopId;
    navigate(`/admin/tenants/${shopId}`);
  };

  return (
    <div className={styles.productManagement}>
      <ProductHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
      />

      <ProductGrid
        products={paginatedProducts}
        viewMode={viewMode}
        baseUrl={BASE_URL}
        onCardClick={handleCardClick}
        onView={handleViewProduct}
        onDelete={(product) => {
          setProductToDelete(product);
          setShowDeleteModal(true);
        }}
        onRestore={handleRestoreClick}
        onShopClick={handleShopClick}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPageInfo={true}
        className={styles.pagination}
      />

      {showDeleteModal && productToDelete && (
        <DeletionReasonModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          itemType="product"
          itemName={productToDelete.name}
        />
      )}

      {showRestoreModal && productToRestore && (
        <ConfirmationModal
          config={{
            title: "Restore Product?",
            message: `Are you sure you want to restore "${productToRestore.name}"? This will make it visible again in the store and app.`,
            confirmText: "Yes, Restore",
            type: "confirm",
          }}
          onConfirm={confirmRestore}
          onCancel={() => setShowRestoreModal(false)}
          isLoading={restoreLoading}
        />
      )}
    </div>
  );
};

export default ProductManagement;
