import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Layout/Navbar/navbar";
import Footer from "./components/Layout/Footer/footer";
import AppRoutes from "./routes/appRoutes";
import "./styles/globals.css";

const AppContent = () => {
  const location = useLocation();
  const hideHeaderFooter =
    ["/login", "/register", "/admin"].includes(location.pathname) ||
    location.pathname.startsWith("/admin/");

  return (
    <div className="App">
      {!hideHeaderFooter && <Navbar />}
      <main>
        <AppRoutes />
      </main>
      {!hideHeaderFooter && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
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
