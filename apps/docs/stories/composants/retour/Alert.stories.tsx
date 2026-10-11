import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertAction, AlertDescription, AlertTitle, Button, Link, Stack } from "@acme/ui";

const meta = {
  title: "Composants/Retour/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Encadré d'information posé dans la page, qui reste tant que la situation dure. Tons : `neu` (neutre), `pri` (nouveauté), `ok`, `warn`, `err` ; seuls `warn` et `err` sont annoncés aux lecteurs d'écran (`role=\"alert\"`). `AlertAction` place une action à droite. Pour un retour passager après une action, `toast`.",
      },
    },
  },
  args: { tone: "warn" },
  argTypes: { tone: { control: "inline-radio", options: ["neu", "pri", "ok", "warn", "err"] } },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Alert {...args}>
        <AlertTitle>3 factures arrivent à échéance cette semaine</AlertTitle>
        <AlertDescription>Total : 48 200,00 MAD.</AlertDescription>
        <AlertAction><Button size="sm" variant="outline">Relancer</Button></AlertAction>
      </Alert>
    </div>
  ),
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Un ton par situation ; le titre dit le fait, la description la conséquence ou la suite. */
export const Tons: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Alert>
        <AlertTitle>Exercice 2025 clôturé</AlertTitle>
        <AlertDescription>Les écritures de cet exercice ne sont plus modifiables.</AlertDescription>
      </Alert>
      <Alert tone="pri">
        <AlertTitle>Nouveau : rapprochement automatique</AlertTitle>
        <AlertDescription>Les relevés importés sont rapprochés des factures. <Link href="#nouveautes">En savoir plus</Link></AlertDescription>
      </Alert>
      <Alert tone="ok">
        <AlertTitle>Déclaration TVA transmise</AlertTitle>
        <AlertDescription>Accusé de réception n° 2026-09-118734.</AlertDescription>
      </Alert>
      <Alert tone="warn">
        <AlertTitle>3 factures arrivent à échéance cette semaine</AlertTitle>
        <AlertDescription>Total : 48 200,00 MAD.</AlertDescription>
        <AlertAction><Button size="sm" variant="outline">Relancer</Button></AlertAction>
      </Alert>
      <Alert tone="err">
        <AlertTitle>Échec de la synchronisation bancaire</AlertTitle>
        <AlertDescription>Le jeton d'accès a expiré. Reconnectez le compte pour reprendre l'import.</AlertDescription>
        <AlertAction><Button size="sm" variant="outline">Reconnecter</Button></AlertAction>
      </Alert>
    </Stack>
  ),
};
