import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Link,
  ListItemIcon,
  Text,
} from "@acme/ui";
import { CalendarDays, Clock, FileSpreadsheet, MapPin, Users } from "lucide-react";
import { Row } from "../../_shared/demo";

// Portrait de démonstration (données, pas un jeton de style).
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#f3d9c9'/><circle cx='32' cy='25' r='11' fill='#b9775a'/><path d='M12 60c2-12 10-18 20-18s18 6 20 18' fill='#b9775a'/></svg>`,
  );

const metaLine: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6 };

const Profil = () => (
  <>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar size="lg">
        <AvatarImage src={photo} alt="" />
        <AvatarFallback name="Inès Benali" />
        <AvatarBadge label="En ligne" />
      </Avatar>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <Text weight="semibold">Inès Benali</Text>
        <Text size={13} tone="muted">Responsable financière</Text>
      </div>
    </div>
    <Text as="p" size={13} style={{ margin: 0 }}>
      Pilote le budget 2027 et la clôture trimestrielle de la région Casablanca-Settat.
    </Text>
    <div style={{ display: "grid", gap: 6, color: "var(--ui-fg-3)", fontSize: 12.5 }}>
      <span style={metaLine}><MapPin size={14} aria-hidden />Casablanca · 16:42, heure locale</span>
      <span style={metaLine}><CalendarDays size={14} aria-hidden />Dans l'équipe depuis mars 2021</span>
    </div>
  </>
);

const HoverCardDemo = (args: React.ComponentProps<typeof HoverCard>) => (
  <div style={{ minHeight: 260 }}>
    <Text as="p" style={{ margin: 0 }}>
      Dernière modification par{" "}
      <HoverCard {...args}>
        <HoverCardTrigger asChild>
          <Link href="#ines">Inès Benali</Link>
        </HoverCardTrigger>
        <HoverCardContent align="start">
          <Profil />
        </HoverCardContent>
      </HoverCard>
      , il y a 12 minutes.
    </Text>
  </div>
);

const meta = {
  title: "Composants/Surcouches/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Aperçu au survol d'un nom ou d'un lien : profil, résumé d'un document. S'ouvre après un court délai (500 ms) au survol ou au focus clavier, se referme quand le pointeur s'éloigne (250 ms) ou avec Échap. Surface en matériau translucide, flèche optionnelle.\n\n**Le contenu ne doit jamais être indispensable** : il est inaccessible au tactile (aucun survol) et le focus n'y entre pas. Ce qu'il montre doit exister ailleurs (la page du lien) ; pour un contenu interactif ou nécessaire, choisir `Popover`.",
      },
    },
  },
  args: { openDelay: 500, closeDelay: 250 },
  argTypes: {
    openDelay: { control: { type: "number", step: 50 } },
    closeDelay: { control: { type: "number", step: 50 } },
    open: { control: false },
    defaultOpen: { control: false },
  },
  render: (args) => <HoverCardDemo {...args} />,
} satisfies Meta<typeof HoverCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Survolez ou atteignez le nom au clavier (Tab). */
export const Playground: Story = {};

/** Aperçu d'un document derrière un lien : ce qu'on y trouverait, sans l'ouvrir. */
export const ApercuDeLien: Story = {
  name: "Aperçu de lien",
  render: () => (
    <div style={{ minHeight: 240 }}>
      <Text as="p" style={{ margin: 0 }}>
        Les chiffres sont dans{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link href="#budget">Budget 2027.xlsx</Link>
          </HoverCardTrigger>
          <HoverCardContent align="start">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ListItemIcon tint="var(--ui-c3)"><FileSpreadsheet /></ListItemIcon>
              <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <Text weight="semibold" truncate>Budget 2027.xlsx</Text>
                <Text size={12.5} tone="subtle">Feuille de calcul · 284 Ko</Text>
              </div>
            </div>
            <div style={{ display: "grid", gap: 6, color: "var(--ui-fg-3)", fontSize: 12.5 }}>
              <span style={metaLine}><Clock size={14} aria-hidden />Modifié aujourd'hui à 09:12 par Inès</span>
              <span style={metaLine}><Users size={14} aria-hidden />Partagé avec 6 personnes</span>
            </div>
          </HoverCardContent>
        </HoverCard>
        , onglet « Synthèse ».
      </Text>
    </div>
  ),
};

/** La carte se place du côté demandé s'il y a la place ; `arrow` la relie au déclencheur. */
export const CotesEtFleche: Story = {
  name: "Côtés et flèche",
  render: () => (
    <div style={{ display: "grid", placeItems: "center", minHeight: 360 }}>
      <Row>
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <HoverCard key={side} openDelay={200}>
            <HoverCardTrigger asChild>
              <Button variant="outline">{{ top: "Haut", right: "Droite", bottom: "Bas", left: "Gauche" }[side]}</Button>
            </HoverCardTrigger>
            <HoverCardContent side={side} arrow style={{ width: 220 }}>
              <Text size={13}>Aperçu placé {{ top: "au-dessus", right: "à droite", bottom: "en dessous", left: "à gauche" }[side]}.</Text>
            </HoverCardContent>
          </HoverCard>
        ))}
      </Row>
    </div>
  ),
};

/**
 * `openDelay` évite les ouvertures au simple passage du pointeur ; `closeDelay` laisse
 * le temps de rejoindre la carte. Trop court, la page clignote ; trop long, l'aperçu semble lent.
 */
export const Delais: Story = {
  name: "Délais",
  render: () => (
    <div style={{ minHeight: 240 }}>
      <Row label="Immédiat · 0 ms">
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild><Link href="#ines">Inès Benali</Link></HoverCardTrigger>
          <HoverCardContent align="start"><Profil /></HoverCardContent>
        </HoverCard>
      </Row>
      <Row label="Par défaut · 500 ms">
        <HoverCard>
          <HoverCardTrigger asChild><Link href="#ines">Inès Benali</Link></HoverCardTrigger>
          <HoverCardContent align="start"><Profil /></HoverCardContent>
        </HoverCard>
      </Row>
      <Row label="Lent · 1 000 ms">
        <HoverCard openDelay={1000}>
          <HoverCardTrigger asChild><Link href="#ines">Inès Benali</Link></HoverCardTrigger>
          <HoverCardContent align="start"><Profil /></HoverCardContent>
        </HoverCard>
      </Row>
    </div>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: () => (
    <div style={{ minHeight: 280 }}>
      <Text as="p" style={{ margin: 0 }}>
        Dernière modification par{" "}
        <HoverCard defaultOpen>
          <HoverCardTrigger asChild>
            <Link href="#ines">Inès Benali</Link>
          </HoverCardTrigger>
          <HoverCardContent align="start" arrow>
            <Profil />
          </HoverCardContent>
        </HoverCard>
        , il y a 12 minutes.
      </Text>
    </div>
  ),
};
