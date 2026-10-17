import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chart } from "@rovia/ui";
import { MONTHS, REVENUE } from "../../_shared/data";

const meta = {
  title: "Composants/Graphiques/Chart",
  component: Chart,
  tags: ["autodocs"],
  parameters: {
    registry: "chart",
    docs: {
      description: {
        component:
          "Enveloppe générique d'Apache ECharts : accepte n'importe quelle option des [exemples officiels](https://echarts.apache.org/examples/fr/index.html). En fonction `(tokens, size) => option`, elle lit les jetons du thème (palette, gammes séquentielle et divergente, encres, fond) et la taille du tracé, et se rejoue quand le thème bascule ou que le conteneur change de taille. Seuls ligne, barre, secteur et nuage sont enregistrés : `registerChartModules([...])` pour les autres. Légende, alternative textuelle et nom (`aria-label`) sont à la charge de l'appelant.",
      },
    },
  },
  args: { height: 260, renderer: "svg", "aria-label": "Écart mensuel entre chiffre d'affaires et objectif" },
  argTypes: {
    renderer: { control: "inline-radio", options: ["svg", "canvas"] },
    option: { control: false },
  },
  render: (args) => (
    <Card variant="elevated" style={{ maxWidth: 760 }}>
      <CardHeader>
        <CardTitle>Écart à l'objectif</CardTitle>
        <CardDescription>Au-dessus de l'objectif en bleu, en dessous en rouge (gamme divergente).</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart
          {...args}
          option={(t) => ({
            grid: { left: 4, right: 12, top: 12, bottom: 4, outerBoundsMode: "same", outerBoundsContain: "axisLabel" },
            xAxis: { type: "category", data: MONTHS },
            yAxis: { type: "value", axisLabel: { formatter: (v: number) => `${v / 1000} k` } },
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            series: [
              {
                type: "bar",
                barMaxWidth: 24,
                data: REVENUE.map((d) => {
                  const gap = d.ca - d.objectif;
                  return {
                    value: gap,
                    itemStyle: {
                      color: gap >= 0 ? t.diverging.negative : t.diverging.positive,
                      borderRadius: gap >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
                    },
                  };
                }),
                markLine: { symbol: "none", silent: true, lineStyle: { color: t.axis, type: "solid" }, data: [{ yAxis: 0 }], label: { show: false } },
              },
            ],
          })}
        />
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof Chart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Une option ECharts libre, habillée par le thème. */
export const Playground: Story = { args: { option: {} } };
