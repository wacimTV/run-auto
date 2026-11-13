"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

/**
 * Carte Google Maps chargée uniquement après un clic du visiteur :
 * aucun cookie ni requête vers Google tant qu'il n'a pas accepté (RGPD / CNIL).
 */
export default function GoogleMapEmbed({ minHeight = 420 }: { minHeight?: number }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title="Carte localisation Run Auto Marseille 13004"
        src={GARAGE_CONFIG.contact.googleMapsEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: `${minHeight}px` }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full h-full"
      />
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-glacier"
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="w-12 h-12 rounded-xl bg-racing-soft border border-racing/25 flex items-center justify-center text-racing">
        <MapPin className="w-6 h-6" />
      </div>
      <p className="text-sm font-bold text-carbone">{GARAGE_CONFIG.contact.fullAddress}</p>
      <p className="text-xs text-technique max-w-sm">
        L&apos;affichage de la carte charge un contenu Google Maps, qui peut déposer des cookies.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="btn-racing px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Afficher la carte
        </button>
        <a
          href={GARAGE_CONFIG.contact.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-racing px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Ouvrir dans Google Maps
        </a>
      </div>
    </div>
  );
}
