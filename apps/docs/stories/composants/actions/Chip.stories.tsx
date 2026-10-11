import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Chip, ChipGroup, Menu, MenuContent, MenuItem, MenuTrigger } from "@acme/ui";
import { ClockIcon } from "../../_shared/icons";

const Chevron = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

const meta = {
  title: "Composants/Actions/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Puce en pilule de 32 px, comme les filtres de Drive. Trois usages : **action** (sans `selected`), **filtre** (`selected` booléen : bascule `aria-pressed`, coche et conteneur de sélection) et **entrée** (`onRemove` : bouton « Retirer », Retour arrière et Suppr retirent aussi). `ChipGroup` les range sur plusieurs lignes.",
      },
    },
  },
  args: { children: "Documents", selected: false, disabled: false },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Filters() {
  const [types, setTypes] = React.useState<string[]>(["Documents"]);
  const toggle = (t: string) => setTypes((all) => (all.includes(t) ? all.filter((x) => x !== t) : [...all, t]));
  return (
    <ChipGroup aria-label="Type de fichier">
      {["Documents", "Feuilles de calcul", "PDF", "Images"].map((t) => (
        <Chip key={t} selected={types.includes(t)} onClick={() => toggle(t)}>{t}</Chip>
      ))}
    </ChipGroup>
  );
}

/** Puces de filtre : sélection multiple, chacune annonce son état. */
export const Filtres: Story = { render: () => <Filters /> };

/** Puce d'action qui ouvre un menu de filtre (`MenuTrigger asChild`). */
export const AvecMenu: Story = {
  name: "Avec menu",
  render: () => (
    <ChipGroup aria-label="Filtres">
      <Menu>
        <MenuTrigger asChild>
          <Chip>Personnes<Chevron /></Chip>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Inès Benali</MenuItem>
          <MenuItem>Karim Alaoui</MenuItem>
        </MenuContent>
      </Menu>
      <Chip icon={<ClockIcon />}>Modifié<Chevron /></Chip>
    </ChipGroup>
  ),
};

function Recipients() {
  const [people, setPeople] = React.useState(["Inès", "Karim", "Sofia"]);
  return (
    <ChipGroup aria-label="Destinataires">
      {people.map((p) => (
        <Chip
          key={p}
          icon={<Avatar size="sm" style={{ margin: "0 -2px 0 -4px" }}><AvatarFallback>{p[0]}</AvatarFallback></Avatar>}
          onRemove={() => setPeople(people.filter((x) => x !== p))}
        >
          {p}
        </Chip>
      ))}
    </ChipGroup>
  );
}

/** Puces d'entrée (destinataires, étiquettes) : retirables à la souris et au clavier. */
export const Retirables: Story = { render: () => <Recipients /> };
