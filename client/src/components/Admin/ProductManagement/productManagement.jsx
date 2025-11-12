import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import AddProductModal from "./AddProductModal/addProductModal";
import EditProductModal from "./EditProductModal/editProductModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import styles from "./productManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleAddProduct = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === "images" && productData.images) {
          productData.images.forEach((img) =>
            form.append("productImages", img)
          );
        } else form.append(key, productData[key]);
      });
      const res = await fetch(`${API_BASE_URL}/products/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        toast.success("Product added");
        setShowAddModal(false);
        fetchProducts();
      } else toast.error("Failed to add product");
    } catch {
      toast.error("Error adding product");
    }
  };

  const handleEditProduct = async (id, productData) => {
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      Object.keys(productData).forEach((key) =>
        form.append(key, productData[key])
      );
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((img) => form.append("productImages", img));
      }
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        toast.success("Product updated");
        setShowEditModal(false);
        fetchProducts();
      } else toast.error("Failed to update product");
    } catch {
      toast.error("Error updating product");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("Product deleted");
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else toast.error("Failed to delete product");
    } catch {
      toast.error("Error deleting product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  if (loading) return <div className={styles.loading}>Loading products...</div>;

  return (
    <div className={styles.productManagement}>
      <div className={styles.header}>
        <div>
          <h1>Products Management</h1>
          <p>Manage all products in your store</p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <Filter size={20} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="toy">Toys</option>
            <option value="accessory">Accessories</option>
            <option value="health">Health</option>
            <option value="grooming">Grooming</option>
            <option value="bedding">Bedding</option>
          </select>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products found</p>
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} /> Add Your First Product
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`${API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/uploads/products/${product.images[0]}`}
                    alt={product.name}
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
                <div className={styles.productStock}>
                  <span
                    className={`${styles.stock} ${
                      product.stock > 0 ? styles.inStock : styles.outOfStock
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.brand}>{product.brand || "No brand"}</p>
                <div className={styles.details}>
                  <span className={styles.category}>{product.category}</span>
                  <span className={styles.rating}>⭐ {product.rating}</span>
                </div>
                <div className={styles.price}>₹{product.price}</div>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      window.open(`/products/${product._id}`, "_blank")
                    }
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => {
                      setProductToDelete(product);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProduct}
        />
      )}
      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}
      {showDeleteModal && productToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          itemType="product"
          itemName={productToDelete.name}
        />
      )}
    </div>
  );
};

export default ProductManagement;
