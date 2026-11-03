import { MetadataRoute } from "next";
import { GARAGE_CONFIG } from "@/config/garage";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://runauto-marseille.fr";

  const staticRoutes = [
    "",
    "/prestations",
    "/le-garage",
    "/prendre-rendez-vous",
    "/contact",
    "/faq",
    "/mentions-legales",
    "/politique-confidentialite",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-10-27"),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const serviceRoutes = GARAGE_CONFIG.services.map((service) => ({
    url: `${baseUrl}/prestations/${service.slug}`,
    lastModified: new Date("2026-10-27"),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
