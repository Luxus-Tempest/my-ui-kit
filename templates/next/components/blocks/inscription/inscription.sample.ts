"use client";
/* @rovia/ui 1.1.0 · inscription */
import type { InscriptionProps } from "./Inscription";

/**
 * Données d'exemple : le bloc s'affiche dès l'installation. Remplace-les par
 * les tiennes, et branche `onSubmit` sur ta création de compte.
 */
export const inscriptionSample = {
  appName: "Nuage",
  description: "15 Go gratuits pour commencer.",
  signInHref: "#connexion",
} satisfies Omit<InscriptionProps, "onSubmit">;
