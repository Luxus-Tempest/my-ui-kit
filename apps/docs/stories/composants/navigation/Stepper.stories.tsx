import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Field,
  Input,
  Step,
  StepContent,
  StepDescription,
  StepIndicator,
  StepTitle,
  Stepper,
  Text,
  useStepper,
} from "@rovia/ui";
import { CreditCard, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { Card } from "../../_shared/demo";

const STEPS = [
  { title: "Compte", description: "Identifiants" },
  { title: "Entreprise", description: "Raison sociale, ICE" },
  { title: "Équipe", description: "Facultatif" },
  { title: "Confirmation", description: "Récapitulatif" },
];

const meta = {
  title: "Composants/Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    registry: "stepper",
    docs: {
      description: {
        component:
          "Indique où en est l'utilisateur dans un parcours en plusieurs étapes (création de compte, tunnel de commande, configuration). Liste ordonnée : pastille de 28 px (numéro, anneau primaire en cours, coche qui jaillit en ressort une fois terminée), connecteurs qui se remplissent, `aria-current=\"step\"` sur l'étape en cours. Composition : `Stepper` > `Step` > `StepTitle` / `StepDescription` (indicateur et connecteur ajoutés d'office). Le hook `useStepper` fournit `next`, `prev`, `goTo`, `isFirst`, `isLast`.",
      },
    },
  },
  args: { activeStep: 1, orientation: "horizontal", nonLinear: false },
  argTypes: {
    activeStep: { control: { type: "number", min: 0, max: STEPS.length } },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    nonLinear: { control: "boolean" },
    onStepChange: { table: { disable: true } },
    labels: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ maxWidth: 760 }}>
      <Stepper {...args}>
        {STEPS.map((step) => (
          <Step key={step.title}>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Step>
        ))}
      </Stepper>
    </div>
  ),
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `activeStep` à `STEPS.length` : toutes les étapes sont terminées. */
export const Playground: Story = {};

/* ── Formulaire en plusieurs étapes ──────────────────────────────────── */

const FORM_STEPS = ["Compte", "Entreprise", "Confirmation"];

