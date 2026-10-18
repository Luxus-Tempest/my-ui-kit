import { defineConfig } from "@playwright/test";

/*
 * Tests de l'application construite (`pnpm build` d'abord), servie par `next start` :
 * - port 3100 : authentification de démonstration autorisée (AUTH_DEMO=true) ;
 * - port 3101 : sans AUTH_DEMO, pour vérifier que la démo refuse de fonctionner en production.
 */
const PORT = Number(process.env.PW_PORT ?? 3100);
const REFUSAL_PORT = PORT + 1;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 800 },
    // Navigateur installé à utiliser (`msedge`, `chrome`) ; par défaut, le Chromium de Playwright.
    channel: process.env.PW_CHANNEL || undefined,
  },
  webServer: [
    {
      command: `pnpm start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { AUTH_DEMO: "true" },
    },
    {
      command: `pnpm start -p ${REFUSAL_PORT}`,
      url: `http://localhost:${REFUSAL_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { AUTH_DEMO: "" },
    },
  ],
});

export { REFUSAL_PORT };
