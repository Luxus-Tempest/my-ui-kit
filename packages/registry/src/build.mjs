/*
 * Générateur du registre @rovia (spec 0001) : des fichiers JSON au format
 * shadcn, produits depuis le code, jamais écrits à la main.
 *
 * - Un élément de **bloc** par dossier de `packages/blocks/src/` : copié dans
 *   l'application, il importe les composants par `@rovia/ui/<sous chemin>`.
 * - Un élément d'**éjection** par dossier de `packages/ui/src/components/` :
 *   le dossier seul est copié, ses imports vers le reste de la librairie sont
 *   réécrits vers le paquet (`../button/Button` → `@rovia/ui/button`).
 *
 * Les imports sont lus par le compilateur TypeScript (pas d'expression
 * régulière : un nom de paquet dans un commentaire ne compte pas).
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import ts from "typescript";

const SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const SHARED = ["theme", "i18n", "hooks", "utils"];
const PEERS = new Set(["react", "react-dom"]);
const PACKAGE = "@rovia/ui";

const toPosix = (p) => p.split(sep).join("/");
const isSource = (name) => /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts");
const isCopied = (name) => isSource(name) || name.endsWith(".css");

/** `echarts/core` → `echarts`, `@scope/pkg/x` → `@scope/pkg`. */
export function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/**
 * Imports d'un module, avec leur position dans le texte (pour la réécriture).
 * Les `import type` / `export type` sont ignorés : ils disparaissent au build.
 */
export function readImports(fileName, code) {
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];
  const add = (node, typeOnly) => {
    if (node && ts.isStringLiteral(node)) found.push({ spec: node.text, start: node.getStart(source) + 1, end: node.getEnd() - 1, typeOnly });
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) add(node.moduleSpecifier, Boolean(node.importClause?.isTypeOnly));
    else if (ts.isExportDeclaration(node)) add(node.moduleSpecifier, node.isTypeOnly);
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) add(node.arguments[0], false);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

async function listFiles(dir, keep) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(path, keep)));
    else if (keep(entry.name)) out.push(path);
  }
  return out.sort();
}

