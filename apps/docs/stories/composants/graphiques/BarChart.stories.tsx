import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, Card, CardContent } from "@rovia/ui";
import { BY_REGION, formatMad } from "../../_shared/data";

const SERIES = [
  { key: "produits" as const, label: "Produits" },
  { key: "services" as const, label: "Services" },
];

const meta = {
  title: "Composants/Graphiques/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: {
    registry: "chart",
    docs: {
      description: {
        component:
          "Comparaison de catégories (Apache ECharts). Barres de 24 px au plus, bout arrondi de 4 px côté donnée et carré côté ligne de base ; empilées, un écart de 2 px couleur du fond sépare les segments. Chaque barre porte sa propre infobulle. `horizontal` pour les libellés longs et les classements. `texture` ajoute des hachures (impression, daltonisme complet).",
      },
    },
  },
  args: {
    title: "Ventes par région",
    data: BY_REGION,
    x: "region",
    xLabel: "Région",
    series: SERIES,
    stacked: false,
    horizontal: false,
    texture: false,
    view: "chart",
    height: 300,
    valueFormatter: formatMad,
  },
  argTypes: {
    view: { control: "inline-radio", options: ["chart", "table"] },
    data: { control: false },
    series: { control: false },
    valueFormatter: { control: false },
  },
  render: (args) => (
    <Card variant="elevated" style={{ maxWidth: 760 }}>
      <CardContent>
        <BarChart {...args} />
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof BarChart<(typeof BY_REGION)[number]>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empilees: Story = { name: "Empilées", args: { stacked: true } };

/** Classement : une série, barres horizontales. */
export const Horizontales: Story = { args: { horizontal: true, series: [SERIES[0]], title: "Produits par région", height: 260 } };

/** Hachures en plus de la couleur. */
export const Texture: Story = { args: { stacked: true, texture: true } };
