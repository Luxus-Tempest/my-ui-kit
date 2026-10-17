import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Checkbox,
  Field,
  HStack,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rovia/ui";
import { FilterIcon } from "../../_shared/icons";

const Filters = () => (
  <>
    <PopoverHeader>
      <PopoverTitle>Filtrer les factures</PopoverTitle>
      <PopoverDescription>Les filtres s'appliquent à la liste affichée.</PopoverDescription>
    </PopoverHeader>
    <Field label="Statut">
      <Select defaultValue="all">
        <SelectTrigger density="sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="late">En retard</SelectItem>
          <SelectItem value="paid">Payées</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Seulement mes factures" orientation="horizontal"><Checkbox defaultChecked /></Field>
    <HStack justify="end" gap={2}>
      <Button size="sm" variant="ghost">Réinitialiser</Button>
      <Button size="sm">Appliquer</Button>
    </HStack>
  </>
);

const meta = {
  title: "Composants/Surcouches/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    registry: "popover",
    docs: {
      description: {
        component:
          "Panneau flottant non modal, ancré à son déclencheur : filtres, réglages rapides, détails. Il peut contenir des contrôles ; Échap et un clic extérieur le ferment et le focus revient au déclencheur. Surface en matériau translucide, rayon 16 px.",
      },
    },
  },
  render: (args) => (
    <div style={{ minHeight: 340 }}>
      <Popover {...args}>
        <PopoverTrigger asChild><Button variant="outline"><FilterIcon />Filtres</Button></PopoverTrigger>
        <PopoverContent align="start"><Filters /></PopoverContent>
      </Popover>
    </div>
  ),
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Un panneau de filtres. */
export const Playground: Story = {};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  args: { defaultOpen: true },
};
