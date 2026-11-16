"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Rafraîchit automatiquement les données du tableau de bord atelier toutes les 30 secondes
 * et émet un signal sonore (Web Audio API) dès qu'une nouvelle demande de RDV ou de devis arrive.
 */
export function AdminWorkshopMonitor({
  latestSignalStamp,
}: {
  latestSignalStamp: number;
}) {
  const router = useRouter();
  const prevStampRef = useRef<number>(latestSignalStamp);

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    if (latestSignalStamp > prevStampRef.current) {
      prevStampRef.current = latestSignalStamp;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const playTone = (
            freq: number,
            startOffset: number,
            duration: number
          ) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.22, ctx.currentTime + startOffset);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + startOffset + duration
            );
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startOffset);
            osc.stop(ctx.currentTime + startOffset + duration);
          };
          playTone(880, 0, 0.18);
          playTone(1174.66, 0.2, 0.28);
        }
      } catch {
        // Ignorer si le navigateur bloque l'audio sans interaction préalable
      }
    }
  }, [latestSignalStamp]);

  return null;
}
