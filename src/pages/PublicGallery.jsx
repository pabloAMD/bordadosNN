import { useEffect, useState, useRef } from "react";
import { supabase } from "../supaConfig/supabaseClient";
import { processImage } from "../utils/imageProcessor";

// Rangos de alto disponibles para filtrar
const ALTO_RANGOS = [
    { label: "Hasta 5 cm", min: 0, max: 5 },
    { label: "5 – 10 cm", min: 5, max: 10 },
    { label: "10 – 15 cm", min: 10, max: 15 },
    { label: "15 – 20 cm", min: 15, max: 20 },
    { label: "Más de 20 cm", min: 20, max: null },
];

function Sidebar({ categories, selectedCategory, onSelect, selectedAlto, onSelectAlto }) {
    return (
        <aside style={{ width: "200px", flexShrink: 0, position: "sticky", top: "72px", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "12px", paddingLeft: "4px" }}>Categorías</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <li><button onClick={() => onSelect(null)} style={btnStyle(!selectedCategory)}>Todas</button></li>
                    {categories.map((cat) => (
                        <li key={cat.id}><button onClick={() => onSelect(cat.id)} style={btnStyle(selectedCategory === cat.id)}>{cat.name}</button></li>
                    ))}
                </ul>
            </div>
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "12px", paddingLeft: "4px" }}>Alto (cm)</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <li><button onClick={() => onSelectAlto(null)} style={btnStyle(!selectedAlto)}>Todos</button></li>
                    {ALTO_RANGOS.map((rango) => (
                        <li key={rango.label}><button onClick={() => onSelectAlto(rango)} style={btnStyle(selectedAlto?.label === rango.label)}>{rango.label}</button></li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

function btnStyle(active) {
    return { width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500, background: active ? "#0f3460" : "transparent", color: active ? "white" : "#475569", transition: "background 0.15s" };
}

function pillStyle(active, secondary = false) {
    return { flexShrink: 0, padding: "6px 14px", borderRadius: "999px", border: active ? "none" : "1px solid #e2e8f0", background: active ? (secondary ? "#334155" : "#0f3460") : "white", color: active ? "white" : "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
}

// ── MODAL EDITAR ──
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

            // Si eligió nueva foto, subirla y eliminar la anterior
            if (newFile) {
                const processed = await processImage(newFile);
                const fileName = Date.now() + "_" + newFile.name;
                const { error: upErr } = await supabase.storage.from("images").upload(fileName, processed);
                if (upErr) throw upErr;
                const { data } = supabase.storage.from("images").getPublicUrl(fileName);
                url = data.publicUrl;

                // Eliminar foto anterior del storage
                try {
                    const oldPath = decodeURIComponent(img.url.split("/storage/v1/object/public/images/")[1]);
                    await supabase.storage.from("images").remove([oldPath]);
                } catch (_) {
                    // Si falla el delete no bloqueamos el flujo
                }
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "480px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Editar imagen</h3>
                    <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", color: "#64748b" }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Preview + cambiar foto */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <img src={preview} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                        <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px", border: "2px dashed #e2e8f0", borderRadius: "12px", cursor: "pointer", gap: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                                {newFile ? newFile.name : "Cambiar foto"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>opcional</span>
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                        </label>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "6px" }}>Categoría</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", background: "white" }}
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dimensiones */}
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "6px" }}>
                            Dimensiones <span style={{ fontWeight: 400, textTransform: "none" }}>(cm, opcional)</span>
                        </label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="number"
                                placeholder="Alto"
                                min="0"
                                step="0.1"
                                value={alto}
                                onChange={(e) => setAlto(e.target.value)}
                                style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                            />
                            <input
                                type="number"
                                placeholder="Ancho"
                                min="0"
                                step="0.1"
                                value={ancho}
                                onChange={(e) => setAncho(e.target.value)}
                                style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#475569" }}>
                        Cancelar
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: saving ? "#94a3b8" : "#0f3460", color: "white", fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
                    >
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingImg, setEditingImg] = useState(null);
    const touchStartX = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Detectar sesión admin
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsAdmin(!!data.session);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
            setIsAdmin(!!session);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchImages();
        loadCategories();
    }, []);

    useEffect(() => {
        fetchImages();
    }, [selectedCategory, selectedAlto]);

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

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: isMobile ? "8px" : "16px",
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8f7f4" }}>

            {/* HERO */}
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", color: "white" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "32px 16px" : "48px 32px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#93c5fd", marginBottom: "8px" }}>Colección</p>
                    <h1 style={{ fontSize: isMobile ? "28px" : "44px", fontWeight: 800, margin: "0 0 8px 0", lineHeight: 1.2 }}>Diseños de Bordados</h1>
                    <p style={{ color: "#bfdbfe", fontSize: isMobile ? "13px" : "15px", maxWidth: "480px" }}>Bordados textiles personalizados, hechos con detalle y dedicación.</p>
                    {images.length > 0 && (
                        <p style={{ marginTop: "12px", color: "#93c5fd", fontSize: "13px" }}>
                            {images.length} diseño{images.length !== 1 ? "s" : ""} · {activeLabel}
                            {selectedAlto ? ` · ${selectedAlto.label}` : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* CONTENIDO */}
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 32px" }}>

                {/* FILTROS MOBILE */}
                {isMobile && (
                    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ overflowX: "auto", display: "flex", gap: "8px", paddingBottom: "4px" }}>
                            <button onClick={() => setSelectedCategory(null)} style={pillStyle(!selectedCategory)}>Todas</button>
                            {categories.map((cat) => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={pillStyle(selectedCategory === cat.id)}>{cat.name}</button>
                            ))}
                        </div>
                        <div style={{ overflowX: "auto", display: "flex", gap: "8px", paddingBottom: "4px" }}>
                            <button onClick={() => setSelectedAlto(null)} style={pillStyle(!selectedAlto, true)}>Todos los altos</button>
                            {ALTO_RANGOS.map((rango) => (
                                <button key={rango.label} onClick={() => setSelectedAlto(rango)} style={pillStyle(selectedAlto?.label === rango.label, true)}>{rango.label}</button>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: "24px" }}>

                    {/* SIDEBAR desktop */}
                    {!isMobile && (
                        <Sidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                            selectedAlto={selectedAlto}
                            onSelectAlto={setSelectedAlto}
                        />
                    )}

                    {/* GALERÍA */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {loading ? (
                            <div style={gridStyle}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} style={{ aspectRatio: "1", borderRadius: "16px", background: "#e2e8f0" }} />
                                ))}
                            </div>
                        ) : images.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>No hay imágenes con esos filtros</div>
                        ) : (
                            <div style={gridStyle}>
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        style={{ borderRadius: "16px", overflow: "hidden", background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", transition: "transform 0.2s, box-shadow 0.2s", position: "relative" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.08)"; }}
                                    >
                                        {/* Botón editar — solo admin */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingImg(img); }}
                                                style={{
                                                    position: "absolute", top: "8px", right: "8px", zIndex: 10,
                                                    background: "rgba(15,52,96,0.85)", backdropFilter: "blur(4px)",
                                                    border: "none", borderRadius: "8px", color: "white",
                                                    padding: "5px 10px", fontSize: "11px", fontWeight: 700,
                                                    cursor: "pointer", letterSpacing: "0.05em",
                                                }}
                                            >
                                                ✏️ Editar
                                            </button>
                                        )}

                                        <div onClick={() => setSelectedIndex(index)} style={{ cursor: "pointer" }}>
                                            <img
                                                src={img.url}
                                                alt=""
                                                loading="lazy"
                                                style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                                            />
                                            {(img.alto || img.ancho) && (
                                                <div style={{ padding: "6px 10px", fontSize: "11px", color: "#64748b", background: "white" }}>
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
                    onClick={() => setSelectedIndex(null)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
                >
                    <button onClick={() => setSelectedIndex(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                    <span style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                        {selectedIndex + 1} / {images.length}
                        {images[selectedIndex]?.alto ? ` · ${images[selectedIndex].alto}${images[selectedIndex].ancho ? ` × ${images[selectedIndex].ancho}` : ""} cm` : ""}
                    </span>

                    <button onClick={prevImage} style={{ position: "absolute", left: "12px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>

                    <img
                        src={images[selectedIndex].url}
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: "82vh", maxWidth: isMobile ? "86vw" : "75vw", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                    />

                    <button onClick={nextImage} style={{ position: "absolute", right: "12px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>

                    {images.length <= 20 && (
                        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
                            {images.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }} style={{ width: i === selectedIndex ? "16px" : "6px", height: "6px", borderRadius: "999px", background: i === selectedIndex ? "white" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "width 0.2s" }} />
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
                    onSaved={() => {
                        setEditingImg(null);
                        fetchImages();
                    }}
                />
            )}

            {/* WHATSAPP */}
            <a
                href="https://wa.me/593968712610?text=Hola%20quiero%20información%20sobre%20sus%20bordados"
                target="_blank"
                rel="noreferrer"
                style={{ position: "fixed", bottom: "24px", right: "24px", background: "#22c55e", borderRadius: "50%", padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = ""}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 48 48">
                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"/>
                    <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"/>
                    <path fill="#fff" fillRule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clipRule="evenodd"/>
                </svg>
            </a>
        </div>
    );
}
