import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";
import React, { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const links = [
        { to: "/", label: "Inicio" },
        { to: "/contact", label: "Contacto" },
        { to: "/admin", label: "Admin" },
    ];

    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">
                    <img className="max-h-14 py-0" src="/logomenu.png" alt="Logo" />
                </div>

                {/* LINKS DESKTOP */}
                <div className="navbar-links desktop">
                    {links.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={isActive(to) ? "nav-link-active" : ""}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* HAMBURGUESA MOBILE */}
                <button
                    className="hamburger"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Abrir menú"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            {/* OVERLAY */}
            <div
                className={`menu-overlay ${menuOpen ? "show" : ""}`}
                onClick={() => setMenuOpen(false)}
            />

            {/* ASIDE MENU */}
            <aside className={`side-menu ${menuOpen ? "open" : ""}`}>
                <div className="side-header">
                    <img src="/logomenu.png" alt="Logo" className="h-10" />
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="side-close-btn"
                        aria-label="Cerrar menú"
                    >
                        ✕
                    </button>
                </div>

                <nav className="side-nav">
                    {links.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`side-link ${isActive(to) ? "side-link-active" : ""}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}
