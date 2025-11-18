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
import Confirmation from "../components/Order/Confirmation/confirmation";
import Order from "../components/Order/Orders/order";
import CheckoutPage from "../components/Order/CheckoutPage/checkoutPage";
import OrderManagement from "../components/Admin/Order Management/orderManagement";
import AppointmentsPage from "../components/Appointments/appointmentsPage";
import AppointmentManagement from "../components/Admin/Appoinment Management/AppointmentManagement";
import Profile from "../components/UserProfile/userProfile";
import ScrollToTop from "./scrollToTop";
import DoctorDetails from "../components/VetServices/components/VetDetails/doctorDetailPage";
import CaretakerDetails from "../components/PetDaycare/components/CareTaker/CareTakerDetails/caretakerDetails";

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
    <>
      <ScrollToTop />
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-appointments" element={<AppointmentsPage />} />
        <Route path="/my-orders" element={<Order />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<Confirmation />} />

        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path="/caretaker/:id" element={<CaretakerDetails />} />

        {/* Admin Protected */}
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
          <Route path="orders" element={<OrderManagement />} />
          <Route path="appointments" element={<AppointmentManagement />} />
        </Route>
        {/* Google Auth */}
        <Route path="/login/success" element={<GoogleAuthCallback />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
