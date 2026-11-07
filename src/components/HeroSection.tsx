"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChevronDown,
  FileText,
  Cpu,
  Gauge,
  Fuel,
  Zap,
  Sparkles,
  Wrench,
} from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function HeroSection() {
  const quickPoles = [
    {
      href: "#bioethanol-e85",
      icon: Fuel,
      tag: "Priorité E85",
      title: "Bioéthanol E85",
      desc: "Étude de compatibilité & conversion",
      isE85: true,
    },
    {
      href: "#reprogrammation",
      icon: Gauge,
      tag: "Performance",
      title: "Reprogrammation Moteur",
      desc: "Optimisation sur-mesure & diagnostic",
      isE85: false,
    },
    {
      href: "#electronique",
      icon: Cpu,
      tag: "Point fort",
      title: "Électronique & Codage",
      desc: "Calculateurs, modules & adaptations",
      isE85: false,
    },
    {
      href: "#schemas-electriques",
      icon: Zap,
      tag: "Expertise",
      title: "Pannes & Schémas",
      desc: "Recherche de la cause réelle",
      isE85: false,
    },
  ];

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-white border-b border-aluminium">
      {/* Grande photographie automobile bien visible à droite + dégradé blanc lumineux à gauche */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-performance-light.jpg"
          alt="Véhicule sportif dans l'atelier de reprogrammation et d'électronique automobile Run Auto Marseille"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right lg:object-center scale-102 transform motion-safe:transition-transform motion-safe:duration-10000 motion-safe:hover:scale-100"
        />
        {/* Dégradé blanc pur progressif assurant un contraste optimal du texte tout en valorisant la voiture */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 lg:via-white/80 to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 w-full flex flex-col items-start justify-center">
        {/* Location & Specialization Badge */}
        <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-aluminium shadow-2xs mb-6">
          <span className="w-2 h-2 rounded-full bg-racing animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-carbone">
            Atelier Spécialisé • Marseille 13004
          </span>
          <span className="text-[11px] text-racing font-bold hidden sm:inline">
            • {GARAGE_CONFIG.equipment.flagshipName}
          </span>
        </div>

        {/* Titre principal en Noir Carbone (#17191D) avec « Bioéthanol E85 » en Rouge Racing (#D71920) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-carbone max-w-4xl leading-[1.05] mb-6 font-display">
          Spécialiste Reprogrammation,{" "}
          <span className="text-racing">Bioéthanol E85</span> &amp;{" "}
          <span className="text-carbone">Électronique Auto</span>.
        </h1>

        {/* Editorial Subtitle en Gris Technique (#626B75) */}
        <p className="text-base sm:text-xl text-technique max-w-2xl leading-relaxed font-normal mb-9">
          Adaptation au superéthanol E85, optimisation moteur sur-mesure, diagnostic électronique avancé, recherche de pannes complexes sur schémas constructeur, codage d&apos;options, Solutions FAP et mécanique générale au{" "}
          <strong className="text-carbone font-bold">52 boulevard de Roux (13004 Marseille)</strong>.
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-12">
          <Link
            href="/prendre-rendez-vous"
            className="btn-racing px-8 py-4 rounded-xl text-sm uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-3"
          >
            <Calendar className="w-5 h-5" />
            <span>Prendre rendez-vous</span>
          </Link>

          <Link
            href="/contact#formulaire"
            className="btn-outline-racing px-8 py-4 rounded-xl text-sm uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2.5"
          >
            <FileText className="w-4 h-4 text-racing" />
            <span>Demander un devis</span>
          </Link>

          <Link
            href="/contact?devis=e85#formulaire"
            className="btn-e85 px-5 py-4 rounded-xl text-xs uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-2"
          >
            <Fuel className="w-4 h-4" />
            <span>Devis E85</span>
          </Link>
        </div>

        {/* 4 Quick Technical Poles Bar (Cartes blanches, bordures gris aluminium, accents Rouge Racing & Vert E85) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-aluminium">
          {quickPoles.map((pole) => {
            const Icon = pole.icon;
            return (
              <a
                key={pole.title}
                href={pole.href}
                className={`group p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-aluminium shadow-[0_6px_20px_-4px_rgba(23,25,29,0.05)] transition-all flex items-start gap-3.5 ${
                  pole.isE85
                    ? "hover:border-e85 hover:shadow-[0_12px_28px_-6px_rgba(25,135,84,0.14)]"
                    : "hover:border-racing hover:shadow-[0_12px_28px_-6px_rgba(215,25,32,0.12)]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    pole.isE85
                      ? "bg-e85-soft border border-e85/25 text-e85 group-hover:bg-e85 group-hover:text-white"
                      : "bg-racing-soft border border-racing/25 text-racing group-hover:bg-racing group-hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                      pole.isE85 ? "text-e85" : "text-racing"
                    }`}
                  >
                    {pole.tag}
                  </span>
                  <p
                    className={`text-sm font-extrabold text-carbone transition-colors truncate ${
                      pole.isE85 ? "group-hover:text-e85" : "group-hover:text-racing"
                    }`}
                  >
                    {pole.title}
                  </p>
                  <p className="text-xs text-technique truncate">{pole.desc}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Secondary capabilities pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-technique">
          <span className="text-carbone font-bold mr-1">Également à l&apos;atelier :</span>
          <a
            href="#options"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-aluminium text-carbone font-medium hover:border-racing hover:text-racing transition-colors shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-racing" />
            Ajout &amp; activation d&apos;options
          </a>
          <a
            href="#solutions-fap"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-aluminium text-carbone font-medium hover:border-racing hover:text-racing transition-colors shadow-2xs"
          >
            Solutions FAP conformes
          </a>
          <a
            href="#mecanique-generale"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-aluminium text-carbone font-medium hover:border-racing hover:text-racing transition-colors shadow-2xs"
          >
            <Wrench className="w-3 h-3 text-racing" />
            Mécanique générale (freins, embrayage, distribution)
          </a>
        </div>
      </div>

      {/* Discrete Scroll Indicator */}
      <a
        href="#bioethanol-e85"
        aria-label="Découvrir le pôle Bioéthanol E85"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-xs text-technique hover:text-carbone transition-colors group"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 group-hover:opacity-100">
          Explorer nos pôles techniques
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce text-racing" />
      </a>
    </section>
  );
}
