"use client";
/* @rovia/ui 1.1.0 · parametres */
import type { ParametresProps } from "./Parametres";

/** Données d'exemple : le bloc s'affiche dès l'installation. Branche `onSaveProfile` et `onDeleteAccount`. */
export const parametresSample = {
  user: {
    firstName: "Inès",
    lastName: "Benali",
    email: "ines@exemple.ma",
    bio: "Responsable financière chez Atlas Distribution.",
    language: "fr",
    timezone: "casa",
  },
  devices: [
    { id: "pc", name: "Windows · Edge", description: "Casablanca · cet appareil", kind: "computer", current: true },
    { id: "iphone", name: "iPhone 16", description: "Rabat · il y a 2 jours", kind: "phone" },
  ],
  plan: { name: "Offre Essentiel", description: "15 Go · gratuit", usedPercent: 21, usageLabel: "3,2 Go sur 15 Go", upgradeLabel: "Passer à 100 Go" },
  paymentMethod: { label: "Visa •••• 4242", expiry: "Expire 08/2028" },
  deleteDescription: "Vos 3,2 Go de fichiers et vos partages seront supprimés définitivement dans 30 jours.",
} satisfies ParametresProps;
