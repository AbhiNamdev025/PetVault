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
import AdminDashboard from "../components/Admin/AdminDashboard/adminDashboard";
import PetManagement from "../components/Admin/PetManagement/petManagement";
import ProductManagement from "../components/Admin/ProductManagement/productManagement";
import ServiceManagement from "../components/Admin/ServiceManagement/serviceManagement";
import UserManagement from "../components/Admin/UserManagement/userManagement";
import PetDetails from "../components/PetShop/PetDetails/petDetails";

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

      {/* Pet Details Route - Add this line */}
      <Route path="/pets/:id" element={<PetDetails />} />

      {/* Private Routes */}
      <Route path="/profile" element={<div>User Profile Page</div>} />
      <Route
        path="/my-appointments"
        element={<div>My Appointments Page</div>}
      />
      <Route path="/my-orders" element={<div>My Orders Page</div>} />
      <Route path="/cart" element={<div>Cart Page</div>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />}>
        <Route index element={<AdminDashboard />} />
        <Route path="pets" element={<PetManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
