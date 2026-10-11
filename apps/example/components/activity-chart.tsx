"use client";

import { LineChart } from "@acme/ui";

const nombre = new Intl.NumberFormat("fr-FR");

/** Client : `valueFormatter` est une fonction, qui ne peut pas venir d'un composant serveur. */
export function ActivityChart({ data }: { data: { mois: string; documents: number; requetes: number }[] }) {
  return (
    <LineChart
      title="Documents importés et requêtes aux agents, par mois"
      data={data}
      x="mois"
      xLabel="Mois"
      series={[
        { key: "requetes", label: "Requêtes aux agents" },
        { key: "documents", label: "Documents importés" },
      ]}
      area
      valueFormatter={(v) => nombre.format(v)}
      height={280}
    />
  );
}