async function subdirs(dir) {
  return (await readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

/** Remplace des tranches de texte (de la fin vers le début, pour garder les positions). */
function splice(code, edits) {
  let out = code;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

/**
 * En tête de chaque module copié. Le CLI shadcn supprime un commentaire placé
 * en tout premier : la directive vient donc avant l'en tête (spec 0001, AC-5).
 * Seul l'en tête des `index.ts` générés (« Généré par … ») est remplacé ; un
 * commentaire de documentation en tête de module est gardé.
 */
function withHeader(code, version, item, extraImports = []) {
  let body = code.replace(/^﻿/, "").replace(/^\s*["']use client["'];?\s*/, "");
  body = body.replace(/^\/\* Généré par [\s\S]*?\*\/\s*/, "");
  const lines = [`"use client";`, `/* ${PACKAGE} ${version} · ${item} */`, ...extraImports];
  return `${lines.join("\n")}\n${body}`;
}

function dependencyList(names, versions, pkgSpec, errors, where) {
  const deps = [`${PACKAGE}@${pkgSpec}`];
  for (const name of [...names].sort()) {
    const version = versions[name];
    if (!version) errors.push(`${where} : la dépendance « ${name} » n'a pas de version dans package.json.`);
    else deps.push(`${name}@${version}`);
  }
  return deps;
}

/**
 * Construit tous les éléments du registre.
 * @param {{ uiRoot: string, blocksRoot: string, storiesRoot?: string, version: string, pkgSpec?: string, baseUrl: string }} options
 * @returns {Promise<{ registry: object, items: object[], errors: string[] }>}
 */
export async function buildRegistry({ uiRoot, blocksRoot, storiesRoot, version, pkgSpec, baseUrl }) {
  const errors = [];
  const items = [];
  const spec = pkgSpec ?? `^${version}`;
  const uiPkg = JSON.parse(await readFile(join(uiRoot, "package.json"), "utf8"));
  const blocksPkg = JSON.parse(await readFile(join(blocksRoot, "package.json"), "utf8"));
  const uiVersions = { ...uiPkg.dependencies };
  const blockVersions = { ...blocksPkg.dependencies };
  const uiSrc = join(uiRoot, "src");
  const componentsDir = join(uiSrc, "components");

  // Sous chemins réellement exposés par le paquet (voir packages/ui/scripts/subpaths.mjs).
  const subpaths = new Set(Object.keys(uiPkg.exports ?? {}).filter((k) => k.startsWith("./") && !k.endsWith(".css")).map((k) => k.slice(2)));

  /* ── Éjection : un dossier de composant ─────────────────────────────── */
  for (const folder of await subdirs(componentsDir)) {
    const dir = join(componentsDir, folder);
    const files = await listFiles(dir, isCopied);
    const modules = files.filter((f) => isSource(f));
    if (modules.length === 0) continue; // `popup` : surface CSS partagée, déjà dans styles.css
    const where = `éjection « ${folder} »`;
    const cssFiles = files.filter((f) => f.endsWith(".css")).map((f) => "./" + toPosix(relative(dir, f)));
    const npm = new Set();
    const out = [];
    for (const file of files) {
      const rel = toPosix(relative(dir, file));
      const code = await readFile(file, "utf8");
      if (file.endsWith(".css")) {
        out.push({ path: `ui/${folder}/${rel}`, type: "registry:file", target: `@components/rovia/${folder}/${rel}`, content: `/* ${PACKAGE} ${version} · ${folder} */\n${code}` });
        continue;
      }
      const edits = [];
      const depth = rel.split("/").length - 1; // fichiers en sous dossier : un `../` de plus
      for (const imp of readImports(file, code)) {
        if (imp.spec.startsWith(".")) {
          const target = toPosix(join(folder, ...Array(depth).fill(".."), imp.spec)); // relatif à components/
          const parts = target.split("/");
          if (parts[0] === folder) continue; // reste dans le dossier
          let rewritten = null;
          if (parts[0] === ".." && SHARED.includes(parts[1])) rewritten = `${PACKAGE}/${parts[1]}`;
          else if (parts[0] !== ".." && subpaths.has(parts[0])) rewritten = `${PACKAGE}/${parts[0]}`;
          if (rewritten === null) errors.push(`${where}, ${rel} : import relatif « ${imp.spec} » qui sort du dossier sans sous chemin @rovia/ui correspondant.`);
          else edits.push({ start: imp.start, end: imp.end, text: rewritten });
        } else if (!imp.typeOnly) {
          const name = packageName(imp.spec);
          if (!PEERS.has(name) && name !== PACKAGE) npm.add(name);
        }
      }
      const cssImports = file.endsWith(".tsx") ? cssFiles.map((c) => `import "${toPosix(join(...Array(depth).fill(".."), c)).replace(/^(?!\.)/, "./")}";`) : [];
      out.push({
        path: `ui/${folder}/${rel}`,
        type: "registry:ui",
        target: `@components/rovia/${folder}/${rel}`,
        content: withHeader(splice(code, edits), version, folder, cssImports),
      });
    }
    items.push({
      $schema: SCHEMA,
      name: folder,
      type: "registry:ui",
      title: folder,
      description: `Éjecte le composant ${folder} de ${PACKAGE} dans ton application, pour le modifier librement.`,
      dependencies: dependencyList(npm, uiVersions, spec, errors, where),
      files: out,
      docs: [
        `Composant éjecté dans components/rovia/${folder}/. Pour que tes blocs l'utilisent à la place de celui du paquet,`,
        `ajoute à tsconfig.json > compilerOptions.paths :`,
        `  "${PACKAGE}/${folder}": ["./components/rovia/${folder}"]   (ou "./src/components/rovia/${folder}" avec un dossier src)`,
        `Les autres composants du paquet gardent leur propre version. ${PACKAGE}/styles.css doit être importé avant tout autre CSS.`,
      ].join("\n"),
    });
  }

  /* ── Blocs ───────────────────────────────────────────────────────────── */
  const blocksSrc = join(blocksRoot, "src");
  for (const name of await subdirs(blocksSrc)) {
    const dir = join(blocksSrc, name);
    const where = `bloc « ${name} »`;
    const files = (await listFiles(dir, isCopied)).filter((f) => toPosix(relative(dir, f)) !== "index.ts");
    const npm = new Set();
    const out = [];
    for (const file of files) {
      const rel = toPosix(relative(dir, file));
      const code = await readFile(file, "utf8");
      if (file.endsWith(".css")) {
        out.push({ path: `blocks/${name}/${rel}`, type: "registry:file", target: `@components/blocks/${name}/${rel}`, content: `/* ${PACKAGE} ${version} · ${name} */\n${code}` });
        continue;
      }
      for (const imp of readImports(file, code)) {
        if (imp.spec.startsWith(".")) {
          if (toPosix(join(rel, "..", imp.spec)).startsWith("..")) errors.push(`${where}, ${rel} : import relatif « ${imp.spec} » hors du dossier du bloc.`);
          continue;
        }
        const pkg = packageName(imp.spec);
        if (pkg === PACKAGE) {
          const sub = imp.spec.slice(PACKAGE.length + 1);
          if (!subpaths.has(sub)) errors.push(`${where}, ${rel} : « ${imp.spec} » interdit ; un bloc importe la librairie par un sous chemin existant (@rovia/ui/<dossier>).`);
        } else if (PEERS.has(pkg) || imp.typeOnly) {
          continue;
        } else if (!blockVersions[pkg]) {
          errors.push(`${where}, ${rel} : « ${imp.spec} » n'est pas une dépendance déclarée de packages/blocks.`);
        } else {
          npm.add(pkg);
        }
      }
      out.push({ path: `blocks/${name}/${rel}`, type: "registry:block", target: `@components/blocks/${name}/${rel}`, content: withHeader(code, version, name) });
    }
    if (out.length === 0) errors.push(`${where} : aucun fichier.`);
    const versions = { ...blockVersions };
    delete versions[PACKAGE];
    items.push({
      $schema: SCHEMA,
      name,
      type: "registry:block",
      title: name,
      description: `Bloc ${name} : écran complet copié dans ton application, avec ses données d'exemple.`,
      dependencies: dependencyList(npm, versions, spec, errors, where),
      files: out,
    });
  }

  /* ── Contrôles transverses ───────────────────────────────────────────── */
  const seen = new Map();
  for (const item of items) {
    if (seen.has(item.name)) errors.push(`Nom en double : « ${item.name} » (${seen.get(item.name)} et ${item.type}).`);
    seen.set(item.name, item.type);
  }

  if (storiesRoot) {
    const named = new Set();
    for (const file of await listFiles(storiesRoot, (n) => /\.stories\.tsx?$/.test(n))) {
      const code = await readFile(file, "utf8");
      for (const m of code.matchAll(/registry:\s*["']([a-z0-9-]+)["']/g)) {
        named.add(m[1]);
        if (!seen.has(m[1])) errors.push(`${toPosix(relative(storiesRoot, file))} : la story nomme « ${m[1] } », qui n'est pas un élément du registre.`);
      }
    }
    for (const item of items) if (!named.has(item.name)) errors.push(`« ${item.name} » n'a aucune story avec parameters.registry = "${item.name}".`);
  }

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "rovia",
    homepage: baseUrl,
    items: items.map(({ $schema, files, docs, ...rest }) => ({ ...rest, files: files.map(({ content, ...f }) => f) })),
  };
  return { registry, items, errors };
}
