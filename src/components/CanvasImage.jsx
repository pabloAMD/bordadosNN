import { useEffect, useRef } from "react";

export default function CanvasImage({ src }) {

    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;

        img.onload = () => {

            const containerHeight = canvas.parentElement.clientHeight;
            const scale = containerHeight / img.height;

            const width = img.width * scale;
            const height = containerHeight;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
        };

    }, [src]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                height: "100%",
                width: "100%",
                display: "block",
                objectFit: "cover",
            }}
        />
    );
}
