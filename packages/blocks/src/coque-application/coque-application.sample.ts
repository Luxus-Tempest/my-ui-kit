import { ChartColumn, House, Settings, Users } from "lucide-react";
import type { CoqueApplicationProps } from "./CoqueApplication";

/**
 * Données d'exemple : une navigation à deux groupes et un utilisateur. Remplace-les par ta
 * navigation et ta session, et passe le `Link` de ton framework en `linkComponent`.
 */
export const coqueApplicationSample = {
  appName: "Acme",
  orgName: "Atlas Distribution SARL",
  navigation: [
    {
      items: [
        { href: "/tableau-de-bord", label: "Tableau de bord", icon: House },
        { href: "/clients", label: "Clients", icon: Users, badge: 3 },
        { href: "/rapports", label: "Rapports", icon: ChartColumn },
      ],
    },
    { label: "Compte", items: [{ href: "/parametres", label: "Paramètres", icon: Settings }] },
  ],
  activeHref: "/tableau-de-bord",
  user: { name: "Nadia Alami", role: "Comptable" },
} satisfies Omit<CoqueApplicationProps, "onSignOut" | "children">;
