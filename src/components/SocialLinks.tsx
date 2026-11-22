import React from "react";
import { GarageSettings } from "@/types";

interface SocialItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

function normalizeWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export default function SocialLinks({
  settings,
  compact = false,
}: {
  settings?: GarageSettings;
  compact?: boolean;
}) {
  if (!settings) return null;

  const items: SocialItem[] = [];

  if (settings.instagram?.trim()) {
    items.push({
      key: "instagram",
      label: "Instagram",
      href: settings.instagram.trim(),
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    });
  }

  if (settings.facebook?.trim()) {
    items.push({
      key: "facebook",
      label: "Facebook",
      href: settings.facebook.trim(),
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
        </svg>
      ),
    });
  }

  if (settings.tiktok?.trim()) {
    items.push({
      key: "tiktok",
      label: "TikTok",
      href: settings.tiktok.trim(),
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V8.94a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-1-.11z" />
        </svg>
      ),
    });
  }

  if (settings.snapchat?.trim()) {
    items.push({
      key: "snapchat",
      label: "Snapchat",
      href: settings.snapchat.trim(),
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.9">
          <path d="M12 3c-3.1 0-5.3 2.1-5.3 5.2 0 .9.1 1.8.2 2.5-.5.2-1.1.3-1.4.5-.4.2-.5.6-.3.9.2.3.7.5 1.3.7-.3 1.1-1.3 2.2-2.7 2.8-.4.2-.5.6-.2.9.6.5 1.7.8 2.7.9.2.5.4 1.1.7 1.3.4.3 1 .1 1.7 0 .7-.1 1.4.8 3.3.8s2.6-.9 3.3-.8c.7.1 1.3.3 1.7 0 .3-.2.5-.8.7-1.3 1-.1 2.1-.4 2.7-.9.3-.3.2-.7-.2-.9-1.4-.6-2.4-1.7-2.7-2.8.6-.2 1.1-.4 1.3-.7.2-.3.1-.7-.3-.9-.3-.2-.9-.3-1.4-.5.1-.7.2-1.6.2-2.5C17.3 5.1 15.1 3 12 3z" />
        </svg>
      ),
    });
  }

  const waHref = settings.whatsapp ? normalizeWhatsApp(settings.whatsapp) : null;
  if (waHref) {
    items.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: waHref,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center ${compact ? "justify-center gap-2.5" : "gap-2"}`}>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-aluminium text-carbone hover:border-racing hover:text-racing transition-colors text-xs font-bold shadow-2xs"
        >
          {item.icon}
          <span className={compact ? "text-[11px]" : "sr-only sm:not-sr-only text-[11px]"}>
            {item.label}
          </span>
        </a>
      ))}
    </div>
  );
}
