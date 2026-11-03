import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // Anciens slugs redirigés proprement pour préserver le référencement et les liens existants
      {
        source: "/prestations/echappement-antipollution",
        destination: "/prestations/solutions-fap",
        permanent: true,
      },
      {
        source: "/prestations/pneumatiques-geometrie",
        destination: "/prestations/mecanique-generale",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
