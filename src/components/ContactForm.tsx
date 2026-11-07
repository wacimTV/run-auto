"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { QUOTE_SUBJECTS } from "@/config/garage";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: QUOTE_SUBJECTS[0].label,
    message: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pré-sélection automatique de l'objet lorsque le visiteur clique sur « Demander un devis E85 », etc.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const devisKey = params.get("devis");
    if (devisKey) {
      const found = QUOTE_SUBJECTS.find((q) => q.key === devisKey);
      if (found) {
        setFormData((prev) => ({ ...prev, subject: found.label }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          website_trap: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'envoi.");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: QUOTE_SUBJECTS[0].label,
        message: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="formulaire"
      className="bg-white border border-aluminium rounded-2xl p-6 sm:p-10 shadow-[0_14px_40px_-10px_rgba(23,25,29,0.06)] relative scroll-mt-28"
    >
      <h3 className="text-2xl font-extrabold text-carbone mb-2 font-display">
        Demander un devis ou nous écrire
      </h3>
      <p className="text-xs text-technique mb-8">
        Conversion bioéthanol E85, reprogrammation moteur, diagnostic électronique, ajout d&apos;options, Solutions FAP ou mécanique : indiquez votre véhicule (marque, modèle, année ou immatriculation) pour une réponse précise.
      </p>

      {/* Honeypot field for anti-spam */}
      <input
        type="text"
        name="website_trap"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-racing-soft border border-racing/30 flex items-start gap-3 text-racing text-xs">
          <AlertCircle className="w-4 h-4 text-racing shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success ? (
        <div className="p-8 text-center rounded-xl bg-glacier border border-racing/35 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-racing mx-auto" />
          <h4 className="text-lg font-extrabold text-carbone">Message envoyé avec succès !</h4>
          <p className="text-xs text-technique">
            Nous avons bien reçu votre demande et vous recontacterons dans les plus brefs délais pendant nos heures d&apos;ouverture (Lun–Ven 09:00–19:00).
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="btn-outline-racing px-5 py-2.5 rounded-xl text-xs font-bold mt-2"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Votre nom et prénom"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
              Adresse e-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre.email@domaine.fr"
              className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
              Objet de votre demande
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone focus:outline-none focus:bg-white focus:border-racing"
            >
              {QUOTE_SUBJECTS.map((s) => (
                <option key={s.key} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
              Votre véhicule &amp; votre demande *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Précisez la marque, le modèle, la motorisation (ou l'immatriculation) ainsi que votre besoin (conversion E85, reprogrammation, voyant allumé, codage, mécanique...)"
              className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-racing w-full py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Envoyer ma demande</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
