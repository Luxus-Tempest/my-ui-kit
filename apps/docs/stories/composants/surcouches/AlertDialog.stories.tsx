import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@acme/ui";
import { TrashIcon } from "../../_shared/icons";

const Confirm = () => (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogMedia tone="err"><TrashIcon /></AlertDialogMedia>
      <AlertDialogTitle>Supprimer la facture FAC-2026-00412 ?</AlertDialogTitle>
      <AlertDialogDescription>
        Elle sera retirée du grand livre et des déclarations à venir. Cette action est irréversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction variant="destructive">Supprimer</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
);

const meta = {
  title: "Composants/Surcouches/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Confirmation d'une action lourde ou irréversible. Contrairement à `Dialog`, un clic extérieur ne la ferme pas : l'utilisateur doit choisir. Le focus va sur « Annuler » ; l'action destructive est la seule pleine rouge. Le titre est une question, la description dit la conséquence.",
      },
    },
  },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild><Button variant="danger"><TrashIcon />Supprimer</Button></AlertDialogTrigger>
      <Confirm />
    </AlertDialog>
  ),
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cliquez « Supprimer ». */
export const Playground: Story = {};

/** Aperçu ouvert (tests visuels). */
export const Ouverte: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  args: { defaultOpen: true },
};
