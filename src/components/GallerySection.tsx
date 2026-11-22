import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { GalleryPhoto } from "@/types";

export default function GallerySection({
  gallery,
  title = "Galerie & Réalisations de l'Atelier",
  subtitle = "Aperçu de nos interventions en conversion Bioéthanol E85, reprogrammation moteur, diagnostic électronique et mécanique.",
}: {
  gallery: GalleryPhoto[];
  title?: string;
  subtitle?: string;
}) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="py-20 bg-white border-t border-aluminium">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5 text-racing" />
            <span>Galerie Atelier</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone font-display mb-3">
            {title}
          </h2>
          <p className="text-sm text-technique leading-relaxed">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gallery.map((photo) => {
            const isUpload = photo.src.startsWith("/api/");
            return (
              <figure
                key={photo.id}
                className="group rounded-2xl overflow-hidden bg-glacier border border-aluminium shadow-[0_6px_20px_-4px_rgba(23,25,29,0.05)] hover:border-racing/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-glacier">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    unoptimized={isUpload}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photo.vehicleTag ? (
                    <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/95 backdrop-blur-md border border-aluminium px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-carbone shadow-xs">
                      {photo.vehicleTag}
                    </span>
                  ) : null}
                </div>
                <figcaption className="p-4 text-xs text-technique font-medium leading-relaxed">
                  {photo.alt}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
