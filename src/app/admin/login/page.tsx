"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/lib/actions/admin";
import { Key, Mail, AlertCircle, Wrench } from "lucide-react";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <main className="min-h-svh bg-glacier flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white border border-aluminium p-6 sm:p-8 shadow-[0_14px_40px_-10px_rgba(23,25,29,0.08)]">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-aluminium">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-run-auto.png"
              alt="Logo Run Auto Marseille"
              width={130}
              height={57}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-racing-soft border border-racing/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-racing">
            <Wrench className="w-3.5 h-3.5" />
            Atelier
          </span>
        </div>

        <h1 className="font-display mt-5 text-2xl sm:text-3xl font-extrabold uppercase text-carbone">
          Espace administrateur
        </h1>
        <p className="mt-1 text-xs text-technique">
          Accès sécurisé réservé au responsable de l&apos;atelier Run Auto Marseille.
        </p>

        {state.error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-racing/40 bg-racing-soft px-4 py-3 text-xs font-semibold text-racing flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        ) : null}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5"
            >
              Email administrateur
            </label>
            <div className="relative">
              <input
                id="admin-email"
                name="email"
                type="email"
                defaultValue="contact@runauto-marseille.fr"
                required
                autoComplete="username"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 pl-10 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
              <Mail className="w-4 h-4 text-technique absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                placeholder="Entrez votre mot de passe administrateur"
                autoComplete="current-password"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 pl-10 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
              <Key className="w-4 h-4 text-technique absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-racing w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isPending ? "Connexion en cours…" : "Se connecter à l'atelier"}
          </button>
        </form>

        <p className="mt-6 pt-4 border-t border-aluminium text-center text-xs text-technique">
          <Link href="/" className="font-semibold hover:text-racing transition-colors">
            ← Retour au site public Run Auto
          </Link>
        </p>
      </div>
    </main>
  );
}
