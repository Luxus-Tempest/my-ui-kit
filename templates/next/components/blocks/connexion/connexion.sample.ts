"use client";
/* @rovia/ui 1.0.0 · connexion */
import type { ConnexionProps } from "./Connexion";

/**
 * Données d'exemple : le bloc s'affiche dès l'installation. Remplace-les par
 * les tiennes, et branche `onSubmit` sur ton authentification.
 */
export const connexionSample = {
  appName: "Nuage",
  description: "Accédez à vos fichiers, où que vous soyez.",
  providers: [{ id: "google", label: "Continuer avec Google" }],
  forgotPasswordHref: "#mot-de-passe-oublie",
  signUpHref: "#inscription",
  /** Message à afficher quand les identifiants sont refusés. */
  errorMessage: "Adresse ou mot de passe incorrect.",
} satisfies Omit<ConnexionProps, "onSubmit"> & { errorMessage: string };
