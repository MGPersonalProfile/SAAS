import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Icono maskable para Android adaptive icons.
 * El centro 80% (radio 40% desde el centro) debe contener el contenido
 * legible — el resto puede ser recortado por la máscara del launcher.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b3d62",
        }}
      >
        {/* Safe zone: 80% del canvas. Letras dentro de ese círculo. */}
        <div
          style={{
            width: "80%",
            height: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 180,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          CH
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
