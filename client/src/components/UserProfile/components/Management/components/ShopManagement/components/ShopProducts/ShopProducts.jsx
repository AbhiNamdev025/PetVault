import React, { useEffect, useState } from "react";
import styles from "./ShopProducts.module.css";
import { API_BASE_URL } from "../../../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../../../utils/profileSearch";
import toast from "react-hot-toast";
import ProductFormModal from "../Modals/ProductFormModal";
import ConfirmationModal from "../../../../../../../ConfirmationModal/ConfirmationModal";
import { ManagementCardSkeleton } from "../../../../../../../Skeletons";
import FilterSidebar from "../../../../../../../common/FilterSidebar/FilterSidebar";
import ShopHeader from "../ShopHeader/ShopHeader";
import ProductGrid from "../Products/ProductGrid";
import ManagementEmptyState from "../../../common/ManagementEmptyState";
import { Package } from "lucide-react";
import { Pagination } from "../../../../../../../common";

const ShopManagement = ({ user, hideTitleBlock = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    stock: "all",
    availability: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const shopId = user?._id;

  const loadProducts = async () => {
    if (!token || !shopId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [shopId]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "management") return;

      setFilters((previous) => ({
        ...previous,
        search: String(query || ""),
      }));
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleAddClick = () => {
    if (!token) {
      toast.error("Please login to add products");
      return;
    }
    setShowAdd(true);
  };

  const handleEditClick = (product) => {
    if (!token) {
      toast.error("Please login to edit products");
      return;
    }
    setSelectedProduct(product);
    setShowEdit(true);
  };

  const handleDeleteRequest = (product) => {
    if (!token) {
      toast.error("Please login to delete products");
      return;
    }
    handleDeleteClick(product);
  };

  const remove = async (reason) => {
    if (!productToDelete || !token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deletion_reason: reason }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete");
      }

      toast.success("Product deleted successfully");
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const filtered = products.filter((p) => {
    const q = String(filters.search || "")
      .trim()
      .toLowerCase();
    const searchableFields = [
      p?.name,
      p?.brand,
      p?.category,
      p?.description,
      p?._id,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    const matchesSearch =
      !q || searchableFields.some((value) => value.includes(q));
    const stock = Number(p.stock || 0);
    const isAvail = p.available !== false;

    const matchesStock =
      filters.stock === "all" ||
      (filters.stock === "in_stock" && stock > 0) ||
      (filters.stock === "out_of_stock" && stock <= 0);
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "available" && isAvail) ||
      (filters.availability === "unavailable" && !isAvail);
    return matchesSearch && matchesStock && matchesAvailability;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) return <ManagementCardSkeleton count={6} />;
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.stock !== "all" ||
    filters.availability !== "all";

  const filterOptions = [
    {
      id: "stock",
      label: "Stock Status",
      values: [
        { id: "all", label: "All Products" },
        { id: "in_stock", label: "In Stock" },
        { id: "out_of_stock", label: "Out of Stock" },
      ],
    },
    {
      id: "availability",
      label: "Availability",
      values: [
        { id: "all", label: "All Availability" },
        { id: "available", label: "Available" },
        { id: "unavailable", label: "Unavailable" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() =>
          setFilters({ search: "", stock: "all", availability: "all" })
        }
      />

      <ShopHeader
        hasActiveFilters={hasActiveFilters}
        onOpenFilters={() => setShowFilters(true)}
        onClearFilters={() =>
          setFilters({ search: "", stock: "all", availability: "all" })
        }
        onAdd={handleAddClick}
        hideTitleBlock={hideTitleBlock}
      />

      {filtered.length === 0 ? (
        <ManagementEmptyState
          title={hasActiveFilters ? "No matches found" : "No Products Found"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters to find what you are looking for."
              : "You haven't added any products to your shop yet. Start by adding items to your inventory."
          }
          onAdd={hasActiveFilters ? null : handleAddClick}
          icon={Package}
          buttonText="Add Product"
        />
      ) : (
        <>
          <ProductGrid
            products={paginatedProducts}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageInfo
          />
        </>
      )}

      {showAdd && (
        <ProductFormModal
          onClose={() => setShowAdd(false)}
          onSaved={loadProducts}
        />
      )}

      {showEdit && selectedProduct && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => {
            setShowEdit(false);
            setSelectedProduct(null);
          }}
          onSaved={loadProducts}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Product",
            message: `Are you sure you want to delete "${productToDelete?.name}"? Please provide a reason for deletion.`,
            confirmText: "Yes, Delete",
            type: "cancel",
            showInput: true,
            inputPlaceholder: "Reason for deletion (min 10 chars)...",
            required: true,
            inputValidator: (val) =>
              val.trim().length < 10
                ? "Reason must be at least 10 characters"
                : "",
          }}
          onConfirm={remove}
          onCancel={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default ShopManagement;
