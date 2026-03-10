import "../styles/contact.css";

export default function Contact() {
    return (
        <div className="contact-container">

            {/* FONDO ANIMADO */}
            <div className="embroidery-bg">
                <div className="machine">
                    <div className="needle"></div>
                    <div className="fabric"></div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="contact-card">

                <h1>Contáctanos</h1>
                <p>
                    Diseños de bordados personalizados para textiles.
                    Escríbenos o síguenos en redes sociales.
                </p>

                <div className="contact-info">

                    <div className="contact-item">
                        <span>📱 WhatsApp:</span>
                        <a
                            href="https://wa.me/593999999999"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Enviar mensaje
                        </a>
                    </div>

                    <div className="contact-item">
                        <span>📧 Email:</span>
                        <a href="mailto:correo@email.com">
                            correo@email.com
                        </a>
                    </div>

                    <div className="contact-item">
                        <span>📍 Dirección:</span>
                        <p>Cuenca, Ecuador</p>
                    </div>

                    <div className="contact-item">
                        <span>🎵 TikTok:</span>
                        <a
                            href="https://www.tiktok.com/@TUUSUARIO"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ver TikTok
                        </a>
                    </div>

                </div>

            </div>

        </div>
    );
}
