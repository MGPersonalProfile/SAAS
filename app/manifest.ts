import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CHFM — Sistema de Gestión",
    short_name: "CHFM",
    description:
      "Plataforma institucional para la gestión presupuestaria, el PACC y los procesos de compra del Centro Hospitalario.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0b3d62",
    lang: "es",
    categories: ["business", "productivity", "government"],
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
