import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Layout/Navbar/navbar";
import Footer from "./components/Layout/Footer/footer";
import AppRoutes from "./routes/appRoutes";
import "./styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
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
