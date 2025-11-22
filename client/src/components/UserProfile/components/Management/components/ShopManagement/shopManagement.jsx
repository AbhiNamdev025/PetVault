import React, { useEffect, useState } from "react";
import styles from "./shopManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AddProductModal from "./addShopModal";
import EditProductModal from "./editShopModal";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";

const ShopManagement = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const shopId = savedUser?._id || user?._id;

  const loadProducts = async () => {
    if (!token || !shopId) {
      toast.error("Authentication required");
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
    } catch (err) {
      toast.error("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const remove = async () => {
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
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Product deleted successfully");
      loadProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>Manage Products</h2>

        <button
          className={styles.addBtn}
          onClick={() => {
            if (!token) {
              toast.error("Please login to add products");
              return;
            }
            setShowAdd(true);
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.noData}>No products found</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <div className={styles.card} key={p._id}>
              <div className={styles.imageBox}>
                {p.images?.[0] ? (
                  <img
                    src={`${API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/uploads/products/${p.images[0]}`}
                    alt=""
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.brand}>{p.brand || "No brand"}</p>
                <p className={styles.price}>₹{p.price}</p>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    if (!token) {
                      toast.error("Please login to edit products");
                      return;
                    }
                    setSelectedProduct(p);
                    setShowEdit(true);
                  }}
                >
                  <Edit size={16} />
                </button>

                <button
                  className={styles.delBtn}
                  onClick={() => {
                    if (!token) {
                      toast.error("Please login to delete products");
                      return;
                    }
                    handleDeleteClick(p);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onAdded={loadProducts}
        />
      )}

      {showEdit && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEdit(false);
            setSelectedProduct(null);
          }}
          onUpdated={loadProducts}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          config={{
            title: "Delete Product",
            message: `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            type: "cancel",
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
