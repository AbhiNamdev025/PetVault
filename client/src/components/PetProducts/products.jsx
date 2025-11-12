import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductFilters from "./ProductFilters/productFilter";
import ProductGrid from "./ProductGrid/productGrid";
import { API_BASE_URL } from "../../utils/constants";
import styles from "./products.module.css";

// ✅ Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const carouselImages = [
    "https://shakehands.co.in/cdn/shop/files/Range_Banners_Shake_Hands_A_5760_x_2000_1900x500.png?v=1731997954",
    "https://www.vetnpetdirect.com.au/cdn/shop/files/dog-toys-banner-desktop_1600x.jpg?v=1712018963",
    "https://cdn.prod.website-files.com/64c2c941368dd7094ffd75ac/66673e795dcd6b71be4c562c_toff.jpeg",
    "https://mir-s3-cdn-cf.behance.net/project_modules/1400/2027a2169601075.644fdce4171a6.jpg",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, category, sortOrder]);

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
    } catch {
      toast.error("Something went wrong");
    }
  };

  const categories = [
    { value: "all", label: "All Products" },
    { value: "food", label: "Food" },
    { value: "toy", label: "Toys" },
    { value: "accessory", label: "Accessories" },
    { value: "grooming", label: "Grooming" },
    { value: "health", label: "Health" },
  ];

  return (
    <div className={styles.productsPage}>
      {/* ✅ Infinite Swiper Carousel */}
      <div className={styles.carouselSection}>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 1500, disableOnInteraction: false }}
          loop={true}
          speed={1000}
          slidesPerView={1}
          spaceBetween={0}
        >
          {carouselImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`banner-${i}`}
                className={styles.carouselImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>
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

        <div className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>Browse by Category</h2>
          <div className={styles.categoryGrid}>
            {categories.map((c) => (
              <button
                key={c.value}
                className={`${styles.categoryButton} ${
                  category === c.value ? styles.active : ""
                }`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

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
