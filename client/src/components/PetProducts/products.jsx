import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductFilters from "./ProductFilters/productFilter";
import ProductGrid from "./ProductGrid/productGrid";
import { API_BASE_URL } from "../../utils/constants";
import styles from "./products.module.css";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    "https://img.freepik.com/free-vector/flat-horizontal-sale-banner-template-national-pet-day-with-animals_23-2151258558.jpg?semt=ais_hybrid&w=740&q=80",
    "https://www.shutterstock.com/image-photo/advertising-banner-design-pet-shop-260nw-2164168569.jpg",
    "https://img.freepik.com/free-vector/flat-national-pet-day-horizontal-sale-banner-template_23-2151346535.jpg?semt=ais_hybrid&w=740&q=80",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, category, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    switch (sortOrder) {
      case "price_low_high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high_low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating_high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  };

  const handleViewProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const handleAddToCart = async (product) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token || !userData) {
      toast.info("Please login to add items to cart");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ added this
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
    }
  };

  return (
    <div className={styles.productPage}>
      <div className={styles.heroSection}>
        <div
          className={styles.carousel}
          style={{
            backgroundImage: `url(${carouselImages[currentSlide]})`,
          }}
        >
          <div className={styles.overlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Discover Premium <span>Pet Products</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Quality food, toys, and accessories your furry friends deserve.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={category}
          onCategoryChange={setCategory}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        <div className={styles.resultsInfo}>
          <h2>All Products</h2>
          <span className={styles.resultsCount}>
            {filteredProducts.length} items found
          </span>
        </div>

        <ProductGrid
          products={filteredProducts}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Products;
