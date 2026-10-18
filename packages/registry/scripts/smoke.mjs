#!/usr/bin/env node
/*
 * Installation réelle du registre dans une application Next.js vierge, sans
 * Tailwind, hors du workspace (spec 0001, AC-2 à AC-6 et AC-10).
 *
 *  1. archive du paquet (`pnpm pack`, après `pnpm build`) ;
 *  2. registre construit avec `@rovia/ui@file:<archive>`, servi en local ;
 *  3. `create-next-app` sans Tailwind, mise en place (paquet, styles.css,
 *     ThemeProvider, components.json) ;
 *  4. `shadcn add` de tous les blocs et de `@rovia/button` (éjection), redirection
 *     de `@rovia/ui/button` vers la copie, règle CSS modifiée dans la copie ;
 *  5. vérification des types, build, puis navigateur : le bloc s'affiche en clair
 *     et en sombre, l'erreur s'annonce à la soumission, la règle de la copie
 *     l'emporte ; captures dans `smoke-results/` ;
 *  6. `--overwrite` remet un fichier copié modifié.
 *
 * Usage : `pnpm build` puis `pnpm --filter @rovia/registry smoke`.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile, appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { buildRegistry } from "../src/build.mjs";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const here = fileURLToPath(new URL("..", import.meta.url));
const results = join(here, "smoke-results");
const REGISTRY_PORT = Number(process.env.SMOKE_REGISTRY_PORT ?? 4870);
const APP_PORT = Number(process.env.SMOKE_APP_PORT ?? 3990);

const versions = {
  shadcn: JSON.parse(await readFile(join(here, "package.json"), "utf8")).devDependencies.shadcn,
  next: JSON.parse(await readFile(join(repo, "apps/example/package.json"), "utf8")).dependencies.next,
};

const step = (msg) => console.log(`\n▸ ${msg}`);
/**
 * Lance une commande sans bloquer la boucle d'événements : le serveur du
 * registre tourne dans ce même processus et doit répondre au CLI shadcn.
 * `stdin` est fermé : une question inattendue échoue au lieu d'attendre.
 */
