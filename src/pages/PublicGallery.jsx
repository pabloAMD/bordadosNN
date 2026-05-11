import { useEffect, useState, useRef } from "react";
import { supabase } from "../supaConfig/supabaseClient";
import { processImage } from "../utils/imageProcessor";

const ALTO_RANGOS = [
    { label: "Hasta 5 cm", min: 0, max: 5 },
    { label: "5 – 10 cm", min: 5, max: 10 },
    { label: "10 – 15 cm", min: 10, max: 15 },
    { label: "15 – 20 cm", min: 15, max: 20 },
    { label: "Más de 20 cm", min: 20, max: null },
];

function SidebarBtn({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer border-none ${active ? "bg-[#0f3460] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
        >
            {children}
        </button>
    );
}

function PillBtn({ active, secondary, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${active
                ? secondary
                    ? "bg-slate-700 text-white border-slate-700"
                    : "bg-[#0f3460] text-white border-[#0f3460]"
                : "bg-white text-slate-500 border-slate-200"
                }`}
        >
            {children}
        </button>
    );
}

function Sidebar({ categories, selectedCategory, onSelect, selectedAlto, onSelectAlto }) {
    return (
        <aside className="hidden md:flex flex-col gap-3 w-52 flex-shrink-0 sticky top-[68px] self-start">
            {/* Categorías */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 pl-1">
                    Categorías
                </p>
                <ul className="flex flex-col gap-0.5 list-none p-0 m-0">
                    <li><SidebarBtn active={!selectedCategory} onClick={() => onSelect(null)}>Todas</SidebarBtn></li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <SidebarBtn active={selectedCategory === cat.id} onClick={() => onSelect(cat.id)}>
                                {cat.name}
                            </SidebarBtn>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Alto */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 pl-1">
                    Alto (cm)
                </p>
                <ul className="flex flex-col gap-0.5 list-none p-0 m-0">
                    <li><SidebarBtn active={!selectedAlto} onClick={() => onSelectAlto(null)}>Todos</SidebarBtn></li>
                    {ALTO_RANGOS.map((rango) => (
                        <li key={rango.label}>
                            <SidebarBtn active={selectedAlto?.label === rango.label} onClick={() => onSelectAlto(rango)}>
                                {rango.label}
                            </SidebarBtn>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

function EditModal({ img, categories, onClose, onSaved }) {
    const [categoria, setCategoria] = useState(img.category_id || "");
    const [alto, setAlto] = useState(img.alto ?? "");
    const [ancho, setAncho] = useState(img.ancho ?? "");
    const [newFile, setNewFile] = useState(null);
    const [preview, setPreview] = useState(img.url);
    const [saving, setSaving] = useState(false);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const save = async () => {
        setSaving(true);
        try {
            let url = img.url;
            if (newFile) {
                const processed = await processImage(newFile);
                const fileName = Date.now() + "_" + newFile.name;
                const { error: upErr } = await supabase.storage.from("images").upload(fileName, processed);
                if (upErr) throw upErr;
                const { data } = supabase.storage.from("images").getPublicUrl(fileName);
                url = data.publicUrl;
                try {
                    const oldPath = decodeURIComponent(img.url.split("/storage/v1/object/public/images/")[1]);
                    await supabase.storage.from("images").remove([oldPath]);
                } catch (_) { }
            }
            const { error } = await supabase.from("images").update({
                url,
                category_id: categoria || null,
                alto: alto !== "" ? parseFloat(alto) : null,
                ancho: ancho !== "" ? parseFloat(ancho) : null,
            }).eq("id", img.id);
            if (error) throw error;
            onSaved();
        } catch (err) {
            console.error(err);
            alert("Error al guardar");
        }
        setSaving(false);
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 m-0">Editar imagen</h3>
                    <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg w-8 h-8 cursor-pointer text-slate-500 text-base flex items-center justify-center transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-4">
                    {/* Preview + cambiar foto */}
                    <div className="flex gap-3 items-center">
                        <img src={preview} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                        <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer gap-1 transition-colors">
                            <span className="text-sm font-semibold text-slate-500">{newFile ? newFile.name : "Cambiar foto"}</span>
                            <span className="text-xs text-slate-400">opcional</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        </label>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Categoría</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dimensiones */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                            Dimensiones <span className="normal-case font-normal">(cm, opcional)</span>
                        </label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Alto" min="0" step="0.1" value={alto} onChange={(e) => setAlto(e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            <input type="number" placeholder="Ancho" min="0" step="0.1" value={ancho} onChange={(e) => setAncho(e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 justify-end px-5 py-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold cursor-pointer text-slate-500 hover:bg-slate-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={save} disabled={saving}
                        className={`px-4 py-2.5 rounded-xl border-none text-white text-sm font-semibold transition-colors ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-[#0f3460] hover:bg-[#1a4a7a] cursor-pointer"}`}>
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PublicGallery() {
    const [images, setImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedAlto, setSelectedAlto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingImg, setEditingImg] = useState(null);
    const touchStartX = useRef(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
        const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setIsAdmin(!!session));
        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchImages();
        loadCategories();
    }, []);

    useEffect(() => { fetchImages(); }, [selectedCategory, selectedAlto]);

    useEffect(() => {
        document.body.style.overflow = (selectedIndex !== null || editingImg !== null) ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selectedIndex, editingImg]);

    const fetchImages = async () => {
        setLoading(true);
        let query = supabase.from("images").select("*").order("id", { ascending: false });
        if (selectedCategory) query = query.eq("category_id", selectedCategory);
        if (selectedAlto) {
            query = query.gte("alto", selectedAlto.min);
            if (selectedAlto.max !== null) query = query.lt("alto", selectedAlto.max);
        }
        const { data } = await query;
        setImages(data || []);
        setLoading(false);
    };

    const loadCategories = async () => {
        const { data } = await supabase.from("categories").select("*").order("name");
        setCategories(data || []);
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    const prevImage = (e) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
        touchStartX.current = null;
    };

    const activeLabel = selectedCategory
        ? categories.find((c) => c.id === selectedCategory)?.name
        : "Todas";

    return (
        /*
         * Mobile: columna fija con scroll solo en la galería (h-dvh overflow-hidden)
         * Desktop: layout normal con scroll de página
         */
        <div className="bg-[#f8f7f4] flex flex-col h-dvh overflow-hidden md:h-auto md:overflow-visible md:min-h-screen">

            {/* HERO */}
            <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-14">
                    <p className="hidden md:block text-[11px] font-bold tracking-widest uppercase text-blue-300 mb-2">Colección</p>
                    <h1 className="text-xl md:text-5xl font-extrabold leading-tight mb-0.5 md:mb-3">Diseños de Bordados</h1>
                    <p className="hidden md:block text-blue-200 text-sm md:text-base max-w-lg">Bordados textiles personalizados, hechos con detalle y dedicación.</p>
                    {images.length > 0 && (
                        <p className="text-blue-300 text-xs mt-1 md:mt-4">
                            {images.length} diseño{images.length !== 1 ? "s" : ""} · {activeLabel}
                            {selectedAlto ? ` · ${selectedAlto.label}` : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* FILTROS MOBILE — fijos, no scrollean */}
            <div className="md:hidden flex-shrink-0 bg-[#f8f7f4] px-3 py-2.5 flex flex-col gap-2 border-b border-slate-200">
                <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                    <PillBtn active={!selectedCategory} onClick={() => setSelectedCategory(null)}>Todas</PillBtn>
                    {categories.map((cat) => (
                        <PillBtn key={cat.id} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)}>{cat.name}</PillBtn>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                    <PillBtn active={!selectedAlto} secondary onClick={() => setSelectedAlto(null)}>Todos los altos</PillBtn>
                    {ALTO_RANGOS.map((rango) => (
                        <PillBtn key={rango.label} active={selectedAlto?.label === rango.label} secondary onClick={() => setSelectedAlto(rango)}>{rango.label}</PillBtn>
                    ))}
                </div>
            </div>

            {/* CONTENIDO — solo esta sección scrollea en mobile */}
            <div className="flex-1 overflow-y-auto md:overflow-visible max-w-7xl w-full mx-auto px-3 md:px-8 py-4 md:py-8">
                <div className="flex gap-6">

                    {/* SIDEBAR desktop */}
                    <Sidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                        selectedAlto={selectedAlto}
                        onSelectAlto={setSelectedAlto}
                    />

                    {/* GALERÍA */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
                                ))}
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                                <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm">No hay imágenes con esos filtros</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        {/* Botón editar */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingImg(img); }}
                                                className="absolute top-2 right-2 z-10 bg-[#0f3460]/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer hover:bg-[#0f3460] transition-colors"
                                            >
                                                ✏️ Editar
                                            </button>
                                        )}
                                        <div onClick={() => setSelectedIndex(index)} className="cursor-pointer">
                                            <img
                                                src={img.url}
                                                alt=""
                                                loading="lazy"
                                                className="w-full aspect-square object-cover block"
                                            />
                                            {(img.alto || img.ancho) && (
                                                <div className="px-2.5 py-1.5 text-[11px] text-slate-500 bg-white">
                                                    {img.alto ? `${img.alto} cm` : ""}
                                                    {img.alto && img.ancho ? " × " : ""}
                                                    {img.ancho ? `${img.ancho} cm` : ""}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL VER IMAGEN */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]"
                    onClick={() => setSelectedIndex(null)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <button onClick={() => setSelectedIndex(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 border-none text-white w-10 h-10 rounded-full cursor-pointer text-lg flex items-center justify-center transition-colors">
                        ✕
                    </button>
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest whitespace-nowrap">
                        {selectedIndex + 1} / {images.length}
                        {images[selectedIndex]?.alto ? ` · ${images[selectedIndex].alto}${images[selectedIndex].ancho ? ` × ${images[selectedIndex].ancho}` : ""} cm` : ""}
                    </span>
                    <button onClick={prevImage}
                        className="absolute left-3 md:left-6 bg-white/10 hover:bg-white/25 border-none text-white w-11 h-11 rounded-full cursor-pointer text-2xl flex items-center justify-center transition-colors select-none">
                        ‹
                    </button>
                    <img
                        src={images[selectedIndex].url}
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[82vh] max-w-[80vw] md:max-w-[75vw] object-contain rounded-xl shadow-2xl"
                    />
                    <button onClick={nextImage}
                        className="absolute right-3 md:right-6 bg-white/10 hover:bg-white/25 border-none text-white w-11 h-11 rounded-full cursor-pointer text-2xl flex items-center justify-center transition-colors select-none">
                        ›
                    </button>
                    {images.length <= 20 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                                    className={`h-1.5 rounded-full border-none cursor-pointer p-0 transition-all ${i === selectedIndex ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL EDITAR */}
            {editingImg && (
                <EditModal
                    img={editingImg}
                    categories={categories}
                    onClose={() => setEditingImg(null)}
                    onSaved={() => { setEditingImg(null); fetchImages(); }}
                />
            )}

            {/* WHATSAPP */}
            <a
                href="https://wa.me/593968712610?text=Hola%20quiero%20información%20sobre%20sus%20bordados"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 p-3.5 rounded-full shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 48 48">
                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z" />
                    <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z" />
                    <path fill="#fff" fillRule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clipRule="evenodd" />
                </svg>
            </a>
        </div>
    );
}
