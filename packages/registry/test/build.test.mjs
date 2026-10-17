/*
 * Générateur du registre (spec 0001) : le vrai dépôt passe, et chaque fixture
 * fautive fait échouer le build avec un message qui nomme la faute (AC-1, AC-8).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, packageName, readImports } from "../src/build.mjs";

const repo = fileURLToPath(new URL("../../../", import.meta.url));

/** Arborescence minimale ui + blocks + stories, surchargée par `files`. */
async function fixture(files = {}) {
  const root = await mkdtemp(join(tmpdir(), "rovia-registry-"));
  const base = {
    "ui/package.json": JSON.stringify({
      version: "1.2.3",
      dependencies: { clsx: "^2.1.0" },
      exports: { ".": {}, "./styles.css": "", "./button": {}, "./menu": {}, "./utils": {}, "./i18n": {} },
    }),
    "ui/src/utils/cn.ts": "export const cn = (...a: string[]) => a.join(' ');\n",
    "ui/src/components/button/Button.tsx": 'import { clsx } from "clsx";\nimport { cn } from "../../utils/cn";\nexport const Button = () => <button className={cn(clsx("b"))} />;\n',
    "ui/src/components/button/button.css": ".b{}\n",
    "ui/src/components/button/index.ts": '/* Généré par scripts/subpaths.mjs : point d\'entrée. */\nexport * from "./Button";\n',
    "ui/src/components/menu/Menu.tsx": 'import type { Thing } from "some-types-only";\nimport { Button } from "../button/Button";\nexport const Menu = () => <Button />;\n',
    "ui/src/components/popup/popup.css": ".popup{}\n",
    "blocks/package.json": JSON.stringify({ dependencies: { "@rovia/ui": "workspace:*", "lucide-react": "1.0.0" } }),
    "blocks/src/connexion/Connexion.tsx": '// "@rovia/ui" dans un commentaire ne compte pas\nimport { Button } from "@rovia/ui/button";\nimport { Cloud } from "lucide-react";\nimport { sample } from "./connexion.sample";\nexport const Connexion = () => <Button><Cloud />{sample}</Button>;\n',
    "blocks/src/connexion/connexion.sample.ts": 'export const sample = "x";\n',
    "blocks/src/connexion/index.ts": 'export * from "./Connexion";\n',
    "stories/Button.stories.tsx": 'export default { parameters: { registry: "button" } };\n',
    "stories/Menu.stories.tsx": 'export default { parameters: { registry: "menu" } };\n',
    "stories/Connexion.stories.tsx": 'export const C = { parameters: { registry: "connexion" } };\n',
  };
  for (const [path, content] of Object.entries({ ...base, ...files })) {
    if (content === null) continue;
    const file = join(root, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  return buildRegistry({
    uiRoot: join(root, "ui"),
    blocksRoot: join(root, "blocks"),
    storiesRoot: join(root, "stories"),
    version: "1.2.3",
    baseUrl: "https://example.test",
  });
}

const item = (result, name) => result.items.find((i) => i.name === name);

test("le registre du dépôt se construit sans erreur", async () => {
  const { version } = JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(join(repo, "packages/ui/package.json"), "utf8")));
  const result = await buildRegistry({
    uiRoot: join(repo, "packages/ui"),
    blocksRoot: join(repo, "packages/blocks"),
    storiesRoot: join(repo, "apps/docs/stories"),
    version,
    baseUrl: "https://example.test",
  });
  assert.deepEqual(result.errors, []);
  assert.ok(item(result, "connexion"), "le bloc connexion est dans le registre");
  assert.ok(item(result, "button"), "button est éjectable");
  assert.equal(item(result, "popup"), undefined, "popup (CSS seul) n'est pas un élément");
});

test("fixture valide : éjection réécrite, en têtes, dépendances", async () => {
  const result = await fixture();
  assert.deepEqual(result.errors, []);

  const menu = item(result, "menu").files.find((f) => f.target.endsWith("Menu.tsx"));
  assert.match(menu.content, /from "@rovia\/ui\/button"/, "import voisin réécrit vers le sous chemin");
  assert.deepEqual(item(result, "menu").dependencies, ["@rovia/ui@^1.2.3"], "un import type ne devient pas une dépendance");

  const button = item(result, "button");
  const tsx = button.files.find((f) => f.target.endsWith("Button.tsx"));
  assert.ok(tsx.content.startsWith('"use client";\n/* @rovia/ui 1.2.3 · button */\n'), "directive puis en tête (AC-5)");
  assert.match(tsx.content, /import "\.\/button\.css";/, "le module importe son CSS");
  assert.match(tsx.content, /from "@rovia\/ui\/utils"/);
  assert.deepEqual(button.dependencies, ["@rovia/ui@^1.2.3", "clsx@^2.1.0"]);
  const index = button.files.find((f) => f.target.endsWith("index.ts"));
  assert.doesNotMatch(index.content, /Généré par/, "l'en tête généré est remplacé");

  const block = item(result, "connexion");
  assert.equal(block.type, "registry:block");
  assert.deepEqual(block.dependencies, ["@rovia/ui@^1.2.3", "lucide-react@1.0.0"]);
  assert.deepEqual(block.files.map((f) => f.target), ["@components/blocks/connexion/Connexion.tsx", "@components/blocks/connexion/connexion.sample.ts"]);
  assert.ok(block.files[0].content.startsWith('"use client";\n/* @rovia/ui 1.2.3 · connexion */'));
});

