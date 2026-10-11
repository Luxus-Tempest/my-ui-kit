import type { Meta, StoryObj } from "@storybook/react";
import { Stack, Text } from "@acme/ui";
import { Section } from "../_shared/tokens";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Fondations/Espacement et mise en page",
  parameters: {
    docs: {
      description: {
        component:
          "Espacement en pas de 4 px : les props `p`, `gap`… de `Box`, `Stack` et `Grid` prennent un nombre de pas (`gap={3}` = 12 px). Hauteurs de contrôle : 32 / 36 / 40 / 44 px en densité standard (voir Fondations › Densité), cibles tactiles d'au moins 24 px.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/** Échelle des pas. */
export const Pas: Story = {
  render: () => (
    <Section title="Pas d'espacement" description="Un pas = 4 px. Les demi-pas (0,5 · 1,5) restent disponibles pour l'ajustement fin.">
      <Stack gap={2}>
        {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", gap: 16 }}>
            <Text size={12} tone="subtle" mono>{n} · {n * 4} px</Text>
            <div style={{ width: n * 4, height: 12, borderRadius: 3, background: "var(--ui-pri)" }} />
          </div>
        ))}
      </Stack>
    </Section>
  ),
};

/** Hauteurs de contrôle et largeurs de conteneur. */
export const Gabarits: Story = {
  render: () => (
    <>
      <Section title="Hauteurs de contrôle" description="Bouton sm 32 · bouton 36 · champ 40 · grand bouton 44 · ligne de liste 48-52 · barre de recherche 48.">
        <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
          {[32, 36, 40, 44, 48, 52].map((h) => (
            <div key={h} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
              <div style={{ width: 64, height: h, borderRadius: "var(--ui-r-pill)", background: "var(--ui-card-2)" }} />
              <Text size={12} tone="subtle" mono>{h}</Text>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Conteneurs" description="Container : sm 640 · md 960 · lg 1200 · xl 1440 px.">
        <Stack gap={2}>
          {[640, 960, 1200, 1440].map((w) => (
            <div key={w} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", gap: 16 }}>
              <Text size={12} tone="subtle" mono>{w} px</Text>
              <div style={{ width: `${(w / 1440) * 100}%`, height: 12, borderRadius: 3, background: "var(--ui-card-hover)" }} />
            </div>
          ))}
        </Stack>
      </Section>
    </>
  ),
};
