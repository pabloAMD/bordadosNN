import { useEffect, useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
    }, []);

    if (loading) return <p>Cargando...</p>;

    if (!session) {
        window.location.href = "/login";
        return null;
    }

    return children;
}
