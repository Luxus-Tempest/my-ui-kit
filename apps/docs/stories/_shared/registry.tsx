/*
 * Registre @rovia (spec 0001) dans la documentation : la commande d'installation
 * d'un bloc ou d'éjection d'un composant, lue dans `parameters.registry`, et la
 * mise en place unique d'une application. La version du CLI vient de
 * packages/registry/package.json (épinglée, jamais `@latest`).
 */
import * as React from "react";
import { Description, Primary, Controls, Source, Stories, Subtitle, Title, useOf } from "@storybook/blocks";
import registryPkg from "../../../../packages/registry/package.json";

export const SHADCN = `shadcn@${registryPkg.devDependencies.shadcn}`;
export const REGISTRY_URL = "https://luxus-tempest.github.io/my-ui-kit/r/{name}.json";

export const COMPONENTS_JSON = JSON.stringify(
  {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true },
    aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
    registries: { "@rovia": REGISTRY_URL },
  },
  null,
  2,
);

/** Mise en place unique : à afficher dans l'introduction. */
export function RegistrySetup() {
  return <Source language="json" code={COMPONENTS_JSON} dark />;
}

/** Noms du registre déclarés par la page (méta) et par ses stories. */
function useRegistryNames(): { names: string[]; block: boolean } {
  const meta = useOf("meta");
  const names = new Set<string>();
  if (meta.type !== "meta") return { names: [], block: false };
  const fromMeta = meta.preparedMeta.parameters?.registry as string | undefined;
  if (fromMeta) names.add(fromMeta);
  for (const story of Object.values(meta.csfFile.stories)) {
    const name = (story.parameters as { registry?: string } | undefined)?.registry;
    if (name) names.add(name);
  }
  return { names: [...names], block: meta.preparedMeta.title.startsWith("Blocs/") };
}

/** Commande(s) d'installation de la page, rien si elle n'en déclare pas. */
export function RegistryInstall() {
  const { names, block } = useRegistryNames();
  if (names.length === 0) return null;
  const code = names.map((n) => `pnpm dlx ${SHADCN} add @rovia/${n}`).join("\n");
  return (
    <>
      <h3>{block ? "Installer ce bloc" : "Éjecter ce composant"}</h3>
      <p>
        {block
          ? "Copie l'écran et ses données d'exemple dans ton application, pour le modifier librement."
          : `Copie ce seul dossier dans ton application pour le transformer ; le reste reste dans @rovia/ui. Redirige ensuite "@rovia/ui/${names[0]}" vers la copie dans les paths du tsconfig.`}{" "}
        Mise en place unique : <em>Introduction › Bienvenue</em>.
      </p>
      <Source language="bash" code={code} dark />
    </>
  );
}

/** Page Docs par défaut de Storybook, avec la commande d'installation sous la description. */
export function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <RegistryInstall />
      <Primary />
      <Controls />
      <Stories />
    </>
  );
}
