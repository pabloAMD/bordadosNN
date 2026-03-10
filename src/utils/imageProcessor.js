import imageCompression from "browser-image-compression";

export const processImage = async (file) => {

    const img = await loadImage(URL.createObjectURL(file));

    const MAX_WIDTH = 1600;

    let width = img.width;
    let height = img.height;

    // Reducir resolución
    if (width > MAX_WIDTH) {
        const scale = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = height * scale;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    // Imagen original
    ctx.drawImage(img, 0, 0, width, height);

    // =====================
    // WATERMARK
    // =====================

    const watermark = await loadImage("/marca.png");

    const topFreeArea = canvas.height * 0.18; // zona sin marca

    ctx.save();

    ctx.globalAlpha = 0.35; // intensidad watermark

    // dibujar watermark SOLO debajo del header
    ctx.drawImage(
        watermark,
        0,
        topFreeArea,
        canvas.width,
        canvas.height - topFreeArea
    );

    ctx.restore();

    return await canvasToFile(canvas, file.name);
};


// helpers

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        img.src = src;
    });
}

function canvasToFile(canvas, name) {
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(new File([blob], name, {
                    type: "image/jpeg"
                }));
            },
            "image/jpeg",
            0.9
        );
    });
}
