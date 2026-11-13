import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy : n'autorise que le site lui-même, plus
 * Cloudflare Turnstile (anti-robot) et Google Maps (carte chargée au clic).
 * 'unsafe-inline' reste nécessaire pour les scripts d'hydratation Next.js et le JSON-LD.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
  "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Jamais de cache pour l'admin et les API
      {
        source: "/(admin|api)/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
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
