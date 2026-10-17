/*
 * Sous chemins de @rovia/ui : un point d'entrée par dossier de composant
 * (`@rovia/ui/button`) et pour `theme`, `i18n`, `hooks`, `utils`.
 *
 * Pour chaque dossier, ce script écrit un `index.ts` qui réexporte tous ses
 * modules (tests exclus), puis met à jour `exports` dans package.json.
 * Tout est réexporté, pas seulement ce qu'expose le barrel : un composant
 * éjecté (spec 0001) importe ses voisins par `@rovia/ui/<dossier>`, et doit
 * y trouver chaque nom qu'il importait par chemin relatif.
 *
 *   node scripts/subpaths.mjs          écrit les fichiers
 *   node scripts/subpaths.mjs --check  échoue s'ils ne sont pas à jour
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");
const check = process.argv.includes("--check");

/** Dossiers hors composants exposés en sous chemin. */
export const SHARED = ["theme", "i18n", "hooks", "utils"];

const isModule = (name) =>
  /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts") && name !== "index.ts";

async function modules(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await modules(path)));
    else if (isModule(entry.name)) out.push(path);
  }
  return out.sort();
}

/** Liste des sous chemins : `{ name, dir }`, `dir` relatif à `src`. */
export async function listSubpaths() {
  const components = (await readdir(join(src, "components"), { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => ({ name: d.name, dir: `components/${d.name}` }));
  const all = [...SHARED.map((name) => ({ name, dir: name })), ...components];
  const result = [];
  for (const sub of all) {
    const files = await modules(join(src, sub.dir));
    if (files.length > 0) result.push({ ...sub, files });
  }
  return result;
}

function indexSource(sub) {
  const lines = sub.files.map((file) => {
    const spec = "./" + relative(join(src, sub.dir), file).split(sep).join("/").replace(/\.(ts|tsx)$/, "");
    return `export * from "${spec}";`;
  });
  return `/* Généré par scripts/subpaths.mjs : point d'entrée de @rovia/ui/${sub.name}. Ne pas modifier à la main. */\n${lines.join("\n")}\n`;
}

function exportsMap(subs, current) {
  const map = {
    ".": current["."],
    "./styles.css": current["./styles.css"],
    "./styles.dev.css": current["./styles.dev.css"],
  };
  for (const sub of subs) {
    map[`./${sub.name}`] = {
      types: `./dist/${sub.dir}/index.d.ts`,
      import: `./dist/${sub.dir}/index.js`,
    };
  }
  return map;
}

const subs = await listSubpaths();
const stale = [];

for (const sub of subs) {
  const file = join(src, sub.dir, "index.ts");
  const wanted = indexSource(sub);
  const actual = await readFile(file, "utf8").catch(() => null);
  if (actual !== wanted) {
    stale.push(relative(root, file));
    if (!check) await writeFile(file, wanted);
  }
}

const pkgFile = join(root, "package.json");
const pkgText = await readFile(pkgFile, "utf8");
const pkg = JSON.parse(pkgText);
pkg.exports = exportsMap(subs, pkg.exports);
const wantedPkg = JSON.stringify(pkg, null, 2) + "\n";
if (wantedPkg !== pkgText.replace(/\r\n/g, "\n")) {
  stale.push("package.json (exports)");
  if (!check) await writeFile(pkgFile, wantedPkg);
}

if (check && stale.length > 0) {
  console.error(`Sous chemins pas à jour : ${stale.join(", ")}.\nLance \`node scripts/subpaths.mjs\` dans packages/ui.`);
  process.exit(1);
}
if (!check) console.log(`${subs.length} sous chemins ; ${stale.length} fichier(s) écrit(s).`);