function run(cmd, args, cwd, env = {}) {
  console.log(`  $ ${cmd} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "inherit", "inherit"], shell: process.platform === "win32", env: { ...process.env, ...env } });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`Échec (${code}) : ${cmd} ${args.join(" ")}`))));
  });
}
function check(ok, msg) {
  if (!ok) throw new Error(`Vérification échouée : ${msg}`);
  console.log(`  ✓ ${msg}`);
}

const work = await mkdtemp(join(process.env.RUNNER_TEMP ?? tmpdir(), "rovia-smoke-"));
const app = join(work, "app");
const toPosix = (p) => p.split("\\").join("/");
let server;
let next;

try {
  await rm(results, { recursive: true, force: true });
  await mkdir(results, { recursive: true });

  step("Archive du paquet @rovia/ui");
  await run("pnpm", ["pack", "--pack-destination", work], join(repo, "packages/ui"));
  const tgz = join(work, (await readdir(work)).find((f) => f.endsWith(".tgz")));
  const pkgSpec = `file:${toPosix(tgz)}`;

  step("Registre local");
  const uiPkg = JSON.parse(await readFile(join(repo, "packages/ui/package.json"), "utf8"));
  const baseUrl = `http://localhost:${REGISTRY_PORT}`;
  const { items, errors } = await buildRegistry({
    uiRoot: join(repo, "packages/ui"),
    blocksRoot: join(repo, "packages/blocks"),
    version: uiPkg.version,
    pkgSpec,
    baseUrl,
  });
  check(errors.length === 0, `registre valide${errors.length ? ` :\n${errors.join("\n")}` : ""}`);
  const rDir = join(work, "r");
  await mkdir(rDir);
  for (const item of items) await writeFile(join(rDir, `${item.name}.json`), JSON.stringify(item));
  server = createServer(async (req, res) => {
    const file = join(work, decodeURIComponent(new URL(req.url, baseUrl).pathname));
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": extname(file) === ".json" ? "application/json" : "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  }).listen(REGISTRY_PORT);

  step(`Application vierge (create-next-app ${versions.next}, sans Tailwind)`);
  await run("pnpm", ["dlx", `create-next-app@${versions.next}`, "app", "--ts", "--app", "--no-tailwind", "--no-src-dir", "--no-eslint", "--use-pnpm", "--yes", "--disable-git", "--import-alias", "@/*"], work);

  step("Mise en place (AC-2)");
  await run("pnpm", ["add", pkgSpec], app);
  await writeFile(
    join(app, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true },
        aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
        registries: { "@rovia": `${baseUrl}/r/{name}.json` },
      },
      null,
      2,
    ),
  );
  const layoutFile = join(app, "app/layout.tsx");
  let layout = await readFile(layoutFile, "utf8");
  layout = `import "@rovia/ui/styles.css";\nimport { ThemeProvider } from "@rovia/ui/theme";\n${layout}`;
  layout = layout.replace(/\{children\}/, "<ThemeProvider>{children}</ThemeProvider>");
  await writeFile(layoutFile, layout);

  step(`Bloc et éjection (shadcn ${versions.shadcn})`);
  // Tous les blocs (la vérification des types de l'application les compile tous), plus l'éjection de button.
  const blocks = items.filter((i) => i.type === "registry:block").map((i) => `@rovia/${i.name}`);
  check(blocks.includes("@rovia/connexion"), `${blocks.length} blocs à installer`);
  await run("pnpm", ["dlx", `shadcn@${versions.shadcn}`, "add", ...blocks, "@rovia/button", "--yes"], app);
  const blockFile = join(app, "components/blocks/connexion/Connexion.tsx");
  const blockCode = await readFile(blockFile, "utf8");
  check(blockCode.startsWith(`"use client";\n/* @rovia/ui ${uiPkg.version} · connexion */`), "en tête du bloc : directive puis version (AC-5)");
  const buttonCode = await readFile(join(app, "components/rovia/button/Button.tsx"), "utf8");
  check(/from "@rovia\/ui\/utils"/.test(buttonCode) && /import "\.\/button\.css";/.test(buttonCode), "bouton éjecté : imports réécrits, CSS importé par son module (AC-4, AC-5)");

  // Redirection de l'éjecté (AC-6) et règle modifiée dans la copie (AC-4).
  const tsconfigFile = join(app, "tsconfig.json");
  const tsconfig = JSON.parse(await readFile(tsconfigFile, "utf8"));
  tsconfig.compilerOptions.paths = { ...tsconfig.compilerOptions.paths, "@rovia/ui/button": ["./components/rovia/button"] };
  await writeFile(tsconfigFile, JSON.stringify(tsconfig, null, 2));
  await appendFile(join(app, "components/rovia/button/button.css"), "\n.ui-button { --_radius: 6px; }\n");

  const page = (dark) => `"use client";
import * as React from "react";
import { Connexion } from "@/components/blocks/connexion/Connexion";
import { connexionSample } from "@/components/blocks/connexion/connexion.sample";

export default function Page() {
  const [error, setError] = React.useState<string | null>(null);
  const { errorMessage, ...sample } = connexionSample;
  const block = <Connexion {...sample} error={error} onSubmit={() => setError(errorMessage)} />;
  return ${dark ? '<div className="dark">{block}</div>' : "block"};
}
`;
  await writeFile(join(app, "app/page.tsx"), page(false));
  await mkdir(join(app, "app/sombre"));
  await writeFile(join(app, "app/sombre/page.tsx"), page(true));

  step("Types et build (AC-3)");
  await run("pnpm", ["exec", "tsc", "--noEmit"], app);
  await run("pnpm", ["build"], app);

  step("Navigateur");
  const url = `http://localhost:${APP_PORT}`;
  // Un ancien serveur sur ce port servirait une autre application : on refuse.
  const busy = await fetch(url).then(() => true, () => false);
  if (busy) throw new Error(`Le port ${APP_PORT} est déjà occupé (SMOKE_APP_PORT pour en choisir un autre).`);
  // Next lancé directement par node (sans pnpm ni shell) : `kill` arrête bien le serveur.
  next = spawn(process.execPath, [join(app, "node_modules/next/dist/bin/next"), "start", "-p", String(APP_PORT)], { cwd: app, stdio: "ignore" });
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    if (i > 60) throw new Error("L'application ne démarre pas.");
    await new Promise((r) => setTimeout(r, 1000));
  }
  const browser = await chromium.launch({ channel: process.env.CI || process.platform !== "win32" ? undefined : "msedge" });
  try {
    const tab = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    // Attendre les feuilles de style : sinon le style calculé est lu avant leur application.
    await tab.goto(url, { waitUntil: "networkidle" });
    await tab.locator('[data-slot="card-title"]', { hasText: "Connexion" }).waitFor();
    check(true, "le bloc s'affiche (clair)");
    const submit = tab.getByRole("button", { name: "Se connecter" });
    // Diagnostic : ordre des feuilles de style, et lesquelles portent la règle de la copie.
    const sheets = await tab.evaluate(() =>
      [...document.styleSheets].map((s) => {
        const text = [...s.cssRules].map((r) => r.cssText).join("\n");
        return `${s.href ?? "(en ligne)"} · ${s.cssRules.length} règles${text.includes("--_radius: 6px") ? " · règle de la copie" : ""}${text.includes(".ui-button") ? " · .ui-button" : ""}`;
      }),
    );
    console.log(`  feuilles de style, dans l'ordre :\n    ${sheets.join("\n    ")}`);
    check((await submit.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)) === "6px", "la règle de la copie l'emporte sur le paquet, via la redirection (AC-4, AC-6)");
    await submit.click();
    await tab.getByText("Adresse ou mot de passe incorrect.").waitFor();
    check(true, "l'erreur s'annonce à la soumission");
    await tab.screenshot({ path: join(results, "connexion-clair.png"), fullPage: true });

    await tab.goto(`${url}/sombre`, { waitUntil: "networkidle" });
    await tab.locator('[data-slot="card-title"]', { hasText: "Connexion" }).waitFor();
    const bg = await tab.locator(".dark > div").first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    check(r + g + b < 3 * 90, `fond sombre en mode sombre (${bg})`);
    await tab.screenshot({ path: join(results, "connexion-sombre.png"), fullPage: true });
  } finally {
    await browser.close();
  }

  step("Mise à jour d'une copie (--overwrite)");
  await writeFile(blockFile, blockCode + "\n// modification locale\n");
  await run("pnpm", ["dlx", `shadcn@${versions.shadcn}`, "add", "@rovia/connexion", "--yes", "--overwrite"], app);
  check((await readFile(blockFile, "utf8")) === blockCode, "--overwrite remet le fichier du registre");

  console.log(`\nInstallation réelle réussie. Captures : ${results}`);
} finally {
  next?.kill();
  server?.close();
  if (!process.env.SMOKE_KEEP) await rm(work, { recursive: true, force: true }).catch(() => {});
  else console.log(`Dossier gardé : ${work}`);
}
