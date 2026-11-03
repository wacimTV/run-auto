"use client";

import React from "react";
import Link from "next/link";
import { Phone, Calendar } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function MobileActionBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-aluminium p-3 px-4 flex items-center gap-3 lg:hidden shadow-[0_-8px_24px_rgba(23,25,29,0.07)]">
      <a
        href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
        className="flex-1 btn-outline-racing flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase tracking-wider"
        aria-label="Appeler le garage Run Auto"
      >
        <Phone className="w-4 h-4 text-racing" />
        <span>{GARAGE_CONFIG.contact.phoneDisplay}</span>
      </a>

      <Link
        href="/prendre-rendez-vous"
        className="flex-[1.3] btn-racing flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
      >
        <Calendar className="w-4 h-4" />
        <span>Rendez-vous</span>
      </Link>
    </div>
  );
}