function FormulaireDemo() {
  const stepper = useStepper({ count: FORM_STEPS.length });
  const [values, setValues] = React.useState({ email: "", societe: "", ice: "" });
  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: event.target.value });

  return (
    <Card width={600}>
      <Stepper activeStep={stepper.activeStep} aria-label="Création du compte">
        {FORM_STEPS.map((title) => (
          <Step key={title}>
            <StepTitle>{title}</StepTitle>
          </Step>
        ))}
      </Stepper>

      {stepper.activeStep === 0 && (
        <Field label="Adresse e-mail professionnelle" hint="Elle servira d'identifiant." required>
          <Input type="email" placeholder="prenom.nom@entreprise.ma" value={values.email} onChange={set("email")} />
        </Field>
      )}
      {stepper.activeStep === 1 && (
        <>
          <Field label="Raison sociale" required>
            <Input placeholder="Atlas Distribution SARL" value={values.societe} onChange={set("societe")} />
          </Field>
          <Field label="ICE" hint="Identifiant commun de l'entreprise, 15 chiffres.">
            <Input inputMode="numeric" placeholder="001234567000089" value={values.ice} onChange={set("ice")} />
          </Field>
        </>
      )}
      {stepper.activeStep === 2 && (
        <Text as="p" tone="muted" style={{ margin: 0 }}>
          Vérifiez vos informations : {values.email || "e-mail non renseigné"}, {values.societe || "raison sociale non renseignée"}.
        </Text>
      )}
      {stepper.isComplete && (
        <Text as="p" style={{ margin: 0 }}>
          Compte créé. Un lien de confirmation vient d'être envoyé.
        </Text>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {stepper.isComplete ? (
          <Button variant="outline" onClick={stepper.reset}>Recommencer</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={stepper.prev} disabled={stepper.isFirst}>Précédent</Button>
            <Button onClick={stepper.next}>{stepper.isLast ? "Créer le compte" : "Suivant"}</Button>
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * Parcours piloté par `useStepper` : le contenu de l'étape s'affiche sous le
 * Stepper, les boutons appellent `prev` / `next`. Après la dernière étape,
 * `isComplete` passe à vrai et toutes les pastilles sont cochées.
 */
export const Formulaire: Story = {
  name: "Formulaire en plusieurs étapes",
  render: () => <FormulaireDemo />,
};

/* ── Vertical ───────────────────────────────────────────────────────── */

const VERTICAL_STEPS = [
  { title: "Choisir une offre", description: "Essentiel, Pro ou Entreprise", body: "Toutes les offres incluent 30 jours d'essai, sans engagement." },
  { title: "Inviter l'équipe", description: "Facultatif", body: "Ajoutez vos collaborateurs maintenant ou plus tard depuis les paramètres." },
  { title: "Importer les données", description: "Clients, articles, factures", body: "Fichiers CSV ou Excel ; les colonnes sont reconnues automatiquement." },
];

function VerticalDemo() {
  const stepper = useStepper({ count: VERTICAL_STEPS.length });
  return (
    <div style={{ maxWidth: 480 }}>
      <Stepper activeStep={stepper.activeStep} orientation="vertical" aria-label="Mise en route">
        {VERTICAL_STEPS.map((step) => (
          <Step key={step.title}>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
            <StepContent>
              <p style={{ margin: "0 0 14px" }}>{step.body}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" onClick={stepper.next}>{stepper.isLast ? "Terminer" : "Continuer"}</Button>
                <Button size="sm" variant="ghost" onClick={stepper.prev} disabled={stepper.isFirst}>Retour</Button>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {stepper.isComplete && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Text tone="muted">Tout est prêt.</Text>
          <Button size="sm" variant="outline" onClick={stepper.reset}>Recommencer</Button>
        </div>
      )}
    </div>
  );
}

/**
 * Étapes empilées : `StepContent` s'affiche sous l'étape active, à côté du
 * connecteur vertical. Idéal sur mobile et pour les parcours aux étapes longues.
 */
export const Vertical: Story = {
  render: () => <VerticalDemo />,
};

/* ── Non linéaire ───────────────────────────────────────────────────── */

function NonLineaireDemo() {
  const [active, setActive] = React.useState(0);
  const [done, setDone] = React.useState<Set<number>>(() => new Set([2]));
  const toggleDone = () =>
    setDone((previous) => {
      const next = new Set(previous);
      if (next.has(active)) next.delete(active);
      else next.add(active);
      return next;
    });

  return (
    <Card width={720}>
      <Stepper nonLinear activeStep={active} onStepChange={setActive} aria-label="Paramètres de la boutique">
        {["Général", "Paiements", "Livraison", "Taxes"].map((title, index) => (
          <Step key={title} completed={done.has(index)} disabled={index === 3}>
            <StepTitle>{title}</StepTitle>
            {index === 3 && <StepDescription>Bientôt</StepDescription>}
          </Step>
        ))}
      </Stepper>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Text tone="muted" style={{ flex: 1 }}>
          Les sections se remplissent dans l'ordre voulu ; une étape cochée le reste.
        </Text>
        <Button variant="tonal" size="sm" onClick={toggleDone}>
          {done.has(active) ? "Rouvrir l'étape" : "Marquer comme terminée"}
        </Button>
      </div>
    </Card>
  );
}

/**
 * `nonLinear` : chaque étape devient un bouton (pilule avec couche d'état),
 * `onStepChange` reçoit l'index cliqué. `completed` fixe l'état terminé
 * indépendamment de l'ordre, `disabled` rend une étape inaccessible.
 */
export const NonLineaire: Story = {
  name: "Non linéaire",
  render: () => <NonLineaireDemo />,
};

/**
 * `error` sur une étape : pastille et texte en rouge, état annoncé aux
 * lecteurs d'écran. La description porte le message.
 */
export const Erreur: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40, maxWidth: 760 }}>
      <Stepper activeStep={2} aria-label="Déclaration de TVA">
        <Step><StepTitle>Période</StepTitle><StepDescription>T3 2026</StepDescription></Step>
        <Step error><StepTitle>Identification</StepTitle><StepDescription>Numéro de TVA invalide</StepDescription></Step>
        <Step><StepTitle>Montants</StepTitle></Step>
        <Step><StepTitle>Envoi</StepTitle></Step>
      </Stepper>
      <div style={{ maxWidth: 420 }}>
        <Stepper activeStep={1} orientation="vertical" aria-label="Import de fichiers">
          <Step><StepTitle>Fichier déposé</StepTitle><StepDescription>clients-2026.csv</StepDescription></Step>
          <Step error>
            <StepTitle>Vérification des colonnes</StepTitle>
            <StepDescription>Colonne « ICE » introuvable</StepDescription>
            <StepContent>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="outline">Associer les colonnes</Button>
                <Button size="sm" variant="ghost">Changer de fichier</Button>
              </div>
            </StepContent>
          </Step>
          <Step><StepTitle>Import</StepTitle></Step>
        </Stepper>
      </div>
    </div>
  ),
};

/**
 * `StepIndicator` accepte une icône à la place du numéro ; la coche la
 * remplace toujours une fois l'étape terminée.
 */
export const Icones: Story = {
  name: "Icônes",
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <Stepper activeStep={2} aria-label="Suivi de commande">
        {[
          { title: "Panier", icon: <ShoppingBag /> },
          { title: "Paiement", icon: <CreditCard /> },
          { title: "Expédition", icon: <Truck /> },
          { title: "Livrée", icon: <PackageCheck /> },
        ].map((step) => (
          <Step key={step.title}>
            <StepIndicator>{step.icon}</StepIndicator>
            <StepTitle>{step.title}</StepTitle>
          </Step>
        ))}
      </Stepper>
    </div>
  ),
};
