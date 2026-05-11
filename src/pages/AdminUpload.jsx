import { useEffect, useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";
import { processImage } from "../utils/imageProcessor";

export default function AdminUpload() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [alto, setAlto] = useState("");
    const [ancho, setAncho] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState("");

    useEffect(() => { loadCategories(); }, []);

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

                const { error } = await supabase.storage.from("images").upload(fileName, processed);
                if (error) throw error;

                const { data } = supabase.storage.from("images").getPublicUrl(fileName);
                await supabase.from("images").insert({
                    url: data.publicUrl,
                    category_id: selectedCategory || null,
                    alto: alto ? parseFloat(alto) : null,
                    ancho: ancho ? parseFloat(ancho) : null,
                });
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }
            alert("Todas las imágenes subidas ✅");
        } catch (error) {
            console.error(error);
            alert("Error subiendo imágenes");
        }
        setLoading(false);
        setFiles([]);
        setAlto("");
        setAncho("");
    };

    const createCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;
        setCatLoading(true);
        setCatError("");
        const { error } = await supabase.from("categories").insert({ name });
        if (error) {
            setCatError("Error al crear. ¿Ya existe ese nombre?");
        } else {
            setNewCategoryName("");
            await loadCategories();
        }
        setCatLoading(false);
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("¿Eliminar esta categoría? Las imágenes asociadas perderán su categoría.")) return;
        await supabase.from("categories").delete().eq("id", id);
        if (selectedCategory === String(id)) setSelectedCategory("");
        await loadCategories();
    };

    return (
        <div className="min-h-screen bg-[#f8f7f4]">

            {/* HEADER */}
            <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-1">Panel</p>
                        <h1 className="text-2xl sm:text-3xl font-bold">Administración</h1>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium rounded-xl transition-colors"
                        onClick={logout}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {/* CONTENIDO — 2 col en desktop */}
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* ── TARJETA CATEGORÍAS ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                            <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                                🏷
                            </span>
                            Categorías
                        </h2>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Crear */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nueva categoría..."
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && createCategory()}
                                disabled={catLoading}
                            />
                            <button
                                className="px-4 py-2.5 bg-[#0f3460] hover:bg-[#1a4a7a] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
                                onClick={createCategory}
                                disabled={catLoading || !newCategoryName.trim()}
                            >
                                {catLoading ? "..." : "Crear"}
                            </button>
                        </div>

                        {catError && (
                            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{catError}</p>
                        )}

                        {/* Lista */}
                        {categories.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No hay categorías todavía.</p>
                        ) : (
                            <ul className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                                {categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-3.5 py-2.5 rounded-xl transition-colors group"
                                    >
                                        <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                                        <button
                                            className="text-gray-300 group-hover:text-red-400 hover:!text-red-600 text-xs font-medium transition-colors"
                                            onClick={() => deleteCategory(cat.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── TARJETA SUBIR IMÁGENES ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                            <span className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-sm">
                                📷
                            </span>
                            Subir imágenes
                        </h2>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Select categoría */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Categoría
                            </label>
                            <select
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Sin categoría</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dimensiones opcionales */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Dimensiones <span className="normal-case font-normal text-gray-400">(opcional, en cm)</span>
                            </label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Alto"
                                        min="0"
                                        step="0.1"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={alto}
                                        onChange={(e) => setAlto(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Ancho"
                                        min="0"
                                        step="0.1"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={ancho}
                                        onChange={(e) => setAncho(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <label className="flex flex-col items-center gap-2 px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                            <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                                    {files.length > 0
                                        ? `${files.length} imagen${files.length > 1 ? "es" : ""} seleccionada${files.length > 1 ? "s" : ""}`
                                        : "Seleccionar imágenes"}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setFiles(Array.from(e.target.files))}
                            />
                        </label>

                        {/* Progreso */}
                        {loading && (
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                    <span>Subiendo...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botón */}
                        <button
                            className={`w-full py-3 font-semibold text-sm rounded-xl shadow-sm transition-all ${
                                loading || !files.length
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#0f3460] hover:bg-[#1a4a7a] text-white hover:shadow-md"
                            }`}
                            onClick={uploadImages}
                            disabled={loading || !files.length}
                        >
                            {loading ? `Subiendo... ${progress}%` : "Subir imágenes"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
