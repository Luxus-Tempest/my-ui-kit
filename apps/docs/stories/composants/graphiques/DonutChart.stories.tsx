import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, DonutChart } from "@rovia/ui";
import { BY_FAMILY, formatMad } from "../../_shared/data";

const meta = {
  title: "Composants/Graphiques/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  parameters: {
    registry: "chart",
    docs: {
      description: {
        component:
          "La part d'un tout, en un coup d'œil (Apache ECharts). Six parts au plus : au-delà, les dernières se regroupent dans « Autres » (gris neutre). Écart de 2 px couleur du fond entre les parts, total au centre. Pour comparer des valeurs proches, préférer `BarChart`.",
      },
    },
  },
  args: { title: "Répartition du chiffre d'affaires par famille", data: BY_FAMILY, valueFormatter: formatMad, height: 240, view: "chart" },
  argTypes: {
    view: { control: "inline-radio", options: ["chart", "table"] },
    data: { control: false },
    valueFormatter: { control: false },
  },
  render: (args) => (
    <Card variant="elevated" style={{ maxWidth: 380 }}>
      <CardContent>
        <DonutChart {...args} />
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sept familles : les deux dernières sont regroupées dans « Autres ». */
export const Playground: Story = {};

/** Deux parts, libellé central personnalisé. */
export const DeuxParts: Story = {
  name: "Deux parts",
  args: {
    title: "Factures payées et en attente",
    data: [{ label: "Payées", value: 86 }, { label: "En attente", value: 14 }],
    valueFormatter: (v: number) => `${v} %`,
    centerValue: "86 %",
    centerLabel: "payées",
  },
};
