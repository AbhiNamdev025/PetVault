import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Layout/Navbar/navbar";
import Footer from "./components/Layout/Footer/footer";
import AppRoutes from "./routes/appRoutes";
import "./styles/globals.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
