import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/homePage";
import PetShopPage from "../pages/petShopPage";
import VetServicesPage from "../pages/vetServices";
import PetAdoptionPage from "../pages/petAdoptionPage";
import PetDaycarePage from "../pages/petDaycarePage";
import PetProductsPage from "../pages/petProductsPage";
import AdminPage from "../pages/adminPage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pet-shop" element={<PetShopPage />} />
      <Route path="/vet-services" element={<VetServicesPage />} />
      <Route path="/pet-adoption" element={<PetAdoptionPage />} />
      <Route path="/pet-daycare" element={<PetDaycarePage />} />
      <Route path="/pet-products" element={<PetProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private Routes - Will add protection later */}
      <Route path="/profile" element={<div>User Profile Page</div>} />
      <Route
        path="/my-appointments"
        element={<div>My Appointments Page</div>}
      />
      <Route path="/my-orders" element={<div>My Orders Page</div>} />
      <Route path="/cart" element={<div>Cart Page</div>} />

      {/* Admin Routes - Will add protection later */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      <Route path="/admin/pets" element={<div>Pet Management</div>} />
      <Route path="/admin/products" element={<div>Product Management</div>} />
      <Route path="/admin/services" element={<div>Service Management</div>} />
      <Route
        path="/admin/appointments"
        element={<div>Appointments Management</div>}
      />
    </Routes>
  );
};

export default AppRoutes;
