import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Grid,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Switch,
  Textarea,
} from "@acme/ui";

const meta: Meta = {
  title: "Blocs/Formulaire client",
  parameters: {
    docs: {
      description: {
        component:
          "Un formulaire de création complet : chaque contrôle est enveloppé dans un `Field`, qui relie libellé, aide, erreur et obligation. Une seule action primaire, en pied de carte.",
      },
    },
  },
};
export default meta;

export const Ecran: StoryObj = {
  name: "Écran complet",
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 560 }}>
      <CardHeader>
        <CardTitle>Nouveau client</CardTitle>
        <CardDescription>Les champs marqués d'un astérisque sont obligatoires.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap={4}>
          <Field label="Raison sociale" required>
            <Input placeholder="Atlas Distribution SARL" />
          </Field>
          <Grid columns={2} gap={3}>
            <Field label="ICE" required error="L'ICE compte 15 chiffres.">
              <Input defaultValue="00215487" />
            </Field>
            <Field label="Devise" hint="Devise de facturation">
              <Select defaultValue="mad">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mad">Dirham (MAD)</SelectItem>
                  <SelectItem value="eur">Euro (EUR)</SelectItem>
                  <SelectItem value="usd">Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Grid>
          <Field label="Site web">
            <InputGroup>
              <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
              <InputGroupInput placeholder="atlas-distribution.ma" />
            </InputGroup>
          </Field>
          <Field label="Conditions de paiement">
            <RadioGroup defaultValue="30" orientation="horizontal">
              <RadioGroupItem value="0">Comptant</RadioGroupItem>
              <RadioGroupItem value="30">30 jours</RadioGroupItem>
              <RadioGroupItem value="60">60 jours</RadioGroupItem>
            </RadioGroup>
          </Field>
          <Field label="Notes internes" hint="Visibles uniquement par l'équipe.">
            <Textarea autoResize placeholder="Contact privilégié, horaires de livraison…" />
          </Field>
          <Field label="Assujetti à la TVA" orientation="horizontal">
            <Checkbox defaultChecked />
          </Field>
          <Field label="Relances automatiques" hint="Un rappel 3 jours avant l'échéance, puis chaque semaine." orientation="horizontal">
            <Switch defaultChecked />
          </Field>
        </Stack>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Annuler</Button>
        <Button>Créer le client</Button>
      </CardFooter>
    </Card>
  ),
};
