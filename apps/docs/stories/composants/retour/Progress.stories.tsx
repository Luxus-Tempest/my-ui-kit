import type { Meta, StoryObj } from "@storybook/react";
import { Progress, Stack } from "@rovia/ui";

const meta = {
  title: "Composants/Retour/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    registry: "progress",
    docs: {
      description: {
        component:
          "Avancement d'une tâche ou remplissage d'une jauge. Avec `value` : déterminée ; sans : indéterminée (balayage). `label` et `showValue` en font un champ complet ; sans libellé, passer `aria-label`. Le ton signale un seuil (`warn`), une réussite (`ok`) ou une erreur (`err`).",
      },
    },
  },
  args: { value: 64, label: "Import des factures", showValue: true, tone: "pri", size: "default" },
  argTypes: {
    tone: { control: "inline-radio", options: ["pri", "ok", "warn", "err"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Tons, valeur personnalisée et mode indéterminé. */
export const Usages: Story = {
  render: () => (
    <Stack gap={5} style={{ maxWidth: 420 }}>
      <Progress value={64} label="Import des factures" showValue />
      <Progress value={92} tone="warn" label="Espace de stockage" showValue={(v) => `${v} Go sur 100`} />
      <Progress value={100} tone="ok" label="Rapprochement bancaire" showValue />
      <Progress size="sm" label="Synchronisation en cours" />
    </Stack>
  ),
};
