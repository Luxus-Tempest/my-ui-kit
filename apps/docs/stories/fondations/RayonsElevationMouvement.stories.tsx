import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Text } from "@rovia/ui";
import { Section, useTokenValue } from "../_shared/tokens";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Fondations/Rayons, élévation et mouvement",
  parameters: {
    docs: {
      description: {
        component:
          "Grands rayons continus (iOS), pilule pour les actions (Drive). Ombres diffuses réservées à ce qui flotte. Deux mouvements : standard pour les états, ressort pour les surfaces. Couches d'état Material sur la couleur du texte.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

function Radius({ token, role }: { token: string; role: string }) {
  const [ref, value] = useTokenValue(token);
  return (
    <div ref={ref} style={{ display: "grid", gap: 8 }}>
      <div style={{ height: 72, borderRadius: `var(${token})`, background: "var(--ui-card-2)", boxShadow: "inset 0 0 0 1px var(--ui-line-2)" }} />
      <Text size={12.5} weight="semibold" mono>{token}</Text>
      <Text size={12} tone="subtle">{value} · {role}</Text>
    </div>
  );
}

export const Rayons: Story = {
  render: () => (
    <Section title="Rayons">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 20, maxWidth: 1040 }}>
        <Radius token="--ui-r-xs" role="entrée de menu, infobulle" />
        <Radius token="--ui-r-sm" role="contrôle compact" />
        <Radius token="--ui-r-ctl" role="champ de saisie" />
        <Radius token="--ui-r-md" role="menu, encadré, toast" />
        <Radius token="--ui-r-lg" role="carte, panneau" />
        <Radius token="--ui-r-xl" role="modale" />
        <Radius token="--ui-r-2xl" role="feuille, surface principale" />
        <Radius token="--ui-r-pill" role="bouton, puce, recherche" />
      </div>
    </Section>
  ),
};

export const Elevation: Story = {
  name: "Élévation",
  render: () => (
    <Section title="Élévation" description="sh1-sh2 : légère (carte surélevée) ; sh3 : ce qui flotte (menu, popover, toast) ; sh4 : modale et feuille.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 28, maxWidth: 1040 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ height: 96, borderRadius: "var(--ui-r-lg)", background: "var(--ui-panel)", boxShadow: `var(--ui-sh${n})`, display: "grid", placeItems: "center" }}>
            <Text size={12.5} mono>--ui-sh{n}</Text>
          </div>
        ))}
      </div>
    </Section>
  ),
};

function MotionDemo({ easing, duration, label }: { easing: string; duration: string; label: string }) {
  const [on, setOn] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ position: "relative", height: 44, borderRadius: "var(--ui-r-pill)", background: "var(--ui-card-2)" }}>
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--ui-pri)",
            transform: on ? "translateX(220px)" : "none",
            transition: `transform var(${duration}) var(${easing})`,
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button size="sm" variant="tonal" onClick={() => setOn(!on)}>Rejouer</Button>
        <Text size={12.5} tone="muted">{label}</Text>
      </div>
    </div>
  );
}

/** Le ressort est réservé aux surfaces (entrées, feuilles, pastilles) ; les états restent sobres. */
export const Mouvement: Story = {
  render: () => (
    <Section title="Mouvement" description="Respecte prefers-reduced-motion : les durées tombent à zéro.">
      <div style={{ display: "grid", gap: 24, maxWidth: 300 }}>
        <MotionDemo easing="--ui-ease" duration="--ui-duration" label="Standard · --ui-duration (140 ms) · --ui-ease" />
        <MotionDemo easing="--ui-ease-spring" duration="--ui-duration-slow" label="Ressort · --ui-duration-slow (280 ms) · --ui-ease-spring" />
      </div>
    </Section>
  ),
};

/** Couches d'état : la couleur du texte à 8 % au survol, 12 % à l'appui. */
export const CouchesDEtat: Story = {
  name: "Couches d'état",
  render: () => (
    <Section title="Couches d'état" description="Survolez et appuyez : la même couche s'applique à toutes les variantes, quelle que soit leur couleur.">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button>Primaire</Button>
        <Button variant="tonal">Tonale</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Fantôme</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </Section>
  ),
};
