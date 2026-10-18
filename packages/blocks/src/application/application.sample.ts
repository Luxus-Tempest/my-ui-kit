import type { ApplicationFacture, ApplicationProps, FactureStatut } from "./Application";

/**
 * Données d'exemple : 96 factures déterministes (mêmes données à chaque rendu).
 * Remplace `invoices` par tes factures, et branche les actions (`onOpenInvoice`…).
 */

/** Générateur pseudo aléatoire à graine (mulberry32). */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUTS: FactureStatut[] = ["payee", "envoyee", "partielle", "en_retard", "brouillon"];
const CLIENTS = [
  { nom: "Atlas Négoce", initiales: "AN" },
  { nom: "Bennani & Fils", initiales: "BF" },
  { nom: "Café Zellige", initiales: "CZ" },
  { nom: "Électro Sud", initiales: "ES" },
  { nom: "Groupe Tazi", initiales: "GT" },
  { nom: "Imprimerie Ouarzazate", initiales: "IO" },
  { nom: "Majorelle Design", initiales: "MD" },
  { nom: "Sahara Logistique", initiales: "SL" },
];

function makeFactures(count: number, seed: number): ApplicationFacture[] {
  const random = seeded(seed);
  const start = new Date(2026, 0, 5).getTime();
  const day = 86_400_000;
  return Array.from({ length: count }, (_, i) => {
    const client = CLIENTS[Math.floor(random() * CLIENTS.length)]!;
    const emission = new Date(start + Math.floor(random() * 270) * day);
    return {
      id: `fac-${seed}-${i + 1}`,
      numero: `F-2026-${String(i + 1).padStart(4, "0")}`,
      client: client.nom,
      initiales: client.initiales,
      statut: STATUTS[Math.floor(random() ** 1.6 * STATUTS.length)]!,
      emission,
      echeance: new Date(emission.getTime() + 30 * day),
      montant: Math.round((800 + random() * 48_000) * 100) / 100,
    };
  });
}

export const applicationSample = {
  appName: "Acme Gestion",
  orgName: "Atlas Distribution SARL",
  user: { name: "Nadia Alami", role: "Comptable", initials: "NA" },
  invoices: makeFactures(96, 1207),
  periodLabel: "Exercice 2026",
  currency: "MAD",
  kpis: {
    comparisonLabel: "vs T2",
    encaisse: 0.082,
    aEncaisser: 0.031,
    retard: -0.12,
    paymentDelay: { value: 34, delta: -3, trend: [41, 39, 40, 38, 37, 37, 36, 35, 34] },
  },
} satisfies ApplicationProps;
