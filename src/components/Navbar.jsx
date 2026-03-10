import { Link } from "react-router-dom";
import "../styles/navbar.css";
import React from "react"; // 👈 esto es lo que falta

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">Mi Galería</div>

            <div className="navbar-links">
                <Link to="/">Inicio</Link>
                <Link to="/contact">Contacto</Link>
                <Link to="/admin">Admin</Link>
            </div>
        </nav>
    );
}
