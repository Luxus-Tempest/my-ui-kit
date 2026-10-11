// Assemble src/styles.css (ses @import, dans l'ordre) en deux fichiers :
// - dist/styles.css     : minifié, celui que les applications importent ;
// - dist/styles.dev.css : lisible, commentaires compris, pour le débogage.
import { build } from "esbuild";
import { readFileSync, statSync } from "node:fs";

const entry = "src/styles.css";
const count = [...readFileSync(entry, "utf8").matchAll(/@import\s+["'](.+?)["']/g)].length;

const common = {
  entryPoints: [entry],
  bundle: true,
  logLevel: "warning",
  // Les navigateurs visés comprennent nativement color-mix(), :has(), les propriétés logiques et l'imbrication.
  target: ["chrome120", "edge120", "firefox121", "safari16.4"],
};

await build({ ...common, outfile: "dist/styles.css", minify: true });
await build({ ...common, outfile: "dist/styles.dev.css", minify: false });

const ko = (f) => (statSync(f).size / 1024).toFixed(0);
console.log(`dist/styles.css généré (${count} fichiers) : ${ko("dist/styles.css")} Ko minifié, ${ko("dist/styles.dev.css")} Ko lisible`);
