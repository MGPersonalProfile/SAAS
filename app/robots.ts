import type { MetadataRoute } from "next";

/**
 * Sistema interno institucional — no queremos indexación pública.
 * Bloqueamos todo: la app no debe aparecer en buscadores.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
