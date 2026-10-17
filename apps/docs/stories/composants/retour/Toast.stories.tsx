import type { Meta, StoryObj } from "@storybook/react";
import { Button, HStack, Toaster, toast } from "@rovia/ui";

const meta = {
  title: "Composants/Retour/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    registry: "toast",
    docs: {
      description: {
        component:
          "Retour passager après une action, à la manière d'une notification iOS (matériau translucide). `<Toaster />` est monté **une seule fois**, près de la racine ; ensuite `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()` et `toast.promise()` depuis n'importe où. Surface neutre : l'icône porte le ton. Une action (« Annuler ») reste toujours accessible ailleurs dans l'interface.",
      },
    },
  },
  render: () => (
    <>
      <Toaster />
      <HStack gap={2} wrap>
        <Button variant="outline" onClick={() => toast.success("Facture envoyée", { description: "FAC-2026-00412 à Atlas Distribution" })}>
          Succès
        </Button>
        <Button variant="outline" onClick={() => toast.error("Envoi impossible", { description: "Adresse de facturation manquante." })}>
          Erreur
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Plafond de crédit atteint à 92 %")}>Avertissement</Button>
        <Button variant="outline" onClick={() => toast.info("Export en cours de préparation")}>Info</Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(new Promise((r) => setTimeout(r, 1500)), {
              loading: "Enregistrement…",
              success: "Brouillon enregistré",
              error: "Échec",
            })
          }
        >
          Promesse
        </Button>
        <Button variant="outline" onClick={() => toast("Facture archivée", { action: { label: "Annuler", onClick: () => {} } })}>
          Avec action
        </Button>
      </HStack>
    </>
  ),
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Chaque bouton déclenche un type de notification. */
export const Playground: Story = {};
