import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Run Auto Marseille – Reprogrammation, Bioéthanol E85 & Électronique",
    short_name: "Run Auto",
    description:
      "Atelier spécialisé en reprogrammation moteur, conversion bioéthanol E85, diagnostic électronique et mécanique générale à Marseille 13004.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#E10600",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
