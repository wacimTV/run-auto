"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Key, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Mot de passe erroné");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-glacier px-4 py-16">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-aluminium shadow-[0_14px_40px_-10px_rgba(23,25,29,0.07)] space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/images/logo-run-auto.png"
            alt="Logo Run Auto Marseille"
            width={150}
            height={66}
            className="h-14 w-auto object-contain mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-carbone font-display">Espace Gestion Atelier</h1>
          <p className="text-xs text-technique">
            Accès sécurisé réservé au responsable du garage Run Auto.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-racing-soft border border-racing/30 flex items-center gap-2 text-racing text-xs">
            <AlertCircle className="w-4 h-4 text-racing shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-2">
              Mot de passe administrateur
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 pl-10 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
              <Key className="w-4 h-4 text-technique absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-racing w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <span>Se connecter au tableau de bord</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-aluminium text-center">
          <p className="text-[11px] text-technique">
            Accès protégé. Les tentatives de connexion sont limitées et journalisées.
          </p>
        </div>
      </div>
    </div>
  );
}
