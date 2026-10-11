/* Données de démonstration partagées par les stories (graphiques, tableaux, exemples). */

const mad = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 });
export const formatMad = (v: number) => mad.format(v);

export const MONTHS = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

export const REVENUE = MONTHS.map((mois, i) => ({
  mois,
  ca: Math.round(182000 + i * 9500 + Math.sin(i * 1.3) * 22000),
  charges: Math.round(141000 + i * 5200 + Math.cos(i * 0.9) * 15000),
  objectif: 190000 + i * 8000,
}));

export const BY_REGION = [
  { region: "Casablanca", produits: 412000, services: 268000 },
  { region: "Rabat", produits: 236000, services: 191000 },
  { region: "Marrakech", produits: 198000, services: 122000 },
  { region: "Tanger", produits: 151000, services: 97000 },
  { region: "Agadir", produits: 88000, services: 64000 },
];

export const BY_FAMILY = [
  { label: "Logiciels", value: 482000 },
  { label: "Matériel", value: 311000 },
  { label: "Formation", value: 164000 },
  { label: "Support", value: 129000 },
  { label: "Conseil", value: 96000 },
  { label: "Licences", value: 41000 },
  { label: "Divers", value: 18000 },
];
