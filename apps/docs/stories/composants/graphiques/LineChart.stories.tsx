import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, LineChart } from "@acme/ui";
import { formatMad, REVENUE } from "../../_shared/data";

const SERIES = [
  { key: "ca" as const, label: "Chiffre d'affaires" },
  { key: "charges" as const, label: "Charges" },
];

const meta = {
  title: "Composants/Graphiques/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Évolution dans le temps (Apache ECharts). Traits de 2 px, réticule vertical qui trouve l'abscisse, une infobulle pour toutes les séries, étiquettes en bout de ligne jusqu'à quatre séries. `area` ajoute un lavis à 10 %, `stacked` empile. Légende cliquable dès deux séries (la couleur suit la série, jamais son rang), parcours aux flèches, vue tableau toujours disponible (`view=\"table\"`).",
      },
    },
  },
  args: {
    title: "Chiffre d'affaires et charges, par mois",
    data: REVENUE,
    x: "mois",
    xLabel: "Mois",
    series: SERIES,
    area: false,
    stacked: false,
    curve: "linear",
    view: "chart",
    height: 300,
    valueFormatter: formatMad,
  },
  argTypes: {
    curve: { control: "inline-radio", options: ["linear", "smooth"] },
    view: { control: "inline-radio", options: ["chart", "table"] },
    data: { control: false },
    series: { control: false },
    valueFormatter: { control: false },
  },
  render: (args) => (
    <Card variant="elevated" style={{ maxWidth: 900 }}>
      <CardContent>
        <LineChart {...args} />
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof LineChart<(typeof REVENUE)[number]>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Lavis sous chaque ligne. */
export const Aire: Story = { args: { area: true } };

/** Une seule série : pas de légende, la valeur finale en bout de ligne. */
export const UneSerie: Story = { name: "Une série", args: { series: [SERIES[0]], title: "Chiffre d'affaires, par mois" } };

/** La même information en tableau : `view="table"`. */
export const VueTableau: Story = { name: "Vue tableau", args: { view: "table" } };

/** Rechargement : le tracé précédent reste affiché, estompé (pas de squelette, pas de saut). */
export const Rechargement: Story = { args: { loading: true } };
