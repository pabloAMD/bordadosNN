import { useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";
import "../styles/login.css";
import React from "react"; // 👈 esto es lo que falta

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async (e) => {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert("Credenciales incorrectas");
        } else {
            window.location.href = "/admin";
        }
    };

    return (
        <div className="login-page">

            <div className="login-overlay">

                <div className="login-card">

                    <div className="logo">🧵</div>

                    <h2>Bordados Studio</h2>
                    <p className="subtitle">Panel de administración</p>

                    <form onSubmit={login}>

                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Ingresar
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}
