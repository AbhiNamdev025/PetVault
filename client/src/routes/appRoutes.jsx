import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/homePage";
import PetShopPage from "../pages/petShopPage";
import VetServicesPage from "../pages/vetServices";
import PetAdoptionPage from "../pages/petAdoptionPage";
import PetDaycarePage from "../pages/petDaycarePage";
import PetProductsPage from "../pages/petProductsPage";
import AdminPage from "../pages/adminPage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
import AdminDashboard from "../components/Admin/AdminDashboard/adminDashboard";
import PetManagement from "../components/Admin/PetManagement/petManagement";
import ProductManagement from "../components/Admin/ProductManagement/productManagement";
import ServiceManagement from "../components/Admin/ServiceManagement/serviceManagement";
import UserManagement from "../components/Admin/UserManagement/userManagement";
import PetDetails from "../components/PetShop/PetDetails/petDetails";
import AdoptionPetDetails from "../components/PetAdoption/AdoptionPetDetails/adoptionPetDetails";
import GoogleAuthCallback from "../components/Auth/GoogleAuthCallback/googleAuthCallback";
import CartPage from "../pages/cartPage";
import ProtectedPath from "./protectPath";
import ProductDetails from "../components/PetProducts/ProductDetails/productDetails";

const PublicRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userData =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (token && user) {
    if (user.role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pet-shop" element={<PetShopPage />} />
      <Route path="/vet-services" element={<VetServicesPage />} />
      <Route path="/pet-adoption" element={<PetAdoptionPage />} />
      <Route path="/pet-daycare" element={<PetDaycarePage />} />
      <Route path="/pet-products" element={<PetProductsPage />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      {/* Auth Pages */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      {/* Pet Details */}
      <Route path="/shop-pets/:id" element={<PetDetails />} />
      <Route path="/adopt-pets/:id" element={<AdoptionPetDetails />} />
      {/* User Pages */}
      <Route
        path="/profile"
        element={
          <ProtectedPath requiredRole="user">
            <div>User Profile Page</div>
          </ProtectedPath>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedPath requiredRole="user">
            <div>My Appointments Page</div>
          </ProtectedPath>
        }
      />
      <Route
        path="/my-orders"
        element={
          <ProtectedPath requiredRole="user">
            <div>My Orders Page</div>
          </ProtectedPath>
        }
      />
      <Route path="/cart" element={<CartPage />} />
      {/* Admin Protected Pages */}
      <Route
        path="/admin/*"
        element={
          <ProtectedPath requiredRole="admin">
            <AdminPage />
          </ProtectedPath>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pets" element={<PetManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
      {/* Google Auth */}
      <Route path="/login/success" element={<GoogleAuthCallback />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
