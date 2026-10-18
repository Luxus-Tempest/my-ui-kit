"use client";
/* @rovia/ui 1.0.0 · tableau-de-bord */
import * as React from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@rovia/ui/card";
import { BarChart, DonutChart, LineChart } from "@rovia/ui/chart";
import { HStack, Stack } from "@rovia/ui/layout";
import { Progress } from "@rovia/ui/progress";
import { Stat, StatGroup } from "@rovia/ui/stat";
import { ToggleGroup, ToggleGroupItem } from "@rovia/ui/toggle";
import { Heading, Text } from "@rovia/ui/typography";
import { CircleDollarSign, Percent, Receipt, Target } from "lucide-react";

/** Un mois d'activité. */
export type TableauDeBordMois = {
  mois: string;
  ca: number;
  charges: number;
  objectif: number;
};

export interface TableauDeBordProps {
  title?: string;
  /** Sous titre, par exemple la date de situation. */
  asOf?: string;
  /** Mois d'activité, du plus ancien au plus récent (12 mois pour comparer 6 mois à 6 mois). */
  revenue: TableauDeBordMois[];
  byRegion: { region: string; produits: number; services: number }[];
  byFamily: { label: string; value: number }[];
  /** Code ISO de la devise (MAD, EUR…). */
  currency?: string;
  /** Unité affichée sous les titres de graphiques, par exemple « en dirhams ». */
  unitLabel?: string;
  locale?: string;
}

const RANGES = { "3m": 3, "6m": 6, "12m": 12 } as const;

const sum = (rows: TableauDeBordMois[], key: "ca" | "charges" | "objectif") => rows.reduce((s, d) => s + d[key], 0);
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

/**
 * Tableau de bord financier : filtre de période sur une seule rangée au dessus de tout ce qu'il
 * filtre, indicateurs avec variation et tendance, courbes, barres et anneau, bascule graphique / tableau.
 */
export function TableauDeBord({
  title = "Activité commerciale",
  asOf,
  revenue,
  byRegion,
  byFamily,
  currency = "MAD",
  unitLabel,
  locale = "fr-FR",
}: TableauDeBordProps) {
  const [range, setRange] = React.useState<keyof typeof RANGES>("6m");
  const [view, setView] = React.useState<"chart" | "table">("chart");
  const money: Intl.NumberFormatOptions = { style: "currency", currency, maximumFractionDigits: 0 };
  const formatMoney = React.useMemo(() => {
    const f = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    return (v: number) => f.format(v);
  }, [locale, currency]);
  const withUnit = (text: string) => (unitLabel ? `${text}, ${unitLabel}` : text);
  const months = RANGES[range];
  const data = revenue.slice(-months);
  const before = months < revenue.length ? revenue.slice(-2 * months, -months) : [];
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
          <Heading level={1} size="lg">{title}</Heading>
          {asOf && <Text tone="muted">{asOf}</Text>}
        </Stack>
        {/* Filtres : une seule rangée, au dessus de tout ce qu'elle filtre. */}
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
          format={money}
          delta={change(ca, sum(before, "ca"))}
          deltaLabel={comparedTo}
          trend={data.map((d) => d.ca)}
          trendPeriod="mois"
        />
        <Stat
          label="Charges"
          icon={<Receipt />}
          value={charges}
          format={money}
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
          format={money}
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
            <CardDescription>{withUnit("Par mois")}</CardDescription>
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
              valueFormatter={formatMoney}
              view={view}
              height={300}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Ventes par région</CardTitle>
            <CardDescription>{withUnit("Produits et services")}</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              title="Ventes par région"
              data={byRegion}
              x="region"
              xLabel="Région"
              series={[
                { key: "produits", label: "Produits" },
                { key: "services", label: "Services" },
              ]}
              valueFormatter={formatMoney}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Répartition du chiffre d'affaires</CardTitle>
            <CardDescription>Par famille de produits</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart title="Répartition du chiffre d'affaires par famille" valueFormatter={formatMoney} data={byFamily} />
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}
