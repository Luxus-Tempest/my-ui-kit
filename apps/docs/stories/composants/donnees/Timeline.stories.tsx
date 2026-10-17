import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineGroup,
  TimelineIndicator,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@rovia/ui";
import {
  CircleCheck,
  CircleX,
  FileSpreadsheet,
  Flag,
  MessageSquare,
  Pencil,
  Rocket,
  Share2,
  TriangleAlert,
  Upload,
  UserPlus,
} from "lucide-react";
import { Card } from "../../_shared/demo";

/** Aperçu de fichier glissé dans un évènement (contenu libre de TimelineContent). */
const FileChip = ({ name }: { name: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      width: "fit-content",
      padding: "6px 12px 6px 8px",
      border: "1px solid var(--ui-line)",
      borderRadius: "var(--ui-r-sm)",
      color: "var(--ui-fg)",
      fontSize: 13,
      fontWeight: 500,
    }}
  >
    <FileSpreadsheet size={16} color="var(--ui-c3)" aria-hidden="true" />
    {name}
  </span>
);

function ActivityFeed({ align }: { align?: "left" | "alternate" }) {
  return (
    <Timeline align={align} aria-label="Activité">
      <TimelineGroup label="Aujourd'hui">
        <TimelineItem>
          <TimelineIndicator tone="pri">
            <Pencil />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>
              <strong>Inès Benali</strong> a modifié <strong>Budget 2027</strong>
            </TimelineTitle>
            <TimelineDescription>12 cellules mises à jour dans l'onglet « Charges ».</TimelineDescription>
            <TimelineTime dateTime="2026-10-11T09:12">09:12</TimelineTime>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator>
            <MessageSquare />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>
              <strong>Karim Alaoui</strong> a commenté <strong>Budget 2027</strong>
            </TimelineTitle>
            <TimelineDescription>« Peut-on revoir la ligne marketing avant jeudi ? »</TimelineDescription>
            <TimelineTime dateTime="2026-10-11T08:47">08:47</TimelineTime>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="err" label="Échec">
            <CircleX />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>La synchronisation de <strong>Photos</strong> a échoué</TimelineTitle>
            <TimelineDescription>Espace de stockage insuffisant sur l'appareil.</TimelineDescription>
            <TimelineTime dateTime="2026-10-11T07:30">07:30</TimelineTime>
          </TimelineContent>
        </TimelineItem>
      </TimelineGroup>
      <TimelineGroup label="Hier">
        <TimelineItem>
          <TimelineIndicator>
            <Upload />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>
              <strong>Fatima Zahra</strong> a importé un fichier
            </TimelineTitle>
            <FileChip name="Prévisions T4.xlsx" />
            <TimelineTime dateTime="2026-10-10T17:05">17:05</TimelineTime>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="ok" label="Partagé">
            <Share2 />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>
              <strong>Vous</strong> avez partagé <strong>Finance</strong> avec l'équipe Direction
            </TimelineTitle>
            <TimelineTime dateTime="2026-10-10T11:20">11:20</TimelineTime>
          </TimelineContent>
        </TimelineItem>
      </TimelineGroup>
    </Timeline>
  );
}

