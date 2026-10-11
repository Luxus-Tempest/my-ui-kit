import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DonutChart,
  Heading,
  HStack,
  LineChart,
  Progress,
  Stack,
  Stat,
  StatGroup,
  ToggleGroup,
  ToggleGroupItem,
  Text,
} from "@acme/ui";
import { CircleDollarSign, Percent, Receipt, Target } from "lucide-react";
import { BY_FAMILY, BY_REGION, formatMad, REVENUE } from "../_shared/data";

const meta: Meta = {
  title: "Blocs/Tableau de bord",
  parameters: {
    docs: {
      description: {
        component:
          "Un tableau de bord financier : filtre de période sur une seule rangée au-dessus de tout ce qu'il filtre, rangée d'indicateurs (`StatGroup`) avec variation et tendance, courbes, barres et anneau, bascule graphique / tableau.",
      },
    },
  },
};
export default meta;

const RANGES = { "3m": 3, "6m": 6, "12m": 12 } as const;
const MAD: Intl.NumberFormatOptions = { style: "currency", currency: "MAD", maximumFractionDigits: 0 };

const sum = (rows: typeof REVENUE, key: "ca" | "charges" | "objectif") => rows.reduce((s, d) => s + d[key], 0);
/** Variation relative ; `undefined` sans période de comparaison (12 mois sur 12 mois de données). */
const change = (now: number, before: number) => (before ? (now - before) / before : undefined);

function ViewToggle({ value, onChange }: { value: "chart" | "table"; onChange: (v: "chart" | "table") => void }) {
  return (
    <ToggleGroup type="single" size="sm" value={value} onValueChange={(v) => onChange(v as "chart" | "table")} aria-label="Affichage du chiffre d'affaires">
      <ToggleGroupItem value="chart">Graphique</ToggleGroupItem>
      <ToggleGroupItem value="table">Tableau</ToggleGroupItem>
    </ToggleGroup>
  );
}

function Dashboard() {
  const [range, setRange] = React.useState<keyof typeof RANGES>("6m");
  const [view, setView] = React.useState<"chart" | "table">("chart");
  const months = RANGES[range];
  const data = REVENUE.slice(-months);
  const before = months < REVENUE.length ? REVENUE.slice(-2 * months, -months) : [];
  const ca = sum(data, "ca");
  const charges = sum(data, "charges");
  const marge = ca - charges;
  const margeAvant = sum(before, "ca") - sum(before, "charges");
  const atteinte = ca / sum(data, "objectif");
  const comparedTo = `vs ${months} mois précédents`;

  return (
    <Stack gap={5} style={{ maxWidth: 1120 }}>
      <HStack justify="between" wrap gap={3}>
        <Stack gap={1}>
          <Heading level={1} size="lg">Activité commerciale</Heading>
          <Text tone="muted">Situation au 10 octobre 2026</Text>
        </Stack>
        {/* Filtres : une seule rangée, au-dessus de tout ce qu'elle filtre. */}
        <ToggleGroup type="single" value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)} aria-label="Période">
          <ToggleGroupItem value="3m">3 mois</ToggleGroupItem>
          <ToggleGroupItem value="6m">6 mois</ToggleGroupItem>
          <ToggleGroupItem value="12m">12 mois</ToggleGroupItem>
        </ToggleGroup>
      </HStack>

      <StatGroup aria-label="Indicateurs de la période">
        <Stat
          label="Chiffre d'affaires"
          icon={<CircleDollarSign />}
          value={ca}
          format={MAD}
          delta={change(ca, sum(before, "ca"))}
          deltaLabel={comparedTo}
          trend={data.map((d) => d.ca)}
          trendPeriod="mois"
        />
        <Stat
          label="Charges"
          icon={<Receipt />}
          value={charges}
          format={MAD}
          delta={change(charges, sum(before, "charges"))}
          deltaLabel={comparedTo}
          positiveIsGood={false}
          trend={data.map((d) => d.charges)}
          trendPeriod="mois"
        />
        <Stat
          label="Marge"
          icon={<Percent />}
          value={marge}
          format={MAD}
          delta={change(marge, margeAvant)}
          deltaLabel={comparedTo}
          trend={data.map((d) => d.ca - d.charges)}
          trendPeriod="mois"
        />
        <Stat
          label="Objectif atteint"
          icon={<Target />}
          value={atteinte}
          format={{ style: "percent", maximumFractionDigits: 0 }}
        >
          <Progress
            value={Math.min(atteinte, 1) * 100}
            tone={atteinte >= 1 ? "ok" : "pri"}
            size="sm"
            aria-label="Part de l'objectif de chiffre d'affaires atteinte"
          />
        </Stat>
      </StatGroup>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card variant="elevated" style={{ gridColumn: "1 / -1" }}>
          <CardHeader>
            <CardTitle>Chiffre d'affaires et charges</CardTitle>
            <CardDescription>Par mois, en dirhams</CardDescription>
            <CardAction><ViewToggle value={view} onChange={setView} /></CardAction>
          </CardHeader>
          <CardContent>
            <LineChart
              title="Chiffre d'affaires et charges, par mois"
              data={data}
              x="mois"
              xLabel="Mois"
              series={[
                { key: "ca", label: "Chiffre d'affaires" },
                { key: "charges", label: "Charges" },
              ]}
              area
              valueFormatter={formatMad}
              view={view}
              height={300}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Ventes par région</CardTitle>
            <CardDescription>Produits et services, en dirhams</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              title="Ventes par région"
              data={BY_REGION}
              x="region"
              xLabel="Région"
              series={[
                { key: "produits", label: "Produits" },
                { key: "services", label: "Services" },
              ]}
              valueFormatter={formatMad}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Répartition du chiffre d'affaires</CardTitle>
            <CardDescription>Par famille de produits</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart title="Répartition du chiffre d'affaires par famille" valueFormatter={formatMad} data={BY_FAMILY} />
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}

export const Ecran: StoryObj = { name: "Écran complet", render: () => <Dashboard /> };
