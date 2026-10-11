import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Switch } from "@acme/ui";
import type { AccordionProps } from "@acme/ui";
import { Card } from "../../_shared/demo";
import { CloudIcon, LockIcon, UsersIcon } from "../../_shared/icons";

const QUESTIONS = [
  {
    value: "stockage",
    title: "Combien d'espace de stockage est inclus ?",
    body: "Chaque compte dispose de 15 Go partagés entre les fichiers, les photos et les e-mails. Vous pouvez passer à 100 Go à tout moment.",
  },
  {
    value: "partage",
    title: "Comment partager un dossier ?",
    body: "Ouvrez le menu du dossier, choisissez « Partager », puis invitez par adresse e-mail ou copiez un lien d'accès.",
  },
  {
    value: "hors-ligne",
    title: "Puis-je travailler hors ligne ?",
    body: "Oui : marquez un fichier « Disponible hors ligne ». Les modifications sont synchronisées dès le retour du réseau.",
  },
];

const Items = () => (
  <>
    {QUESTIONS.map((q) => (
      <AccordionItem key={q.value} value={q.value}>
        <AccordionTrigger>{q.title}</AccordionTrigger>
        <AccordionContent>{q.body}</AccordionContent>
      </AccordionItem>
    ))}
  </>
);

const meta = {
  title: "Composants/Mise en page/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Empile des sections repliables (FAQ, réglages, détails). `type=\"single\"` n'ouvre qu'un panneau à la fois, `type=\"multiple\"` en ouvre plusieurs. `inset` (défaut) est la liste groupée d'iOS : carte tonale, filets décalés ; `plain` se pose sur un panneau avec des filets fins. Pour une seule zone repliable, préférer `Collapsible`.",
      },
    },
  },
  args: { type: "single", collapsible: true, variant: "inset" },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    variant: { control: "inline-radio", options: ["inset", "plain"] },
    collapsible: { control: "boolean", if: { arg: "type", eq: "single" } },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Accordion {...(args as AccordionProps)}>
        <Items />
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * `inset` : carte tonale `--ui-card-2` au rayon `--ui-r-lg`, filets décalés comme la
 * liste groupée. `plain` : filets fins pleine largeur, posé sur un panneau blanc.
 */
export const Variantes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32, maxWidth: 520 }}>
      <Accordion type="single" collapsible defaultValue="stockage">
        <Items />
      </Accordion>
      <Card width={520}>
        <Accordion type="single" collapsible variant="plain" defaultValue="partage">
          <Items />
        </Accordion>
      </Card>
    </div>
  ),
};

/**
 * `single` + `collapsible` : un seul panneau ouvert, refermable. `multiple` : chaque
 * panneau est indépendant, `defaultValue` devient un tableau.
 */
export const Comportement: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32, maxWidth: 520 }}>
      <Accordion type="single" collapsible>
        <Items />
      </Accordion>
      <Accordion type="multiple" defaultValue={["stockage", "hors-ligne"]}>
        <Items />
      </Accordion>
    </div>
  ),
};

/** Un élément `disabled` reste lisible mais n'est plus atteignable au clavier. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="single" collapsible>
        <AccordionItem value="compte">
          <AccordionTrigger>Compte personnel</AccordionTrigger>
          <AccordionContent>Adresse, mot de passe et appareils connectés.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="organisation" disabled>
          <AccordionTrigger>Organisation (réservé aux administrateurs)</AccordionTrigger>
          <AccordionContent>Règles de partage de l'organisation.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * `leading` pose une icône avant le titre ; `headingLevel` accorde le titre à la
 * structure de la page (`h3` par défaut). Le contenu accueille n'importe quel composant.
 */
export const Composition: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="multiple" defaultValue={["sync"]}>
        <AccordionItem value="sync">
          <AccordionTrigger leading={<CloudIcon />} headingLevel={2}>Synchronisation</AccordionTrigger>
          <AccordionContent>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              Synchroniser les photos
              <Switch defaultChecked />
            </label>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="partage">
          <AccordionTrigger leading={<UsersIcon />} headingLevel={2}>Partage</AccordionTrigger>
          <AccordionContent>Les nouveaux dossiers sont privés par défaut.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="securite">
          <AccordionTrigger leading={<LockIcon />} headingLevel={2}>Sécurité</AccordionTrigger>
          <AccordionContent>Validation en deux étapes activée.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
