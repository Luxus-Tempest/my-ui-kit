/* Factures de démonstration, déterministes : DataTable, blocs Application et Tableau de bord. */
import * as React from "react";
import type { BadgeVariant } from "@rovia/ui";
import { CircleAlert, CircleCheck, CircleDashed, FilePen, Send } from "lucide-react";

/** Générateur pseudo-aléatoire à graine (mulberry32) : mêmes données à chaque rendu. */
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Statut = "payee" | "envoyee" | "partielle" | "en_retard" | "brouillon";

export const STATUTS: Record<Statut, { label: string; tone: BadgeVariant; icon: React.ReactNode }> = {
  payee: { label: "Payée", tone: "ok", icon: <CircleCheck /> },
  envoyee: { label: "Envoyée", tone: "pri", icon: <Send /> },
  partielle: { label: "Partielle", tone: "warn", icon: <CircleDashed /> },
  en_retard: { label: "En retard", tone: "err", icon: <CircleAlert /> },
  brouillon: { label: "Brouillon", tone: "neu", icon: <FilePen /> },
};
export const STATUT_KEYS = Object.keys(STATUTS) as Statut[];

export const CLIENTS = [
  { nom: "Atlas Négoce", initiales: "AN" },
  { nom: "Bennani & Fils", initiales: "BF" },
  { nom: "Café Zellige", initiales: "CZ" },
  { nom: "Électro Sud", initiales: "ES" },
  { nom: "Groupe Tazi", initiales: "GT" },
  { nom: "Imprimerie Ouarzazate", initiales: "IO" },
  { nom: "Majorelle Design", initiales: "MD" },
  { nom: "Sahara Logistique", initiales: "SL" },
];

export interface Facture {
  id: string;
  numero: string;
  client: string;
  initiales: string;
  statut: Statut;
  emission: Date;
  echeance: Date;
  montant: number;
}

export function makeFactures(count: number, seed: number): Facture[] {
  const random = seeded(seed);
  const start = new Date(2026, 0, 5).getTime();
  const day = 86_400_000;
  return Array.from({ length: count }, (_, i) => {
    const client = CLIENTS[Math.floor(random() * CLIENTS.length)];
    const emission = new Date(start + Math.floor(random() * 270) * day);
    return {
      id: `fac-${seed}-${i + 1}`,
      numero: `F-2026-${String(i + 1).padStart(4, "0")}`,
      client: client.nom,
      initiales: client.initiales,
      statut: STATUT_KEYS[Math.floor(random() ** 1.6 * STATUT_KEYS.length)],
      emission,
      echeance: new Date(emission.getTime() + 30 * day),
      montant: Math.round((800 + random() * 48_000) * 100) / 100,
    };
  });
}
