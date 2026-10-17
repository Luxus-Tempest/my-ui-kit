import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "tsup";

// Un point d'entrée par module de composant (en plus de l'index) : le build ESM
// garde la structure en modules, découpés par esbuild. Avec `sideEffects`
// limité au CSS dans package.json, un bundler écarte tout composant non
// importé — en particulier les graphiques, dont ECharts enregistre ses modules
// au chargement : une application sans graphique ne paie pas ECharts.
const componentEntries = ["src/components/**/*.{ts,tsx}", "!src/components/**/*.test.{ts,tsx}"];
// Sous chemins hors composants (`@rovia/ui/theme`, `i18n`, `hooks`, `utils`), voir scripts/subpaths.mjs.
const sharedEntries = ["src/{theme,i18n,hooks,utils}/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}"];

/**
 * Le barrel ESM ne doit pas porter "use client". Avec la directive, un
 * composant serveur (Next.js) qui importe `{ Button }` fait de tout le paquet
 * une seule frontière client : la page de connexion embarquait ECharts et
 * TanStack Table (606 Ko gzip au lieu de 193). Sans elle, le barrel n'est qu'un
 * module de réexports et seuls les modules réellement importés, qui gardent
 * leur "use client", partent chez le client. La ligne est remplacée par un
 * commentaire pour ne pas décaler la source map.
 * Même traitement pour l'`index.js` de chaque sous chemin (`@rovia/ui/button`…).
 */
async function stripDirective(file: string) {
  const code = await readFile(file, "utf8");
  if (!code.startsWith('"use client";')) throw new Error(`${file} : directive "use client" attendue en tête.`);
  await writeFile(file, code.replace('"use client";', "/* Barrel : réexports seulement, chaque module porte son \"use client\". */"));
}

async function barrelsWithoutDirective() {
  await stripDirective("dist/index.js");
  for (const dir of ["theme", "i18n", "hooks", "utils"]) await stripDirective(join("dist", dir, "index.js"));
  for (const entry of await readdir("dist/components", { withFileTypes: true })) {
    const file = join("dist/components", entry.name, "index.js");
    if (entry.isDirectory() && (await readFile(file, "utf8").catch(() => null)) !== null) await stripDirective(file);
  }
}

export default defineConfig([
  {
    entry: ["src/index.ts", ...componentEntries, ...sharedEntries],
    format: ["esm"],
    splitting: true,
    // Types : `tsc -p tsconfig.build.json` après tsup, un .d.ts par module (sous chemins compris).
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
    onSuccess: barrelsWithoutDirective,
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
