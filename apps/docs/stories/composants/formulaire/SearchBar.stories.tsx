import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, SearchBar, Text } from "@rovia/ui";
import { FilterIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Formulaire/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    registry: "search-bar",
    docs: {
      description: {
        component:
          "Barre de recherche de Drive : pilule tonale avec loupe, qui devient un panneau surélevé au focus. Bouton d'effacement et Échap pour vider (iOS). Contrôlée (`value` + `onValueChange`) ou non. Sans libellé visible, passer `aria-label`.",
      },
    },
  },
  args: { "aria-label": "Rechercher dans le Drive", placeholder: "Rechercher dans le Drive", size: "default", disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["default", "lg"] } },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <SearchBar {...args} />
    </div>
  ),
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `lg` (48 px) pour l'en-tête d'application ; `default` (40 px) dans une page ou un panneau. */
export const Tailles: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
      <SearchBar size="lg" aria-label="Recherche principale" placeholder="Rechercher dans le Drive" />
      <SearchBar aria-label="Filtrer les membres" placeholder="Filtrer les membres" />
    </div>
  ),
};

/** `trailing` accueille un bouton de filtres, un avatar, un raccourci. */
export const AvecActionAuBout: Story = {
  name: "Avec action au bout",
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <SearchBar
        size="lg"
        aria-label="Rechercher"
        placeholder="Rechercher"
        trailing={<Button size="icon" variant="ghost" aria-label="Options de recherche"><FilterIcon /></Button>}
      />
    </div>
  ),
};

function Controlled() {
  const [query, setQuery] = React.useState("contrat");
  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 480 }}>
      <SearchBar aria-label="Rechercher" value={query} onValueChange={setQuery} />
      <Text size={13} tone="muted">Valeur : « {query} »</Text>
    </div>
  );
}

/** Contrôlée : Échap ou la croix vident la valeur et rendent le focus au champ. */
export const Controlee: Story = { name: "Contrôlée", render: () => <Controlled /> };
