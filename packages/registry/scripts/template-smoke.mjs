#!/usr/bin/env node
/*
 * Le starter `templates/next`, comme après `create-next-app --example` (spec 0002, AC-14) :
 * copié hors du workspace, installé, avec l'archive locale de @rovia/ui (le paquet de la PR, pas
 * celui de npm), puis types, lint, Prettier, build et tests Playwright du modèle.
 *
 * Usage : `pnpm --filter @rovia/ui build` puis `pnpm --filter @rovia/registry template-smoke`.
 * Sous Windows sans Chromium de Playwright : PW_CHANNEL=msedge.
 */
import { spawn } from "node:child_process";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../../../", import.meta.url));
const template = join(repo, "templates/next");
const work = await mkdtemp(join(process.env.RUNNER_TEMP ?? tmpdir(), "rovia-template-"));
const app = join(work, "app");

function run(cmd, args, cwd, env = {}) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "inherit", "inherit"], shell: process.platform === "win32", env: { ...process.env, ...env } });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`Échec (${code}) : ${cmd} ${args.join(" ")}`))));
  });
}

const SKIP = new Set(["node_modules", ".next", "test-results", "playwright-report", "next-env.d.ts", "pnpm-lock.yaml"]);

try {
  await run("pnpm", ["pack", "--pack-destination", work], join(repo, "packages/ui"));
  const tgz = join(work, (await readdir(work)).find((f) => f.endsWith(".tgz")));

  await cp(template, app, { recursive: true, filter: (src) => !SKIP.has(src.split(/[\\/]/).pop()) });
  // L'application créée ne fait partie d'aucun workspace : pnpm l'installe seule.
  await run("pnpm", ["install", "--ignore-workspace"], app);
  await run("pnpm", ["add", "--ignore-workspace", `@rovia/ui@file:${tgz.split("\\").join("/")}`], app);
  await run("pnpm", ["typecheck"], app);
  await run("pnpm", ["lint"], app);
  await run("pnpm", ["exec", "prettier", "--check", "."], app);
  await run("pnpm", ["build"], app);
  await run("pnpm", ["test:e2e"], app, { CI: process.env.CI ?? "" });
  console.log("\nStarter vérifié : types, lint, Prettier, build et tests Playwright.");
} finally {
  if (!process.env.SMOKE_KEEP) await rm(work, { recursive: true, force: true }).catch(() => {});
  else console.log(`Dossier gardé : ${work}`);
}