test("REGISTRY_PKG_SPEC remplace la version de @rovia/ui", async () => {
  const root = await mkdtemp(join(tmpdir(), "rovia-registry-"));
  const result = await fixture();
  assert.ok(result.items.every((i) => i.dependencies[0] === "@rovia/ui@^1.2.3"));
  const custom = await buildRegistry({
    ...{ uiRoot: join(repo, "packages/ui"), blocksRoot: join(repo, "packages/blocks") },
    version: "9.9.9",
    pkgSpec: "file:/tmp/rovia-ui.tgz",
    baseUrl: root,
  });
  assert.ok(custom.items.every((i) => i.dependencies[0] === "@rovia/ui@file:/tmp/rovia-ui.tgz"));
});

test("un bloc qui importe le barrel échoue", async () => {
  const { errors } = await fixture({ "blocks/src/connexion/Connexion.tsx": 'import { Button } from "@rovia/ui";\nexport const C = () => <Button />;\n' });
  assert.ok(errors.some((e) => e.includes('« @rovia/ui » interdit')), errors.join("\n"));
});

test("un bloc qui importe un sous chemin inexistant échoue", async () => {
  const { errors } = await fixture({ "blocks/src/connexion/Connexion.tsx": 'import { X } from "@rovia/ui/inconnu";\nexport const C = () => <X />;\n' });
  assert.ok(errors.some((e) => e.includes("@rovia/ui/inconnu")), errors.join("\n"));
});

test("un bloc qui importe un paquet non déclaré échoue", async () => {
  const { errors } = await fixture({ "blocks/src/connexion/Connexion.tsx": 'import dayjs from "dayjs";\nexport const C = () => dayjs();\n' });
  assert.ok(errors.some((e) => e.includes("« dayjs » n'est pas une dépendance déclarée")), errors.join("\n"));
});

test("un bloc qui importe hors de son dossier échoue", async () => {
  const { errors } = await fixture({ "blocks/src/connexion/Connexion.tsx": 'import { menu } from "../../../ui/src/components/menu/Menu";\nexport const C = menu;\n' });
  assert.ok(errors.some((e) => e.includes("hors du dossier du bloc")), errors.join("\n"));
});

test("une éjection avec un import relatif sans sous chemin échoue", async () => {
  const { errors } = await fixture({ "ui/src/components/menu/Menu.tsx": 'import { x } from "../../internal/secret";\nexport const Menu = x;\n' });
  assert.ok(errors.some((e) => e.includes("éjection « menu »") && e.includes("../../internal/secret")), errors.join("\n"));
});

test("une dépendance npm sans version échoue", async () => {
  const { errors } = await fixture({ "ui/src/components/menu/Menu.tsx": 'import { motion } from "motion/react";\nexport const Menu = motion;\n' });
  assert.ok(errors.some((e) => e.includes("« motion » n'a pas de version")), errors.join("\n"));
});

test("deux éléments du même nom échouent", async () => {
  const { errors } = await fixture({
    "blocks/src/button/Button.tsx": 'export const B = 1;\n',
    "stories/B.stories.tsx": 'export default { parameters: { registry: "button" } };\n',
  });
  assert.ok(errors.some((e) => e.includes("Nom en double : « button »")), errors.join("\n"));
});

test("un élément sans story échoue, une story qui nomme un inconnu aussi", async () => {
  const missing = await fixture({ "stories/Menu.stories.tsx": null, "stories/Autre.stories.tsx": 'export default { parameters: { registry: "fantome" } };\n' });
  assert.ok(missing.errors.some((e) => e.includes("« menu » n'a aucune story")), missing.errors.join("\n"));
  assert.ok(missing.errors.some((e) => e.includes("« fantome »")), missing.errors.join("\n"));
});

test("analyse des imports : commentaires ignorés, import type marqué, noms de paquet", () => {
  const imports = readImports("a.tsx", '// import x from "faux"\nimport type { T } from "t";\nimport "./a.css";\nexport { y } from "./y";\nconst m = import("lazy/sub");\n');
  assert.deepEqual(imports.map((i) => [i.spec, i.typeOnly]), [["t", true], ["./a.css", false], ["./y", false], ["lazy/sub", false]]);
  assert.equal(packageName("echarts/core"), "echarts");
  assert.equal(packageName("@radix-ui/react-slot"), "@radix-ui/react-slot");
  assert.equal(packageName("@scope/pkg/deep/x"), "@scope/pkg");
});
