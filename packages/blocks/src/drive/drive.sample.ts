import type { DriveProps } from "./Drive";

/** Données d'exemple : le bloc s'affiche dès l'installation. Remplace-les par tes fichiers. */
export const driveSample = {
  appName: "Nuage",
  userInitials: "SB",
  files: [
    { id: "budget", name: "Budget 2027.xlsx", meta: "Modifié par vous · 9 oct.", tint: "var(--ui-c3)", size: "284 Ko" },
    { id: "contrat", name: "Contrat cadre.pdf", meta: "Partagé par Inès · hier", tint: "var(--ui-c2)", size: "1,2 Mo" },
    { id: "q4", name: "Présentation Q4", meta: "Ouvert par vous · 2 oct.", tint: "var(--ui-c4)", size: "8,4 Mo" },
    { id: "notes", name: "Notes de réunion", meta: "Modifié par Karim · 28 sept.", tint: "var(--ui-c1)", size: "36 Ko" },
  ],
  fileTypes: ["Documents", "Feuilles de calcul", "PDF", "Présentations"],
  storage: { percent: 21, label: "3,2 Go utilisés sur 15 Go" },
  collaborators: [
    { initials: "SB", name: "Vous", role: "Propriétaire" },
    { initials: "IB", name: "Inès Benali", role: "Éditeur" },
  ],
  newItemsLabel: "4 nouveautés",
  defaultSelectedId: "contrat",
} satisfies DriveProps;
