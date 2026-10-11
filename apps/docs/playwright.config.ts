import { defineConfig } from "@playwright/test";
import type { Mode } from "./tests/stories";

/*
 * Chaque story du Storybook construit, ouverte dans un vrai navigateur, en
 * clair, en sombre et de droite à gauche :
 * - accessibilité avec axe, contraste compris (jsdom ne sait pas le mesurer) ;
 * - régression visuelle : capture comparée à la référence.
 *
 * En local sous Windows, l'Edge installé suffit ; en CI, Chromium de Playwright.
 * Les références visuelles sont rangées par plateforme : celles de la CI (Linux)
 * ne se comparent pas à celles d'un poste Windows.
 */
const PORT = 6100;

export default defineConfig<{ mode: Mode }>({
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  // Une référence absente est créée (premier passage, nouvelle story) ; une référence existante est comparée.
  updateSnapshots: "missing",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  // Une story lourde (Aperçu, Blocs) : axe et capture pleine page prennent du temps.
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: {
      // Anticrénelage des polices et des courbes : un écart minuscule n'est pas une régression.
      maxDiffPixelRatio: 0.002,
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.CI || process.platform !== "win32" ? undefined : "msedge",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    // Durées des jetons à zéro, graphiques sans animation : des captures stables.
    reducedMotion: "reduce",
    locale: "fr-FR",
    timezoneId: "Africa/Casablanca",
  },
  projects: [
    { name: "clair", use: { mode: "light", colorScheme: "light" } },
    { name: "sombre", use: { mode: "dark", colorScheme: "dark" } },
    { name: "rtl", use: { mode: "rtl", colorScheme: "light" } },
  ],
  webServer: {
    command: `node tests/serve-static.mjs storybook-static ${PORT}`,
    url: `http://localhost:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
});
