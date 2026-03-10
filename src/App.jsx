import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicGallery from "./pages/PublicGallery";
import AdminUpload from "./pages/AdminUpload";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Contact from "./pages/Contact";
import "./styles/global.css";
import { useEffect } from "react";
import React from "react"; // 👈 esto es lo que falta


function App() {



  useEffect(() => {

    const block = (e) => e.preventDefault();

    document.addEventListener("contextmenu", block);

    return () => document.removeEventListener("contextmenu", block);

  }, []);
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />

        <div className="page-container">
          <Routes>
            <Route path="/" element={<PublicGallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminUpload />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
