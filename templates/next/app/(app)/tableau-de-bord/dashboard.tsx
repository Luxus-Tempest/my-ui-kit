"use client";

import { TableauDeBord } from "@/components/blocks/tableau-de-bord/TableauDeBord";
import { tableauDeBordSample } from "@/components/blocks/tableau-de-bord/tableau-de-bord.sample";

/**
 * Le bloc tableau de bord avec ses données d'exemple. Remplace `tableauDeBordSample` par tes
 * chiffres (lus côté serveur dans `page.tsx`, puis passés ici en props).
 */
export function Dashboard() {
  return <TableauDeBord {...tableauDeBordSample} title="Tableau de bord" />;
}
