import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Les contrôles axe et les surcouches Radix sont lents dans jsdom quand toute
    // la suite tourne en parallèle (Windows, CI) : 5 s par défaut ne suffisent pas.
    testTimeout: 20_000,
  },
});
