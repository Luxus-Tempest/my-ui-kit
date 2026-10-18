import { siteUrl } from "@/lib/env";

/** Identité de l'application : titre des pages, SEO, image de partage, manifeste. */
export const siteConfig = {
  name: "Mon application",
  /** Nom court (écran d'accueil d'un téléphone). */
  shortName: "Mon app",
  description: "Une application construite avec @rovia/ui : coque, thème, langues et écrans prêts à l'emploi.",
  url: siteUrl(),
  /** Couleurs du navigateur (barre d'adresse mobile), alignées sur le fond `--ui-app`. */
  themeColor: { light: "#f6f8fc", dark: "#131416" },
} as const;
