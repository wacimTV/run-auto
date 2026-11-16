import { MetadataRoute } from "next";
import { SITE_INDEXABLE, absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Adresse de test (.vercel.app) : aucun référencement
  if (!SITE_INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
