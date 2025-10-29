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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        if (key === "images" && productData.images) {
          productData.images.forEach((image) => {
            formData.append("productImages", image);
          });
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/products/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Product added successfully");
        setShowAddModal(false);
        fetchProducts();
      } else {
        toast.error(responseData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Add product error:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (productId, productData) => {
    try {
      const token = localStorage.getItem("token");

      const hasNewImages = productData.images && productData.images.length > 0;

      if (hasNewImages) {
        const formData = new FormData();

        Object.keys(productData).forEach((key) => {
          if (key === "images") {
            productData.images.forEach((image) => {
              formData.append("productImages", image);
            });
          } else {
            formData.append(key, productData[key]);
          }
        });

        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.ok) {
          toast.success("Product updated successfully");
          setShowEditModal(false);
          fetchProducts();
        } else {
          toast.error(responseData.message || "Failed to update product");
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        const responseData = await response.json();

        if (response.ok) {
          toast.success("Product updated successfully");
          setShowEditModal(false);
          fetchProducts();
        } else {
          toast.error(responseData.message || "Failed to update product");
        }
      }
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Product deleted successfully");
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

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
            placeholder="Search products by name or brand..."
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
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/uploads/products/${product.images?.[0]}`}
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
                <div className={styles.price}>Rs.{product.price}</div>

                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      window.open(`/products/${product._id}`, "_blank")
                    }
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 size={16} />
                    Delete
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
          }}
          onSave={handleEditProduct}
        />
      )}

      {showDeleteModal && productToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="product"
          itemName={productToDelete.name}
        />
      )}
    </div>
  );
};

export default ProductManagement;
