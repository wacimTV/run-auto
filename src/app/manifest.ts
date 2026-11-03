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
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
