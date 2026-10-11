// Budget de poids : ce qu'une application embarque selon ce qu'elle importe.
// Chaque scénario est bundlé depuis dist/ comme le ferait l'application
// (esbuild, sideEffects respecté, React externe), puis mesuré en gzip.
// Échoue si un budget est dépassé ou si une dépendance lourde fuit là où
// elle n'a rien à faire (ECharts dans un bouton…).
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const ECHARTS = /zrender/;
const TANSTACK = /getCoreRowModel/;

/** budget : Ko gzip au plus ; absent : motifs qui ne doivent pas figurer dans le bundle. */
const SCENARIOS = [
  { name: "Button", imports: ["Button"], budget: 5, absent: [ECHARTS, TANSTACK] },
  { name: "Formulaire (Field, Input, Select, Checkbox)", imports: ["Field", "Input", "Select", "SelectTrigger", "SelectContent", "SelectItem", "Checkbox"], budget: 40, absent: [ECHARTS, TANSTACK] },
  { name: "Dialog + Menu + Toast", imports: ["Dialog", "DialogContent", "Menu", "MenuContent", "MenuItem", "Toaster", "toast"], budget: 50, absent: [ECHARTS, TANSTACK] },
  { name: "DataTable", imports: ["DataTable"], budget: 95, absent: [ECHARTS] },
  { name: "LineChart", imports: ["LineChart"], budget: 245, absent: [TANSTACK] },
  { name: "Tout le paquet", imports: null, budget: 480, absent: [] },
];
const CSS_BUDGET = 40;

const failures = [];

// Le barrel ne porte pas "use client" (sinon un composant serveur embarque tout le paquet).
if (readFileSync(dist, "utf8").startsWith('"use client"')) {
  failures.push('dist/index.js commence par "use client" : en Next.js, chaque page embarquerait tout le paquet.');
}

const kb = (bytes) => (bytes / 1024).toFixed(1);
console.log("Scénario".padEnd(48), "gzip".padStart(9), "budget".padStart(9));
for (const s of SCENARIOS) {
  const source = s.imports
    ? `import { ${s.imports.join(", ")} } from ${JSON.stringify(dist)}; console.log(${s.imports.join(", ")});`
    : `import * as all from ${JSON.stringify(dist)}; console.log(all);`;
  const result = await build({
    stdin: { contents: source, resolveDir: process.cwd(), loader: "js" },
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    external: ["react", "react-dom", "react/jsx-runtime"],
    logLevel: "error",
  });
  const code = result.outputFiles[0].text;
  const gz = gzipSync(code).length;
  const over = gz / 1024 > s.budget;
  console.log(s.name.padEnd(48), `${kb(gz)} Ko`.padStart(9), `${s.budget} Ko`.padStart(9), over ? "  DÉPASSÉ" : "");
  if (over) failures.push(`${s.name} : ${kb(gz)} Ko gzip pour un budget de ${s.budget} Ko.`);
  for (const pattern of s.absent) {
    if (pattern.test(code)) failures.push(`${s.name} embarque ${pattern === ECHARTS ? "ECharts" : "TanStack Table"}.`);
  }
}

const css = gzipSync(readFileSync(new URL("../dist/styles.css", import.meta.url))).length;
console.log("styles.css".padEnd(48), `${kb(css)} Ko`.padStart(9), `${CSS_BUDGET} Ko`.padStart(9), css / 1024 > CSS_BUDGET ? "  DÉPASSÉ" : "");
if (css / 1024 > CSS_BUDGET) failures.push(`styles.css : ${kb(css)} Ko gzip pour un budget de ${CSS_BUDGET} Ko.`);

if (failures.length) {
  console.error(`\n${failures.length} problème(s) :\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nBudgets respectés.");
