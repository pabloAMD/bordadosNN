import { useEffect, useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";
import { processImage } from "../utils/imageProcessor";

export default function AdminUpload() {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (!error) setCategories(data);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const uploadImages = async () => {
        if (!files.length) return;

        setLoading(true);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const processed = await processImage(file);
                const fileName = Date.now() + "_" + file.name;

                const { error } = await supabase.storage
                    .from("images")
                    .upload(fileName, processed);

                if (error) throw error;

                const { data } = supabase.storage
                    .from("images")
                    .getPublicUrl(fileName);

                await supabase.from("images").insert({ url: data.publicUrl, category_id: selectedCategory });

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            alert("Todas las imágenes subidas ✅");
        } catch (error) {
            console.error(error);
            alert("Error subiendo imágenes");
        }

        setLoading(false);
        setFiles([]);
    };

    return (
        <div className="max-w-xl w-full mx-auto p-6 flex flex-col items-center gap-6">

            <h2 className="text-3xl font-bold text-gray-800">Panel Admin</h2>

            {/* Botón cerrar sesión */}
            <button
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                onClick={logout}
            >
                Cerrar sesión
            </button>

            {/* Select de categorías */}
            <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>

            {/* Input archivos */}
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-700 rounded-lg shadow-md tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-blue-50 hover:text-blue-800 transition-colors duration-200">
                <svg className="w-8 h-8 mb-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"><path d="M16.88 9.94l-3.39-3.39a1 1 0 00-1.41 0l-1.84 1.84V3a1 1 0 10-2 0v5.39L4.91 6.55a1 1 0 00-1.41 1.41l6 6a1 1 0 001.41 0l6-6a1 1 0 000-1.41z" /></svg>
                <span className="text-sm font-medium">Seleccionar imágenes</span>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                />
            </label>

            {files.length > 0 && (
                <p className="text-gray-700">{files.length} imágenes seleccionadas</p>
            )}

            {/* Barra de progreso */}
            {loading && (
                <div className="w-full">
                    <p className="text-gray-700 mb-2">Subiendo... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Botón subir */}
            <button
                className={`px-6 py-3 mt-4 font-semibold text-white rounded-lg shadow-md transition-colors duration-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                onClick={uploadImages}
                disabled={loading}
            >
                {loading ? "Subiendo..." : "Subir Imágenes"}
            </button>
        </div>
    );
}