import { useEffect, useState } from "react";
import { supabase } from "../supaConfig/supabaseClient";

export default function PublicGallery() {
    const [images, setImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchImages();
        loadCategories();
    }, []);

    useEffect(() => {
        fetchImages();
    }, [selectedCategory]);

    const fetchImages = async () => {
        let query = supabase
            .from("images")
            .select("*")
            .order("id", { ascending: false });

        if (selectedCategory) query = query.eq("category_id", selectedCategory);

        const { data } = await query;
        setImages(data || []);
    };

    const loadCategories = async () => {
        const { data } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        setCategories(data || []);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Diseños de Bordados
                </h1>

                <p className="text-gray-600 mb-6">
                    Explora nuestra colección de bordados textiles personalizados
                </p>

                {/* DROPDOWN MOBILE */}
                <div className="md:hidden mb-4">
                    <select
                        className="w-full border rounded-lg p-3 bg-white shadow-sm"
                        value={selectedCategory || ""}
                        onChange={(e) =>
                            setSelectedCategory(
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                    >
                        <option value="">Todas las categorías</option>

                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-6">

                    {/* SIDEBAR DESKTOP */}
                    <div className="hidden md:block md:w-1/4 bg-white p-4 rounded-lg shadow-md sticky top-20 h-[80vh] overflow-y-auto">

                        <h2 className="font-semibold text-lg mb-4">
                            Categorías
                        </h2>

                        <ul className="flex flex-col gap-2">

                            <li
                                className={`cursor-pointer px-3 py-2 rounded-md ${!selectedCategory
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-blue-100"
                                    }`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                Todas
                            </li>

                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className={`cursor-pointer px-3 py-2 rounded-md ${selectedCategory === cat.id
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-blue-100"
                                        }`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </li>
                            ))}

                        </ul>
                    </div>

                    {/* GALERIA */}
                    <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {images.map((img, index) => (
                            <div
                                key={img.id}
                                className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm"
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
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
                    onClick={() => setSelectedIndex(null)}
                >

                    <button
                        className="absolute top-6 right-6 text-white text-4xl"
                        onClick={() => setSelectedIndex(null)}
                    >
                        ✕
                    </button>

                    <button
                        className="absolute left-4 md:left-8 text-white text-5xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage(e);
                        }}
                    >
                        ❮
                    </button>

                    <img
                        src={images[selectedIndex].url}
                        alt=""
                        className="max-h-[85vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-4 md:right-8 text-white text-5xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage(e);
                        }}
                    >
                        ❯
                    </button>

                </div>
            )}

            {/* BOTON WHATSAPP */}

            <a
                href="https://wa.me/593968712610?text=Hola%20quiero%20información%20sobre%20sus%20bordados"
                target="_blank"
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 p-4 rounded-full shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
                </svg>
            </a>

        </div>
    );
}