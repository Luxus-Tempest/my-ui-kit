import type { Preview } from "@storybook/react";
import { ThemeProvider } from "@acme/ui";
import "@acme/ui/styles.css";
import { brandTheme } from "./theme";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Thème",
      toolbar: { title: "Thème", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
    dir: {
      description: "Sens de lecture",
      toolbar: {
        title: "Sens",
        icon: "transfer",
        items: [
          { value: "ltr", title: "Gauche à droite (français)" },
          { value: "rtl", title: "Droite à gauche (arabe)" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Densité de l'interface",
      toolbar: {
        title: "Densité",
        icon: "ruler",
        items: [
          { value: "compact", title: "Compacte" },
          { value: "default", title: "Standard" },
          { value: "comfortable", title: "Confortable" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", dir: "ltr", density: "default" },
  parameters: {
    // Le décorateur gère marges et fond : le cadre Storybook reste nu.
    layout: "fullscreen",
    controls: { expanded: true, sort: "requiredFirst" },
    docs: { toc: true, theme: brandTheme },
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Bienvenue", "Aperçu", "Statut des composants"],
          "Fondations",
          ["Langage Drive × iOS", "Couleurs", "Typographie", "Espacement et mise en page", "Densité", "Rayons, élévation et mouvement"],
          "Composants",
          [
            "Actions",
            "Formulaire",
            "Affichage",
            "Données",
            "Typographie",
            "Mise en page",
            "Navigation",
            "Surcouches",
            "Retour",
            "Messagerie",
            "Graphiques",
          ],
          "Blocs",
          ["Application", "Tableau de bord", "Drive", "Messagerie", "Formulaire client", "Authentification", "Paramètres"],
        ],
      },
    },
  },
  decorators: [
    // Fond d'application et thème autour de chaque story. En page Docs, pas de
    // hauteur d'écran imposée : chaque aperçu prend la hauteur de son contenu.
    // Une story pleine page (exemples) passe `parameters: { padding: 0 }`.
    // La densité (bascule « Densité ») est posée sur le conteneur et sur <html>.
    (Story, ctx) => {
      const docs = ctx.viewMode === "docs";
      const padding = (ctx.parameters.padding as number | undefined) ?? (docs ? 20 : 24);
      return (
        <ThemeProvider
          key={`${ctx.globals.theme}-${ctx.globals.dir}`}
          defaultMode={ctx.globals.theme}
          dir={ctx.globals.dir}
          density={ctx.globals.density}
        >
          <div style={{ padding, minHeight: docs ? undefined : "100vh", boxSizing: "border-box", background: "var(--ui-app)" }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};
export default preview;
