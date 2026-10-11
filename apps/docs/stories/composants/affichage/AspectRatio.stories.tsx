import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio, Badge } from "@acme/ui";

/* ── Visuels de démo : SVG en data-URI et dégradés de jetons, aucune ressource externe ── */

function landscape(sky: [string, string], hills: [string, string, string]) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'>
    <defs><linearGradient id='c' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${sky[0]}'/><stop offset='1' stop-color='${sky[1]}'/></linearGradient></defs>
    <rect width='1600' height='900' fill='url(#c)'/>
    <circle cx='1150' cy='290' r='105' fill='#fff7e0' opacity='.92'/>
    <path d='M0 600C220 470 420 500 640 560s460-90 960 10v330H0z' fill='${hills[0]}'/>
    <path d='M0 700c300-110 560-80 820-30s460-40 780 0v230H0z' fill='${hills[1]}'/>
    <path d='M0 800c260-60 520-50 800-10s520 20 800-20v130H0z' fill='${hills[2]}'/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const LANDSCAPE = landscape(["#2a78d6", "#cde2fb"], ["#6da7ec", "#1baf7a", "#008300"]);

/** Dégradé « photo » à base de la palette catégorielle : suit le thème clair / sombre. */
const scene = (a: number, b: number): React.CSSProperties => ({
  background: `radial-gradient(120% 90% at 85% 10%, color-mix(in srgb, var(--ui-c${b}) 75%, transparent), transparent 62%), linear-gradient(155deg, var(--ui-c${a}), color-mix(in srgb, var(--ui-c${a}) 45%, var(--ui-c${b})))`,
});

const caption: React.CSSProperties = {
  alignSelf: "end",
  justifySelf: "start",
  margin: 12,
  padding: "4px 10px",
  borderRadius: "var(--ui-r-pill)",
  background: "var(--ui-material)",
  backdropFilter: "var(--ui-blur)",
  color: "var(--ui-fg)",
  font: "500 12.5px/1.4 var(--ui-font-sans)",
};

/* ── Page ────────────────────────────────────────────────────────────── */

const meta = {
  title: "Composants/Affichage/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Cadre à proportions fixes (propriété CSS `aspect-ratio`) : vignette de fichier, couverture de carte, vidéo, carte géographique. Les médias enfants le couvrent (`fit=\"cover\"`) ou s'y logent entiers (`contain`) ; les autres enfants se superposent (légende, badge). Le rayon se pose par `className` ou `style`.",
      },
    },
  },
  args: { ratio: "16 / 9", fit: "cover" },
  argTypes: {
    ratio: { control: "select", options: ["16 / 9", "4 / 3", "3 / 2", "1", "3 / 4", "9 / 16", "21 / 9"] },
    fit: { control: "inline-radio", options: ["cover", "contain"] },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <AspectRatio {...args} style={{ borderRadius: "var(--ui-r-lg)", background: "var(--ui-card-2)" }}>
        <img src={LANDSCAPE} alt="Collines vertes sous un ciel bleu" />
      </AspectRatio>
    </div>
  ),
} satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Rapport et cadrage pilotables depuis les Contrôles. */
export const Playground: Story = {};

/** Les rapports courants. Le cadre prend toute la largeur disponible ; sa hauteur en découle. */
export const Rapports: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 16, maxWidth: 860, alignItems: "start" }}>
      {(
        [
          ["16 / 9", 1, 7],
          ["4 / 3", 3, 1],
          ["3 / 2", 2, 5],
          ["1", 7, 5],
          ["3 / 4", 6, 3],
          ["9 / 16", 8, 2],
        ] as const
      ).map(([ratio, a, b]) => (
        <figure key={ratio} style={{ margin: 0, display: "grid", gap: 8 }}>
          <AspectRatio ratio={ratio} style={{ ...scene(a, b), borderRadius: "var(--ui-r-md)" }} />
          <figcaption style={{ color: "var(--ui-fg-3)", font: "500 12px/1.4 var(--ui-font-sans)" }}>{ratio}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** `cover` remplit le cadre et rogne ; `contain` montre toute l'image, sur la surface tonale. */
export const Cadrage: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 260px))", gap: 16 }}>
      {(["cover", "contain"] as const).map((fit) => (
        <figure key={fit} style={{ margin: 0, display: "grid", gap: 8 }}>
          <AspectRatio ratio={1} fit={fit} style={{ borderRadius: "var(--ui-r-lg)", background: "var(--ui-card-2)" }}>
            <img src={LANDSCAPE} alt="" />
          </AspectRatio>
          <figcaption style={{ color: "var(--ui-fg-3)", font: "500 12px/1.4 var(--ui-font-sans)" }}>fit="{fit}"</figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** Les enfants s'empilent dans le cadre : une légende translucide ou un badge se posent sur le média. */
export const Superposition: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <AspectRatio ratio="4 / 3" style={{ borderRadius: "var(--ui-r-lg)" }}>
        <img src={LANDSCAPE} alt="Vue du site de Bouskoura" />
        <span style={caption}>Site de Bouskoura · 12 photos</span>
        <span style={{ alignSelf: "start", justifySelf: "end", margin: 12 }}>
          <Badge>Nouveau</Badge>
        </span>
      </AspectRatio>
    </div>
  ),
};

/** `asChild` : le cadre devient le lien de la vignette ; le rayon suit le rôle (carte, vignette). */
export const CommeLien: Story = {
  name: "Comme lien (asChild)",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
      <div style={{ width: 280 }}>
        <AspectRatio asChild style={{ ...scene(1, 7), borderRadius: "var(--ui-r-lg)" }}>
          <a href="#album" aria-label="Album : séminaire 2026" />
        </AspectRatio>
      </div>
      <div style={{ width: 120 }}>
        <AspectRatio asChild ratio={1} style={{ ...scene(3, 6), borderRadius: "var(--ui-r-sm)" }}>
          <a href="#vignette" aria-label="Photo : entrepôt de Tanger" />
        </AspectRatio>
      </div>
    </div>
  ),
};
