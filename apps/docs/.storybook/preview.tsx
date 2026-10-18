import type { Preview } from "@storybook/react";
import { LocaleProvider, ThemeProvider, localeAr, localeEn, type UiMessagesInput } from "@rovia/ui";
import "@rovia/ui/styles.css";
import { brandTheme } from "./theme";
import { DocsPage } from "../stories/_shared/registry";

/** Langues de la barre d'outils : locale Intl et catalogue (le français est intégré aux composants). */
const LANGUES: Record<string, { locale: string; messages?: UiMessagesInput }> = {
  fr: { locale: "fr-FR" },
  en: { locale: "en-US", messages: localeEn },
  ar: { locale: "ar-MA", messages: localeAr },
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Thème",
      toolbar: { title: "Thème", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
    brand: {
      description: "Couleur de marque (ThemeProvider brand)",
      toolbar: {
        title: "Marque",
        icon: "paintbrush",
        items: [
          { value: "defaut", title: "Bleu (défaut)" },
          { value: "#7c3aed", title: "Violet" },
          { value: "#0d9488", title: "Sarcelle" },
          { value: "#16a34a", title: "Vert" },
          { value: "#fbbc04", title: "Ambre" },
          { value: "#dc2626", title: "Rouge" },
        ],
        dynamicTitle: true,
      },
    },
    lang: {
      description: "Langue de l'interface",
      toolbar: {
        title: "Langue",
        icon: "globe",
        items: [
          { value: "fr", title: "Français" },
          { value: "en", title: "English" },
          { value: "ar", title: "العربية (droite à gauche)" },
        ],
        dynamicTitle: true,
      },
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
  initialGlobals: { theme: "light", dir: "ltr", lang: "fr", density: "default", brand: "defaut" },
  parameters: {
    // Le décorateur gère marges et fond : le cadre Storybook reste nu.
    layout: "fullscreen",
    controls: { expanded: true, sort: "requiredFirst" },
    // `page` : la page Docs par défaut, plus la commande du registre (spec 0001).
    docs: { toc: true, theme: brandTheme, page: DocsPage },
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Bienvenue", "Aperçu", "Statut des composants"],
          "Fondations",
          ["Langage Drive × iOS", "Couleurs", "Typographie", "Espacement et mise en page", "Densité", "Rayons, élévation et mouvement", "Couleur de marque", "Langue"],
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
          ["Application", "Coque d'application", "Tableau de bord", "Drive", "Messagerie", "Formulaire client", "Authentification", "Paramètres"],
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
      const langue = LANGUES[ctx.globals.lang as string] ?? LANGUES.fr!;
      // L'arabe se lit de droite à gauche, quel que soit le réglage « Sens ».
      const dir = ctx.globals.lang === "ar" ? "rtl" : ctx.globals.dir;
      return (
        <ThemeProvider key={`${ctx.globals.theme}-${dir}`} defaultMode={ctx.globals.theme} dir={dir} density={ctx.globals.density} brand={ctx.globals.brand === "defaut" ? undefined : ctx.globals.brand}>
          <LocaleProvider locale={langue.locale} messages={langue.messages}>
            <div style={{ padding, minHeight: docs ? undefined : "100vh", boxSizing: "border-box", background: "var(--ui-app)" }}>
              <Story />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      );
    },
  ],
};
export default preview;
