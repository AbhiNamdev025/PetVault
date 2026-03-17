import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Layout/Navbar/navbar";
import Footer from "./components/Layout/Footer/footer";
import ScrollToTop from "./components/ScrollToTop/scrollToTop";
import ScrollRestoration from "./components/ScrollToTop/scrollRestoration";
import NotificationPrompt from "./components/NotificationPrompt/NotificationPrompt";
import AppRoutes from "./routes/appRoutes";
import TermsAndConditionsModal from "./components/Layout/Footer/Terms/TermsAndConditionsModal";
import "./styles/globals.css";
import { CartProvider } from "./Context/CartContext";

const AppContent = () => {
  const location = useLocation();
  const [showTerms, setShowTerms] = React.useState(false);
  const hideOnAdmin =
    ["/admin"].includes(location.pathname) ||
    location.pathname.startsWith("/admin/");
  const hideNavbarOnProfile =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/");
  const hideNavbar = hideOnAdmin || hideNavbarOnProfile;
  const hideFooterOnProfile =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/") ||
    location.pathname.startsWith("/user-pet");
  const hideFooter = hideOnAdmin || hideFooterOnProfile;

  return (
    <div className="App">
      <ScrollRestoration />
      <CartProvider>
        {!hideNavbar && <Navbar />}
        <main
          className={`appMain ${!hideNavbar ? "withNavbar" : ""}`}
          data-scroll-root="true"
        >
          <ScrollToTop />

          <AppRoutes />
        </main>
        {!hideFooter && (
          <Footer setTermsAndConditionsPopup={setShowTerms} />
        )}
      </CartProvider>
      {/* {!hideHeaderFooter && <ScrollToTop />} */}
      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
      <NotificationPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "14px",
            maxWidth: "350px",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
