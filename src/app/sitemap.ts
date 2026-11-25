import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { getSiteData } from "@/lib/siteData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const { services } = await getSiteData();

  const staticRoutes = [
    "",
    "/prestations",
    "/le-garage",
    "/garage-marseille-13004",
    "/prendre-rendez-vous",
    "/contact",
    "/faq",
    "/mentions-legales",
    "/politique-confidentialite",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/prestations/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
