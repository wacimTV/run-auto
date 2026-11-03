"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Calendar, Menu, X, Cpu, MapPin, Fuel } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Calcul de l'état ouvert/fermé en temps réel à Marseille
    const checkOpenStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const min = now.getMinutes();
      const currentTime = hour * 60 + min;

      // Lun-Ven: 09h00 (540m) à 19h00 (1140m) en continu
      if (day >= 1 && day <= 5) {
        if (currentTime >= 540 && currentTime < 1140) {
          setIsOpenNow(true);
          return;
        }
      }
      setIsOpenNow(false);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/prestations/conversion-bioethanol-e85", label: "Bioéthanol E85", highlightE85: true },
    { href: "/prestations/reprogrammation-moteur", label: "Reprogrammation" },
    { href: "/prestations", label: "Prestations" },
    { href: "/le-garage", label: "L'Atelier" },
    { href: "/contact", label: "Devis & Contact" },
  ];

  return (
    <>
      {/* Barre supérieure Gris Glacier (#F2F4F6) et bordure Gris Aluminium (#E2E6EA) */}
      <div className="bg-glacier border-b border-aluminium text-xs py-2 px-4 sm:px-8 text-technique hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-medium text-carbone">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpenNow ? "bg-e85 animate-pulse" : "bg-technique/50"
                }`}
              />
              {isOpenNow
                ? "Atelier ouvert (Lun–Ven 09:00–19:00)"
                : "Atelier fermé (ouvre Lun–Ven à 09h00)"}
            </span>
            <a
              href={GARAGE_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-racing transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-racing" />
              {GARAGE_CONFIG.contact.address}, {GARAGE_CONFIG.contact.postalCode}{" "}
              {GARAGE_CONFIG.contact.city}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-carbone font-semibold">
              <Cpu className="w-3.5 h-3.5 text-racing" />
              Équipé {GARAGE_CONFIG.equipment.flagshipName}
            </span>
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 text-carbone hover:text-racing font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-racing" />
              {GARAGE_CONFIG.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Header principal Blanc Pur (#FFFFFF) */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-aluminium py-3.5 shadow-[0_8px_28px_-6px_rgba(23,25,29,0.07)]"
            : "bg-white border-b border-aluminium py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo Run Auto : Noir Carbone (#17191D) & Rouge Racing (#D71920) */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="relative w-10 h-10 rounded-lg bg-carbone border border-carbone flex items-center justify-center shadow-xs group-hover:bg-racing group-hover:border-racing transition-all duration-300">
              <span className="text-white font-black tracking-tighter text-lg font-display italic">
                R
              </span>
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-racing group-hover:bg-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-[0.16em] text-carbone uppercase font-display leading-none">
                RUN <span className="text-racing">AUTO</span>
              </span>
              <span className="text-[10px] tracking-[0.22em] text-technique uppercase mt-1 font-semibold">
                E85 • Reprog • Électronique
              </span>
            </div>
          </Link>

          {/* Navigation Desktop en texte Noir Carbone, actif souligné en Rouge Racing */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" &&
                  pathname.startsWith(link.href) &&
                  link.href !== "/prestations");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-200 relative py-1.5 flex items-center gap-1.5 ${
                    isActive
                      ? "text-carbone font-extrabold"
                      : "text-carbone/85 hover:text-racing"
                  }`}
                >
                  {link.highlightE85 && <Fuel className="w-3.5 h-3.5 text-e85" />}
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                        link.highlightE85 ? "bg-e85" : "bg-racing"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="btn-outline-racing flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl"
            >
              <Phone className="w-3.5 h-3.5 text-racing" />
              <span>{GARAGE_CONFIG.contact.phoneDisplay}</span>
            </a>

            <Link
              href="/prendre-rendez-vous"
              className="btn-racing px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 font-bold"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Prendre rendez-vous</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl text-carbone bg-glacier border border-aluminium hover:border-racing focus:outline-none transition-colors"
            aria-label="Menu principal"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/98 backdrop-blur-2xl xl:hidden pt-24 px-6 pb-24 flex flex-col justify-between overflow-y-auto">
          <nav className="flex flex-col gap-3 text-base">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3.5 px-4 rounded-xl border flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-racing-soft border-racing text-carbone font-extrabold"
                      : "bg-glacier border-aluminium text-carbone font-semibold hover:border-racing"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.highlightE85 && <Fuel className="w-4 h-4 text-e85" />}
                    {link.label}
                  </span>
                  <span className="text-xs text-racing font-bold">→</span>
                </Link>
              );
            })}
            <Link
              href="/prendre-rendez-vous"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3.5 px-4 rounded-xl border border-aluminium bg-glacier text-carbone font-semibold flex items-center justify-between"
            >
              <span>Réservation en ligne</span>
              <span className="text-xs text-racing font-bold">→</span>
            </Link>
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-aluminium mt-6">
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="btn-outline-racing flex items-center justify-center gap-2 text-sm py-3.5 rounded-xl"
            >
              <Phone className="w-4 h-4 text-racing" />
              <span>Appeler le {GARAGE_CONFIG.contact.phoneDisplay}</span>
            </a>

            <Link
              href="/prendre-rendez-vous"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-racing text-center py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Prendre rendez-vous</span>
            </Link>

            <p className="text-xs text-center text-technique mt-1">
              52 boulevard de Roux, 13004 Marseille • Lun–Ven 09:00–19:00
            </p>
          </div>
        </div>
      )}
    </>
  );
}