const meta = {
  title: "Composants/Données/Timeline",
  component: Timeline,
  subcomponents: {
    TimelineGroup,
    TimelineItem,
    TimelineIndicator,
    TimelineContent,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
  },
  tags: ["autodocs"],
  parameters: {
    registry: "timeline",
    docs: {
      description: {
        component:
          "Fil d'activité, comme le panneau « Activité » de Drive : évènements reliés par un connecteur vertical, regroupés par date (`TimelineGroup`). L'indicateur est un point ou une pastille (icône, avatar) ; `tone` (`neu`, `pri`, `ok`, `warn`, `err`) est un état, à doubler d'un mot ou d'un `label`. `align=\"alternate\"` centre l'axe et place l'heure en vis-à-vis.",
      },
    },
  },
  args: { align: "left" },
  argTypes: { align: { control: "inline-radio", options: ["left", "alternate"] } },
  render: (args) => (
    <Card width={args.align === "alternate" ? 720 : 440}>
      <ActivityFeed align={args.align} />
    </Card>
  ),
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * Les membres d'un espace partagé : l'avatar prend la place de la pastille,
 * détouré comme elle. Contenu libre sous le titre (aperçu de fichier).
 */
export const FilDActivite: Story = {
  name: "Fil d'activité (avatars)",
  render: () => (
    <Card width={440}>
      <Timeline aria-label="Activité du dossier Finance">
        <TimelineGroup label="Aujourd'hui">
          {[
            { name: "Inès Benali", action: "a modifié", file: "Budget 2027", time: "09:12" },
            { name: "Karim Alaoui", action: "a renommé", file: "Prévisions T4", time: "08:40" },
            { name: "Fatima Zahra El Idrissi", action: "a ouvert", file: "Rapport annuel", time: "08:02" },
          ].map((e) => (
            <TimelineItem key={e.time}>
              <TimelineIndicator>
                <Avatar size="sm">
                  <AvatarFallback name={e.name} />
                </Avatar>
              </TimelineIndicator>
              <TimelineContent>
                <TimelineTitle>
                  <strong>{e.name}</strong> {e.action} <strong>{e.file}</strong>
                </TimelineTitle>
                <TimelineTime dateTime={`2026-10-11T${e.time}`}>{e.time}</TimelineTime>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineGroup>
        <TimelineGroup label="Hier">
          <TimelineItem>
            <TimelineIndicator>
              <Avatar size="sm">
                <AvatarFallback name="Karim Alaoui" />
              </Avatar>
            </TimelineIndicator>
            <TimelineContent>
              <TimelineTitle>
                <strong>Karim Alaoui</strong> a ajouté un fichier
              </TimelineTitle>
              <FileChip name="Ventes par région.xlsx" />
              <TimelineTime dateTime="2026-10-10T16:30">16:30</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        </TimelineGroup>
      </Timeline>
    </Card>
  ),
};

/**
 * Point (sans enfant) ou pastille de 28 px ; `soft` (défaut) ou `solid` pour
 * l'évènement à mettre en avant. Les tons de statut sont réservés à l'état et
 * toujours doublés d'un mot (`label` annoncé, ou titre explicite).
 */
export const Indicateurs: Story = {
  render: () => (
    <Card width={440}>
      <Timeline aria-label="Tons et formes">
        <TimelineItem>
          <TimelineIndicator />
          <TimelineContent>
            <TimelineTitle>Point neutre : activité courante</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="pri">
            <UserPlus />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Primaire : accès accordé à Nadia</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="ok" label="Validé">
            <CircleCheck />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Succès : facture F-2026-118 validée</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="warn" label="En attente">
            <TriangleAlert />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Attention : signature en attente depuis 3 jours</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="err" label="Échec">
            <CircleX />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Erreur : paiement refusé</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="pri" variant="solid">
            <Rocket />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Pastille pleine : mise en production</TimelineTitle>
            <TimelineDescription>Réservée à l'évènement qui compte.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </Card>
  ),
};

/**
 * Axe central, contenu alterné de part et d'autre, heure en vis-à-vis.
 * Sous 480 px de large, le fil revient à gauche (requête de conteneur).
 */
export const Alterne: Story = {
  name: "Alterné",
  render: () => (
    <Card width={720}>
      <Timeline align="alternate" aria-label="Jalons du projet">
        <TimelineGroup label="2026">
          {[
            { title: "Cadrage validé", text: "Périmètre, budget et équipe arrêtés.", date: "2026-03-02", label: "2 mars", tone: "ok" as const, icon: <CircleCheck /> },
            { title: "Maquettes livrées", text: "Parcours de création et de partage.", date: "2026-05-18", label: "18 mai", tone: "neu" as const, icon: <Pencil /> },
            { title: "Bêta privée", text: "120 comptes pilotes, 4 retours bloquants.", date: "2026-07-07", label: "7 juillet", tone: "warn" as const, icon: <Flag /> },
            { title: "Lancement public", text: "Ouverture à tous les clients.", date: "2026-10-01", label: "1er octobre", tone: "pri" as const, icon: <Rocket /> },
          ].map((m) => (
            <TimelineItem key={m.date}>
              <TimelineIndicator tone={m.tone} variant={m.tone === "pri" ? "solid" : "soft"}>
                {m.icon}
              </TimelineIndicator>
              <TimelineContent>
                <TimelineTitle>
                  <strong>{m.title}</strong>
                </TimelineTitle>
                <TimelineDescription>{m.text}</TimelineDescription>
                <TimelineTime dateTime={m.date}>{m.label}</TimelineTime>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineGroup>
      </Timeline>
    </Card>
  ),
};

/**
 * Posé sur une surface tonale, le fil reçoit la couleur de son fond par
 * `--ui-timeline-surface` : l'anneau des indicateurs se fond dans la carte.
 */
export const SurUneCarte: Story = {
  name: "Sur une carte tonale",
  render: () => (
    <div
      style={
        {
          maxWidth: 440,
          padding: 20,
          borderRadius: "var(--ui-r-lg)",
          background: "var(--ui-card-2)",
          "--ui-timeline-surface": "var(--ui-card-2)",
        } as React.CSSProperties
      }
    >
      <ActivityFeed />
    </div>
  ),
};
