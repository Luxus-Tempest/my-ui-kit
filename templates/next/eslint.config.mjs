import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    // Copies du registre @rovia : régénérées par `shadcn add … --overwrite`, à modifier librement
    // mais pas soumises à tes règles de lint (retire cette ligne si tu veux les y soumettre).
    "components/blocks/**",
  ]),
]);

export default eslintConfig;
