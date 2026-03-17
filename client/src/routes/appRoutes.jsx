import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "../pages/Homepage/HomePage";
import PetShopPage from "../pages/PetShopPage/petShopPage";
import VetServicesPage from "../pages/VetServices/vetServices";
import PetAdoptionPage from "../pages/PetAdoptionPage/petAdoptionPage";
import PetDaycarePage from "../pages/PetDaycarePage/petDaycarePage";
import PetProductsPage from "../pages/PetProductsPage/petProductsPage";
import AppointmentBookingPage from "../pages/AppointmentBooking/appointmentBookingPage";
import AdminPage from "../pages/Admin/adminPage";
import AdminDashboard from "../components/Admin/AdminDashboard/adminDashboard";
import PetManagement from "../components/Admin/PetManagement/petManagement";
import ProductManagement from "../components/Admin/ProductManagement/productManagement";
import ServiceManagement from "../components/Admin/ServiceManagement/serviceManagement";
import UserManagement from "../components/Admin/UserManagement/userManagement";
import ShopDetail from "../components/Admin/ShopsManagement/shopDetail";
import HospitalDetail from "../components/Admin/HospitalsManagement/hospitalDetail";
import DaycareDetail from "../components/Admin/DaycaresManagement/daycareDetail";
import NgoDetail from "../components/Admin/NgoManagement/NgoDetail";
import OrderManagement from "../components/Admin/Order Management/orderManagement";
import AppointmentManagement from "../components/Admin/Appoinment Management/AppointmentManagement";
import TenantManagement from "../components/Admin/TenantManagement/TenantManagement";
import TenantDetail from "../components/Admin/TenantManagement/Components/TenantDetails/TenantDetail";
import PayoutManagement from "../components/Admin/PayoutManagement/payoutManagement";
import PayoutDetails from "../components/Admin/PayoutManagement/payoutDetails";
import PetDetails from "../components/PetShop/PetDetails/petDetails";
import AdoptionPetDetails from "../components/PetAdoption/AdoptionPetDetails/adoptionPetDetails";
import GoogleAuthCallback from "../components/Auth/GoogleAuthCallback/googleAuthCallback";
import CartPage from "../pages/Cartpage/CartPage";
import ProtectedPath from "./protectPath";
import ProductDetails from "../components/PetProducts/ProductDetails/productDetails";
import Confirmation from "../components/Order/Confirmation/confirmation";
import Order from "../components/Order/Orders/order";
import OrderDetails from "../components/Order/OrderDetails/orderDetails";
import CheckoutPage from "../components/Order/CheckoutPage/checkoutPage";
import ShopDetails from "../components/ShopDetails/shopDetails";
import DoctorDetails from "../components/VetServices/components/VetDetails/doctorDetailPage";
import HospitalDetails from "../components/VetServices/HospitalDetails/hospitalDetails";
import DaycareDetails from "../components/PetDaycare/components/DaycareDetails/daycareDetails";
import CaretakerDetails from "../components/PetDaycare/components/CareTaker/CareTakerDetails/caretakerDetails";
import ProfilePage from "../components/UserProfile/userProfile";
import AdminProductDetail from "../components/Admin/ProductManagement/AdminProductDetail";
import AdminPetDetail from "../components/Admin/PetManagement/AdminPetDetail";
import UserPetProfile from "../components/UserProfile/components/MyPets/PetProfile/PetProfile";
import ScrollToTop from "./scrollToTop";
import NgoDetails from "../components/NgoDetails/ngoDetails";
import AdminNewsletter from "../pages/Admin/Newsletter/adminNewsletter";

const AppRoutes = () => {
  const location = useLocation();
  const fallbackRedirect =
    location.pathname === "/login"
      ? "/?auth=login"
      : location.pathname === "/register"
        ? "/?auth=signup"
        : "/";

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/pet-shop" element={<PetShopPage />} />
        <Route path="/vet-services" element={<VetServicesPage />} />
        <Route path="/pet-adoption" element={<PetAdoptionPage />} />
        <Route path="/pet-daycare" element={<PetDaycarePage />} />
        <Route path="/book/:type" element={<AppointmentBookingPage />} />
        <Route path="/pet-products" element={<PetProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<Confirmation />} />
        <Route
          path="/confirmation"
          element={<Navigate to="/order-confirmation" replace />}
        />
        <Route path="/my-orders" element={<Order />} />
        <Route path="/my-orders/:id" element={<OrderDetails />} />
        <Route
          path="/my-appointments"
          element={<Navigate to="/profile?tab=appointments" replace />}
        />

        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

        <Route path="/pet/:id" element={<PetDetails />} />
        <Route path="/user-pet/:id" element={<UserPetProfile />} />
        <Route path="/adopt-pets/:id" element={<AdoptionPetDetails />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/shop-pets/:id" element={<PetDetails />} />

        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path="/caretaker/:id" element={<CaretakerDetails />} />
        <Route path="/shop/:id" element={<ShopDetails />} />
        <Route path="/hospital/:id" element={<HospitalDetails />} />
        <Route path="/daycare/:id" element={<DaycareDetails />} />
        <Route path="/ngo/:id" element={<NgoDetails />} />

        <Route
          path="/admin"
          element={
            <ProtectedPath allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedPath>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pets" element={<PetManagement />} />
          <Route path="pets/:id" element={<AdminPetDetail />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="shops/:id" element={<ShopDetail />} />
          <Route path="hospitals/:id" element={<HospitalDetail />} />
          <Route path="daycares/:id" element={<DaycareDetail />} />
          <Route path="ngos/:id" element={<NgoDetail />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="payouts" element={<PayoutManagement />} />
          <Route path="payouts/:id" element={<PayoutDetails />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
        </Route>

        <Route path="*" element={<Navigate to={fallbackRedirect} replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
