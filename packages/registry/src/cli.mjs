#!/usr/bin/env node
/*
 * `pnpm registry:build` : écrit le registre dans apps/docs/storybook-static/r/
 * (ou `--out <dossier>`), à côté du Storybook construit, pour GitHub Pages.
 *
 * Variables :
 *   REGISTRY_BASE_URL  URL publique (défaut : GitHub Pages du dépôt)
 *   REGISTRY_PKG_SPEC  version déclarée pour @rovia/ui dans chaque élément
 *                      (défaut : ^<version de packages/ui> ; en CI : file:<archive>)
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "./build.mjs";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const args = process.argv.slice(2);
const outArg = args.indexOf("--out");
const out = outArg >= 0 ? resolve(args[outArg + 1]) : join(repo, "apps/docs/storybook-static/r");

const uiRoot = join(repo, "packages/ui");
const { version } = JSON.parse(await readFile(join(uiRoot, "package.json"), "utf8"));
const baseUrl = process.env.REGISTRY_BASE_URL ?? "https://luxus-tempest.github.io/my-ui-kit";

const { registry, items, errors } = await buildRegistry({
  uiRoot,
  blocksRoot: join(repo, "packages/blocks"),
  storiesRoot: join(repo, "apps/docs/stories"),
  version,
  pkgSpec: process.env.REGISTRY_PKG_SPEC || undefined,
  baseUrl,
});

if (errors.length > 0) {
  console.error(`Registre invalide (${errors.length} erreur${errors.length > 1 ? "s" : ""}) :\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await writeFile(join(out, "registry.json"), JSON.stringify(registry, null, 2) + "\n");
for (const item of items) await writeFile(join(out, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
const blocks = items.filter((i) => i.type === "registry:block").length;
console.log(`Registre écrit dans ${out} : ${blocks} bloc(s), ${items.length - blocks} composant(s) à éjecter.`);
