/** Exécuté une fois au démarrage du serveur. */
export function register() {
  if (process.env.NODE_ENV === "production" && process.env.AUTH_DEMO === "true") {
    console.warn(
      "[auth] AUTH_DEMO=true : l'authentification de démonstration est active en production. " +
        "N'importe qui peut se connecter ; branche ton fournisseur dans lib/auth.ts.",
    );
  }
}
