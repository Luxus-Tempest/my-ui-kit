import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

// Un point d'entrée par module de composant (en plus de l'index) : le build ESM
// garde la structure en modules, découpés par esbuild. Avec `sideEffects`
// limité au CSS dans package.json, un bundler écarte tout composant non
// importé — en particulier les graphiques, dont ECharts enregistre ses modules
// au chargement : une application sans graphique ne paie pas ECharts.
const componentEntries = ["src/components/**/*.{ts,tsx}", "!src/components/**/*.test.{ts,tsx}"];

/**
 * Le barrel ESM ne doit pas porter "use client". Avec la directive, un
 * composant serveur (Next.js) qui importe `{ Button }` fait de tout le paquet
 * une seule frontière client : la page de connexion embarquait ECharts et
 * TanStack Table (606 Ko gzip au lieu de 193). Sans elle, le barrel n'est qu'un
 * module de réexports et seuls les modules réellement importés, qui gardent
 * leur "use client", partent chez le client. La ligne est remplacée par un
 * commentaire pour ne pas décaler la source map.
 */
async function barrelWithoutDirective() {
  const file = "dist/index.js";
  const code = await readFile(file, "utf8");
  if (!code.startsWith('"use client";')) throw new Error(`${file} : directive "use client" attendue en tête.`);
  await writeFile(file, code.replace('"use client";', "/* Barrel : réexports seulement, chaque module porte son \"use client\". */"));
}

export default defineConfig([
  {
    entry: ["src/index.ts", ...componentEntries],
    format: ["esm"],
    splitting: true,
    dts: { entry: "src/index.ts" },
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
    onSuccess: barrelWithoutDirective,
  },
  {
    // CommonJS : un seul fichier (le découpage n'existe qu'en ESM), qui garde la directive.
    entry: ["src/index.ts"],
    format: ["cjs"],
    sourcemap: true,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
  },
]);
