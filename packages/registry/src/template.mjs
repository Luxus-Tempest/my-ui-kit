#!/usr/bin/env node
/*
 * Blocs du starter `templates/next` (spec 0002) : copies exactes du registre @rovia.
 *
 *   pnpm template:sync    écrit les blocs listés dans templates/next/rovia.json à leurs cibles
 *                         (`@components/…` → templates/next/components/…), et met à jour
 *                         package.json : `@rovia/ui@^<version>` et les dépendances des blocs ;
 *   pnpm template:check   fait la même chose en mémoire et échoue si le modèle diffère.
 *
 * Le contenu est écrit tel quel (même code que le registre) : un `shadcn add` des mêmes blocs
 * donne les mêmes fichiers.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, packageName } from "./build.mjs";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const template = join(repo, "templates/next");
const check = process.argv.includes("--check");

const uiRoot = join(repo, "packages/ui");
const { version } = JSON.parse(await readFile(join(uiRoot, "package.json"), "utf8"));
const { blocks } = JSON.parse(await readFile(join(template, "rovia.json"), "utf8"));

const { items, errors } = await buildRegistry({
  uiRoot,
  blocksRoot: join(repo, "packages/blocks"),
  version,
  baseUrl: "https://luxus-tempest.github.io/my-ui-kit",
});
if (errors.length > 0) {
  console.error(`Registre invalide :\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

/** Fichiers attendus dans le modèle : chemin relatif → contenu. */
const wanted = new Map();
const dependencies = {};
for (const name of blocks) {
  const item = items.find((i) => i.name === name);
  if (!item) {
    console.error(`rovia.json : « ${name} » n'est pas un élément du registre.`);
    process.exit(1);
  }
  for (const file of item.files) {
    if (!file.target.startsWith("@components/")) throw new Error(`Cible inattendue : ${file.target}`);
    wanted.set(join("components", file.target.slice("@components/".length)), file.content);
  }
  for (const dep of item.dependencies) {
    const at = dep.lastIndexOf("@");
    dependencies[packageName(dep.slice(0, at))] = dep.slice(at + 1);
  }
}

const pkgFile = join(template, "package.json");
const pkgText = await readFile(pkgFile, "utf8");
const pkg = JSON.parse(pkgText);
pkg.dependencies = Object.fromEntries(Object.entries({ ...pkg.dependencies, ...dependencies }).sort(([a], [b]) => a.localeCompare(b)));
wanted.set("package.json", JSON.stringify(pkg, null, 2) + "\n");

const stale = [];
for (const [rel, content] of wanted) {
  const file = join(template, rel);
  const actual = await readFile(file, "utf8").catch(() => null);
  if (actual?.replace(/\r\n/g, "\n") === content) continue;
  stale.push(rel.split("\\").join("/"));
  if (!check) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  }
}

if (check && stale.length > 0) {
  console.error(`Le modèle templates/next n'est pas à jour avec le registre :\n- ${stale.join("\n- ")}\nLance \`pnpm template:sync\`.`);
  process.exit(1);
}
console.log(check ? "Modèle à jour avec le registre." : `${blocks.length} blocs ; ${stale.length} fichier(s) écrit(s).`);
