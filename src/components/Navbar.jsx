import { Link } from "react-router-dom";
import "../styles/navbar.css";
import React, { useState } from "react";

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="navbar">

                <div className="navbar-logo">
                    <img className="max-h-16 py-0" src="/logomenu.png" alt="Logo" />
                </div>

                {/* LINKS DESKTOP */}
                <div className="navbar-links desktop">
                    <Link to="/">Inicio</Link>
                    <Link to="/contact">Contacto</Link>
                    <Link to="/admin">Admin</Link>
                </div>

                {/* HAMBURGUESA MOBILE */}
                <div
                    className="hamburger"
                    onClick={() => setMenuOpen(true)}
                >
                    ☰
                </div>

            </nav>

            {/* OVERLAY */}
            <div
                className={`menu-overlay ${menuOpen ? "show" : ""}`}
                onClick={() => setMenuOpen(false)}
            ></div>

            {/* ASIDE MENU */}
            <aside className={`side-menu ${menuOpen ? "open" : ""}`}>

                <div className="side-header">
                    <span>Menú</span>

                    <button onClick={() => setMenuOpen(false)}>
                        ✕
                    </button>
                </div>

                <Link to="/" onClick={() => setMenuOpen(false)}>
                    Inicio
                </Link>

                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                    Contacto
                </Link>

                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    Admin
                </Link>

            </aside>
        </>
    );
}