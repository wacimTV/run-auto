"use client";

import React, { useActionState } from "react";
import { changePasswordAction, type PasswordChangeState } from "@/lib/actions/admin";
import { ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

const initialState: PasswordChangeState = {};

export default function AdminPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );

  const inputClass =
    "w-full rounded-xl border border-aluminium bg-glacier px-3.5 py-2.5 text-xs text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors";

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-racing/40 bg-racing-soft px-4 py-3 text-xs font-semibold text-racing flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {state.success ? (
        <div
          role="status"
          className="rounded-xl border border-e85/40 bg-e85-soft px-4 py-3 text-xs font-semibold text-e85 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="sec-old-pwd"
          className="block text-[11px] font-bold uppercase tracking-wider text-carbone mb-1.5"
        >
          Ancien mot de passe *
        </label>
        <input
          id="sec-old-pwd"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sec-new-pwd"
            className="block text-[11px] font-bold uppercase tracking-wider text-carbone mb-1.5"
          >
            Nouveau mot de passe (12 caractères min.) *
          </label>
          <input
            id="sec-new-pwd"
            name="newPassword"
            type="password"
            minLength={12}
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="sec-confirm-pwd"
            className="block text-[11px] font-bold uppercase tracking-wider text-carbone mb-1.5"
          >
            Confirmer le nouveau mot de passe *
          </label>
          <input
            id="sec-confirm-pwd"
            name="confirmPassword"
            type="password"
            minLength={12}
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-technique flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-e85 shrink-0" />
          Chiffré avec bcrypt • Déconnecte automatiquement toutes les autres sessions.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="btn-racing rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{isPending ? "Enregistrement…" : "Changer mon mot de passe"}</span>
        </button>
      </div>
    </form>
  );
}
