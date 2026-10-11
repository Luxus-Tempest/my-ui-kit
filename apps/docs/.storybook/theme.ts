import { create } from "@storybook/theming/create";

/*
 * Thème de marque de la documentation : interface de Storybook (barre
 * latérale, barre d'outils) et pages Docs. Mêmes valeurs que les jetons
 * clairs de la librairie (tokens.css) ; Storybook n'accepte pas de
 * variables CSS ici, d'où les valeurs recopiées.
 */
const brandMark =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='164' height='32' viewBox='0 0 164 32'>
      <rect x='0' y='2' width='28' height='28' rx='9' fill='#0b57d0'/>
      <path d='M9 19.5a4.5 4.5 0 0 1 .9-8.9 6 6 0 0 1 11.4 2.2 3.5 3.5 0 0 1-.8 6.7z' fill='#fff'/>
      <text x='38' y='22' font-family='Inter, -apple-system, Segoe UI, sans-serif' font-size='16' font-weight='600' fill='#1f1f1f'>acme</text>
      <text x='84' y='22' font-family='Inter, -apple-system, Segoe UI, sans-serif' font-size='16' font-weight='400' fill='#5f6368'>/ ui</text>
    </svg>`,
  );

export const brandTheme = create({
  base: "light",
  brandTitle: "acme/ui — Drive × iOS",
  brandImage: brandMark,
  brandTarget: "_self",

  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", Roboto, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',

  colorPrimary: "#0b57d0",
  colorSecondary: "#0b57d0",

  appBg: "#f6f8fc",
  appContentBg: "#ffffff",
  appPreviewBg: "#f6f8fc",
  appBorderColor: "#e3e6ea",
  appBorderRadius: 16,

  textColor: "#1f1f1f",
  textInverseColor: "#f2f2f2",
  textMutedColor: "#5f6368",

  barTextColor: "#444746",
  barHoverColor: "#0b57d0",
  barSelectedColor: "#0b57d0",
  barBg: "#ffffff",

  buttonBg: "#f0f4f9",
  buttonBorder: "#e3e6ea",
  booleanBg: "#e9eef6",
  booleanSelectedBg: "#ffffff",

  inputBg: "#f0f4f9",
  inputBorder: "#e3e6ea",
  inputTextColor: "#1f1f1f",
  inputBorderRadius: 10,
});
