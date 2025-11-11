import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./productDetails.module.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Centralized Add to Cart logic — clean and reusable
  const handleAddToCart = async () => {
    if (!product || product.stock === 0) {
      toast.info("This product is out of stock");
      return;
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token || !userData) {
      toast.info("Please login to add items to cart");
      return;
    }

    try {
      setAddingToCart(true);
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast.success("Added to cart!");
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );

  if (!product)
    return (
      <div className={styles.notFound}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate("/pet-products")} className={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Products
        </button>
      </div>
    );

  return (
    <div className={styles.productDetails}>
      <button className={styles.backBtn} onClick={() => navigate("/pet-products")}>
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className={styles.container}>
        <div className={styles.imageSection}>
          {product.images && product.images.length > 0 ? (
            <img
              src={`${API_BASE_URL.replace("/api", "")}/uploads/products/${product.images[0]}`}
              alt={product.name}
              className={styles.image}
            />
          ) : (
            <div className={styles.noImage}>No Image Available</div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.brand}>{product.brand}</p>

          <div className={styles.rating}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(product.rating) ? "#facc15" : "none"}
                stroke="#facc15"
              />
            ))}
            <span className={styles.ratingValue}>{product.rating}/5</span>
          </div>

          <p className={styles.price}>₹{product.price}</p>
          <p className={styles.description}>{product.description}</p>

          {product.features && product.features.length > 0 && (
            <div className={styles.featuresSection}>
              <h3 className={styles.featuresTitle}>Key Features</h3>
              <ul className={styles.featuresList}>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <CheckCircle size={18} className={styles.featureIcon} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.cartBtn}
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
            >
              {product.stock === 0
                ? "Out of Stock"
                : addingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
