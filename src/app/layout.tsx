import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import { GARAGE_CONFIG } from "@/config/garage";
import { SITE_URL, SITE_INDEXABLE, absoluteUrl } from "@/config/site";
import { storage } from "@/lib/storage";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Run Auto Marseille | Reprogrammation Moteur, Conversion Bioéthanol E85 & Diagnostic Électronique",
    template: "%s | Run Auto Marseille",
  },
  description:
    "Atelier spécialisé en reprogrammation moteur, conversion bioéthanol E85, diagnostic électronique avancé (TOPDON Phoenix Max), recherche de panne sur schémas électriques, ajout d'options, Solutions FAP et mécanique générale à Marseille (13004).",
  keywords: [
    "Reprogrammation moteur Marseille",
    "Conversion bioéthanol E85 Marseille",
    "Diagnostic électronique automobile Marseille",
    "Recherche de panne électrique automobile Marseille",
    "Ajout d'options automobile Marseille",
    "Diagnostic voiture Marseille",
    "Mécanique automobile Marseille",
    "Solution FAP Marseille",
    "Codage calculateur Marseille",
    "Run Auto Marseille 13004",
  ],
  authors: [{ name: "Run Auto Marseille" }],
  creator: "Run Auto",
  publisher: "Run Auto",
  // Pas de référencement tant que le site est sur une adresse de test (.vercel.app)
  robots: {
    index: SITE_INDEXABLE,
    follow: SITE_INDEXABLE,
    googleBot: {
      index: SITE_INDEXABLE,
      follow: SITE_INDEXABLE,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Run Auto Marseille | Reprogrammation Moteur, Bioéthanol E85 & Électronique Automobile",
    description:
      "Spécialiste reprogrammation moteur, conversion E85, diagnostic électronique avancé, recherche de panne électrique et mécanique générale au 52 boulevard de Roux, 13004 Marseille.",
    siteName: "Run Auto Marseille",
    images: [
      {
        url: "/images/hero-performance.jpg",
        width: 1376,
        height: 768,
        alt: "Run Auto Marseille – Reprogrammation moteur, Bioéthanol E85 & Électronique automobile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Run Auto Marseille | Reprogrammation Moteur, E85 & Électronique Auto",
    description:
      "Adaptation Bioéthanol E85, reprogrammation moteur, diagnostic électronique TOPDON Phoenix Max et mécanique générale à Marseille 13004.",
    images: ["/images/hero-performance.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD Schema.org enrichi pour le SEO Local Automobile à Marseille
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: GARAGE_CONFIG.name,
  description: GARAGE_CONFIG.activity,
  logo: absoluteUrl("/images/logo-run-auto.png"),
  image: absoluteUrl("/images/hero-performance.jpg"),
  "@id": absoluteUrl("/#garage"),
  url: SITE_URL,
  telephone: GARAGE_CONFIG.contact.phoneInternational,
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: GARAGE_CONFIG.contact.address,
    addressLocality: GARAGE_CONFIG.contact.city,
    postalCode: GARAGE_CONFIG.contact.postalCode,
    addressRegion: GARAGE_CONFIG.contact.region,
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: GARAGE_CONFIG.contact.coordinates.latitude,
    longitude: GARAGE_CONFIG.contact.coordinates.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Prestations Run Auto Marseille",
    itemListElement: GARAGE_CONFIG.services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.shortDescription,
        url: absoluteUrl(`/prestations/${s.slug}`),
      },
    })),
  },
  // Pas d'aggregateRating : Google interdit les avis "auto-hébergés" issus d'une plateforme tierce.
  legalName: GARAGE_CONFIG.legal.raisonSociale,
  taxID: GARAGE_CONFIG.legal.tvaIntracommunautaire.replace(/\s/g, ""),
  sameAs: [GARAGE_CONFIG.partner.idGaragesUrl],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteState;
  try {
    siteState = await storage.getSiteAdminState();
  } catch {
    siteState = undefined;
  }

  return (
    <html lang="fr" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-blanc text-carbone font-sans antialiased selection:bg-racing selection:text-white min-h-screen flex flex-col pb-16 lg:pb-0">
        <Header settings={siteState?.settings} hours={siteState?.hours} />
        <main className="flex-1">{children}</main>
        <Footer settings={siteState?.settings} hours={siteState?.hours} />
        <MobileActionBar
          phoneDisplay={siteState?.settings.phone}
          onlineBookingEnabled={siteState?.settings.onlineBookingEnabled}
        />
      </body>
    </html>
  );
}
