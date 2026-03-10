import { useEffect, useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";

export default function PublicGallery() {
    const [images, setImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Preload de imágenes
    useEffect(() => {
        images.forEach((img) => {
            const preload = new Image();
            preload.src = img.url;
        });
    }, [images]);

    useEffect(() => {
        fetchImages();
        loadCategories();
    }, []);

    const fetchImages = async () => {
        let query = supabase.from("images").select("*").order("id", { ascending: false });
        if (selectedCategory) query = query.eq("category_id", selectedCategory);
        const { data } = await query;
        setImages(data || []);
    };

    const loadCategories = async () => {
        const { data, error } = await supabase.from("categories").select("*").order("name");
        if (!error) setCategories(data || []);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Diseños de Bordados</h1>
                <p className="text-gray-600 mb-8">Explora nuestra colección de bordados textiles personalizados</p>

                <div className="flex gap-8">
                    {/* Sidebar categorías */}
                    <div className="w-1/4 bg-white p-4 rounded-lg shadow-md sticky top-20 h-[80vh] overflow-y-auto">
                        <h2 className="font-semibold text-lg mb-4">Categorías</h2>
                        <ul className="flex flex-col gap-2">
                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className={`cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${selectedCategory === cat.id ? "bg-blue-600 text-white" : "hover:bg-blue-100"
                                        }`}
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        fetchImages();
                                    }}
                                >
                                    {cat.name}
                                </li>
                            ))}
                            <li
                                className={`cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 ${!selectedCategory ? "bg-blue-600 text-white" : "hover:bg-blue-100"
                                    }`}
                                onClick={() => {
                                    setSelectedCategory(null);
                                    fetchImages();
                                }}
                            >
                                Todas
                            </li>
                        </ul>
                    </div>

                    {/* Grid de imágenes: 2 por fila */}
                    <div className="w-3/4 grid grid-cols-2 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={img.id}
                                className="cursor-pointer overflow-hidden rounded-lg"
                                onClick={() => setSelectedIndex(index)}
                            >
                                <img
                                    src={img.url}
                                    alt=""
                                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
                    onClick={() => setSelectedIndex(null)}
                >
                    {/* Botón cerrar */}
                    <button
                        className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-red-500 transition-colors z-[10000]"
                        onClick={() => setSelectedIndex(null)}
                    >
                        ✕
                    </button>

                    {/* Navegación izquierda */}
                    <button
                        className="absolute left-6 text-white text-5xl font-bold hover:text-gray-300 transition-colors z-[10000]"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage(e);
                        }}
                    >
                        ❮
                    </button>

                    {/* Todas las imágenes, solo la seleccionada visible */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {images.map((img, index) => (
                            <img
                                key={img.id}
                                src={img.url}
                                alt=""
                                className={`absolute max-h-[85vh] max-w-[85vw] object-contain rounded-lg transition-opacity duration-300 z-[10000] cursor-pointer ${selectedIndex === index ? "opacity-100" : "opacity-0"
                                    }`}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ))}
                    </div>

                    {/* Navegación derecha */}
                    <button
                        className="absolute right-6 text-white text-5xl font-bold hover:text-gray-300 transition-colors z-[10000]"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage(e);
                        }}
                    >
                        ❯
                    </button>
                </div>
            )}

            {/* Botón WhatsApp */}
            <a
                href="https://wa.me/593968712610?text=Hola%20quiero%20saber%20más%20sobre%20sus%20bordados"
                target="_blank"
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors duration-200"
            >
                💬
            </a>
        </div>
    );
}