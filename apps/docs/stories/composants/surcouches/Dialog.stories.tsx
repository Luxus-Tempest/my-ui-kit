import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
} from "@rovia/ui";

const RenameForm = () => (
  <>
    <DialogHeader>
      <DialogTitle>Renommer le dossier</DialogTitle>
      <DialogDescription>Le nouveau nom s'applique pour tous les membres de l'espace.</DialogDescription>
    </DialogHeader>
    <Field label="Nom du dossier" required>
      <Input defaultValue="Contrats fournisseurs 2026" />
    </Field>
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose>
      <DialogClose asChild><Button>Renommer</Button></DialogClose>
    </DialogFooter>
  </>
);

const meta = {
  title: "Composants/Surcouches/Dialog",
  component: DialogContent,
  tags: ["autodocs"],
  parameters: {
    registry: "dialog",
    docs: {
      description: {
        component:
          "Modale : une tâche courte qui interrompt le flux (renommer, partager, saisir). Feuille centrée au rayon de 20 px, entrée en ressort, voile flouté ; piège à focus, Échap et retour du focus au déclencheur. Toujours un `DialogTitle`. Pour une confirmation destructive, `AlertDialog` ; pour un panneau latéral, `Sheet`.",
      },
    },
  },
  args: { size: "sm", showCloseButton: true },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Renommer</Button></DialogTrigger>
      <DialogContent {...args}><RenameForm /></DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof DialogContent>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cliquez « Renommer ». */
export const Playground: Story = {};

/** Aperçu ouvert (tests visuels). */
export const Ouverte: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent {...args} onInteractOutside={(e) => e.preventDefault()}><RenameForm /></DialogContent>
    </Dialog>
  ),
};
