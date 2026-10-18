/** Page d'arrivée après connexion, quand aucun retour valide n'est demandé. */
export const HOME_AFTER_SIGN_IN = "/tableau-de-bord";

/**
 * Chemin de retour sûr : seulement un chemin interne (`/…`). `//autre.site` et `/\autre.site`
 * sont refusés, sinon on redirigerait vers un autre domaine.
 */
export function safeNext(value: unknown): string {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : HOME_AFTER_SIGN_IN;
}
