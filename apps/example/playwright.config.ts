import { defineConfig } from "@playwright/test";

/*
 * Test de fumée de l'application d'exemple, sur le build de production :
 * chaque page s'hydrate sans erreur, les interactions clés marchent. Il casse
 * si une version de @rovia/ui casse l'intégration Next.js (composants serveur,
 * server actions, thème).
 */
const PORT = 3101;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Peu de pages, un serveur qui démarre à froid : peu de navigateurs en parallèle, délai large.
  workers: 3,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.CI || process.platform !== "win32" ? undefined : "msedge",
    locale: "fr-FR",
  },
  webServer: {
    command: `next start -p ${PORT}`,
    url: `http://localhost:${PORT}/connexion`,
    reuseExistingServer: !process.env.CI,
  },
});
