/**
 * Variables d'environnement, une fonction chacune, avec sa valeur par défaut.
 * La liste complète, documentée, est dans `.env.example`.
 */

/** URL publique de l'application (SEO, image de partage). */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** `true` : l'authentification de démonstration reste active en production (tests, présentation). */
export function authDemoAllowed() {
  return process.env.AUTH_DEMO === "true";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
