import * as React from "react";
import { Button } from "@rovia/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rovia/ui/card";
import { Checkbox } from "@rovia/ui/checkbox";
import { Field } from "@rovia/ui/field";
import { Input, Textarea } from "@rovia/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@rovia/ui/input-group";
import { Grid, Stack } from "@rovia/ui/layout";
import { RadioGroup, RadioGroupItem } from "@rovia/ui/radio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rovia/ui/select";
import { Switch } from "@rovia/ui/switch";

/** Ce que le formulaire envoie à `onSubmit`. */
export interface ClientValues {
  raisonSociale: string;
  ice: string;
  devise: string;
  siteWeb: string;
  conditions: string;
  notes: string;
  tva: boolean;
  relances: boolean;
}

export interface FormulaireClientOption {
  value: string;
  label: string;
}

export interface FormulaireClientProps {
  title?: string;
  description?: string;
  /** Valeurs de départ (édition d'un client existant, ou valeurs par défaut). */
  defaultValues?: Partial<ClientValues>;
  /** Erreurs par champ, renvoyées par ta validation. */
  errors?: Partial<Record<keyof ClientValues, string>>;
  currencies: FormulaireClientOption[];
  paymentTerms: FormulaireClientOption[];
  onSubmit: (values: ClientValues) => void;
  onCancel?: () => void;
  /** Envoi en cours : le bouton se désactive. */
  pending?: boolean;
  submitLabel?: string;
}

/**
 * Formulaire de création d'un client : chaque contrôle est enveloppé dans un `Field`, qui relie
 * libellé, aide, erreur et obligation. Une seule action primaire, en pied de carte.
 */
export function FormulaireClient({
  title = "Nouveau client",
  description = "Les champs marqués d'un astérisque sont obligatoires.",
  defaultValues = {},
  errors = {},
  currencies,
  paymentTerms,
  onSubmit,
  onCancel,
  pending = false,
  submitLabel = "Créer le client",
}: FormulaireClientProps) {
  const v = defaultValues;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const text = (key: keyof ClientValues) => String(data.get(key) ?? "");
        onSubmit({
          raisonSociale: text("raisonSociale"),
          ice: text("ice"),
          devise: text("devise"),
          siteWeb: text("siteWeb"),
          conditions: text("conditions"),
          notes: text("notes"),
          tva: data.get("tva") != null,
          relances: data.get("relances") != null,
        });
      }}
    >
      <Card variant="elevated" style={{ maxWidth: 560 }}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack gap={4}>
            <Field label="Raison sociale" required error={errors.raisonSociale}>
              <Input name="raisonSociale" defaultValue={v.raisonSociale} placeholder="Atlas Distribution SARL" />
            </Field>
            <Grid columns={2} gap={3}>
              <Field label="ICE" required error={errors.ice}>
                <Input name="ice" defaultValue={v.ice} />
              </Field>
              <Field label="Devise" hint="Devise de facturation" error={errors.devise}>
                <Select name="devise" defaultValue={v.devise ?? currencies[0]?.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Grid>
            <Field label="Site web" error={errors.siteWeb}>
              <InputGroup>
                <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
                <InputGroupInput name="siteWeb" defaultValue={v.siteWeb} placeholder="atlas-distribution.ma" />
              </InputGroup>
            </Field>
            <Field label="Conditions de paiement" error={errors.conditions}>
              <RadioGroup name="conditions" defaultValue={v.conditions ?? paymentTerms[0]?.value} orientation="horizontal">
                {paymentTerms.map((t) => (
                  <RadioGroupItem key={t.value} value={t.value}>{t.label}</RadioGroupItem>
                ))}
              </RadioGroup>
            </Field>
            <Field label="Notes internes" hint="Visibles uniquement par l'équipe." error={errors.notes}>
              <Textarea name="notes" autoResize defaultValue={v.notes} placeholder="Contact privilégié, horaires de livraison…" />
            </Field>
            <Field label="Assujetti à la TVA" orientation="horizontal">
              <Checkbox name="tva" defaultChecked={v.tva ?? true} />
            </Field>
            <Field label="Relances automatiques" hint="Un rappel 3 jours avant l'échéance, puis chaque semaine." orientation="horizontal">
              <Switch name="relances" defaultChecked={v.relances ?? true} />
            </Field>
          </Stack>
        </CardContent>
        <CardFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button type="submit" disabled={pending}>{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
