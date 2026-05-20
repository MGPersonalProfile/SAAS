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
    dir: "ltr",
    categories: ["business", "productivity", "government"],
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Vista ejecutiva con KPIs y alertas.",
        url: "/dashboard",
      },
      {
        name: "Nuevo proceso de compra",
        short_name: "Nuevo proceso",
        description: "Crea un nuevo proceso de compra.",
        url: "/compras/nuevo",
      },
      {
        name: "Alertas",
        short_name: "Alertas",
        description: "Detección de posible fraccionamiento.",
        url: "/alertas",
      },
      {
        name: "PACC",
        short_name: "PACC",
        description: "Plan Anual de Compras y Contrataciones.",
        url: "/pacc",
      },
    ],
  };
}
