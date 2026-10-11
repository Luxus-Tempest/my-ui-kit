import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, List, ListItem } from "@acme/ui";
import { Card } from "../../_shared/demo";
import { ChevronDownIcon, FileIcon } from "../../_shared/icons";

const chevronStyle = (open: boolean): React.CSSProperties => ({
  transform: open ? "rotate(180deg)" : "none",
  transition: "transform var(--ui-duration-slow) var(--ui-ease-spring)",
});

const meta = {
  title: "Composants/Mise en page/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Replie une seule zone : « Afficher plus », réglages avancés, détails d'une ligne. Le déclencheur n'impose aucun style : avec `asChild`, il prête `aria-expanded` et le clavier à un `Button` ou à tout autre élément. Le contenu s'ouvre en hauteur, en ressort. Pour une suite de sections, préférer `Accordion`.",
      },
    },
  },
  args: { defaultOpen: false, disabled: false },
  argTypes: {
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    defaultOpen: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <Card>
      <Collapsible {...args}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">Réglages avancés</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ margin: "12px 0 0", color: "var(--ui-fg-2)", fontSize: 14 }}>
            Limite de bande passante, proxy et dossier de cache local.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ),
} satisfies Meta<typeof Collapsible>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

function ShowMoreDemo() {
  const [open, setOpen] = React.useState(false);
  const files = ["Budget 2027.xlsx", "Compte rendu.docx", "Maquette accueil.fig", "Contrat cadre.pdf", "Photos séminaire.zip"];
  return (
    <Collapsible open={open} onOpenChange={setOpen} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <List>
        {files.slice(0, 2).map((f) => (
          <ListItem key={f} leading={<FileIcon />}>{f}</ListItem>
        ))}
      </List>
      <CollapsibleContent>
        <List>
          {files.slice(2).map((f) => (
            <ListItem key={f} leading={<FileIcon />}>{f}</ListItem>
          ))}
        </List>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" style={{ justifySelf: "start" }}>
          {open ? "Afficher moins" : `Afficher ${files.length - 2} de plus`}
          <ChevronDownIcon />
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

/** « Afficher plus » piloté (`open` / `onOpenChange`) : le libellé du bouton suit l'état. */
export const AfficherPlus: Story = {
  name: "Afficher plus",
  render: () => <ShowMoreDemo />,
};

function DetailsDemo() {
  const [open, setOpen] = React.useState(true);
  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Détails de l'activité</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={open ? "Masquer les détails" : "Afficher les détails"}>
              <ChevronDownIcon />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <p style={{ margin: "8px 0 0", color: "var(--ui-fg-2)", fontSize: 14 }}>
            Camille a modifié 3 fichiers et partagé « Projets 2026 » avec l'équipe Design.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * `asChild` sur un bouton icône : le comportement est celui de Radix, l'apparence
 * celle du `Button`. Un bouton icône exige un `aria-label`.
 */
export const BoutonIcone: Story = {
  name: "Composition (bouton icône)",
  render: () => <DetailsDemo />,
};

/** Le chevron peut suivre l'état ouvert avec la même courbe ressort que le contenu. */
export const AvecChevron: Story = {
  name: "Composition (chevron animé)",
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <Card>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="secondary">
              Options d'export
              <span style={{ display: "inline-flex", ...chevronStyle(open) }}><ChevronDownIcon /></span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p style={{ margin: "12px 0 0", color: "var(--ui-fg-2)", fontSize: 14 }}>
              Format PDF, pages 1 à 12, annotations incluses.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  },
};
