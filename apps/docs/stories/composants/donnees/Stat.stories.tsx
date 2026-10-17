import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline, Stat, StatGroup } from "@rovia/ui";
import { Clock, Receipt, Users, Wallet } from "lucide-react";
import { Card, Row } from "../../_shared/demo";
import { REVENUE } from "../../_shared/data";

const MAD: Intl.NumberFormatOptions = { style: "currency", currency: "MAD", maximumFractionDigits: 0 };
const CA = REVENUE.map((r) => r.ca);
const CHARGES = REVENUE.map((r) => r.charges);
const CLIENTS = [52, 61, 58, 64, 70, 66, 73, 71, 78, 75, 80, 86];
const DELAIS = [41, 40, 38, 39, 36, 37, 35, 33, 34, 32, 31, 34];

const meta = {
  title: "Composants/Données/Stat",
  component: Stat,
  subcomponents: { StatGroup, Sparkline },
  tags: ["autodocs"],
  parameters: {
    registry: "stat",
    docs: {
      description: {
        component:
          "Tuile de chiffre clé. Contrat : `label` en casse de phrase sans deux-points ; `value` en 600 aux chiffres proportionnels, compactée en fr-FR à partir de 10 000 (« 12,9 k », « 4,2 M ») ; `delta` signé avec sa période, coloré selon le sens **et** `positiveIsGood`, toujours avec flèche et texte ; `trend` en `Sparkline` de 12 points, période courante en accent. `StatGroup` aligne les tuiles ; une seule tuile `size=\"hero\"` par vue.",
      },
    },
  },
  args: {
    label: "Chiffre d'affaires",
    value: CA[CA.length - 1],
    format: MAD,
    compact: "auto",
    delta: 0.124,
    deltaLabel: "vs mois dernier",
    positiveIsGood: true,
    trend: CA,
    size: "default",
    variant: "filled",
  },
  argTypes: {
    value: { control: "number" },
    delta: { control: { type: "number", step: 0.01 } },
    compact: { control: "inline-radio", options: ["auto", true, false] },
    size: { control: "inline-radio", options: ["default", "hero"] },
    variant: { control: "inline-radio", options: ["filled", "outlined", "plain"] },
    format: { control: false },
    deltaFormat: { control: false },
    trend: { control: false },
    icon: { control: false },
    labels: { control: false },
  },
  render: (args) => (
    <div style={{ maxWidth: args.size === "hero" ? 520 : 300 }}>
      <Stat {...args} />
    </div>
  ),
} satisfies Meta<typeof Stat>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * Quatre indicateurs en rangée : la grille passe à la ligne sous 220 px par
 * tuile. Une baisse des dépenses et un délai qui raccourcit sont de bonnes
 * nouvelles (`positiveIsGood={false}`).
 */
export const TableauDeBord: Story = {
  name: "Tableau de bord (StatGroup)",
  render: () => (
    <div style={{ maxWidth: 1080 }}>
      <StatGroup aria-label="Indicateurs du mois">
        <Stat
          label="Chiffre d'affaires"
          icon={<Wallet />}
          value={CA[CA.length - 1]!}
          format={MAD}
          delta={0.124}
          deltaLabel="vs mois dernier"
          trend={CA}
        />
        <Stat
          label="Dépenses"
          icon={<Receipt />}
          value={CHARGES[CHARGES.length - 1]!}
          format={MAD}
          delta={-0.046}
          deltaLabel="vs mois dernier"
          positiveIsGood={false}
          trend={CHARGES}
        />
        <Stat
          label="Nouveaux clients"
          icon={<Users />}
          value={86}
          delta={0.075}
          deltaLabel="vs mois dernier"
          trend={<Sparkline data={CLIENTS} variant="bars" height={36} period="mois" />}
        />
        <Stat
          label="Délai de paiement moyen"
          icon={<Clock />}
          value={34}
          format={{ style: "unit", unit: "day", unitDisplay: "long" }}
          delta={3}
          deltaFormat={{ style: "unit", unit: "day", unitDisplay: "long" }}
          deltaLabel="vs mois dernier"
          positiveIsGood={false}
          trend={DELAIS}
        />
      </StatGroup>
    </div>
  ),
};

/**
 * Le chiffre qui ouvre la vue : valeur à 52 px, tendance plus haute. Une seule
 * tuile héros par vue ; dans un `StatGroup`, elle s'étale sur deux colonnes
 * dès que la largeur le permet.
 */
export const Heros: Story = {
  name: "Tuile héros",
  render: () => (
    <div style={{ maxWidth: 1080 }}>
      <StatGroup>
        <Stat
          size="hero"
          label="Trésorerie disponible"
          value={4218300}
          format={MAD}
          delta={0.062}
          deltaLabel="vs fin septembre"
          trend={[3.61, 3.72, 3.68, 3.8, 3.77, 3.9, 3.86, 3.98, 4.02, 3.97, 4.1, 4.22].map((v) => v * 1_000_000)}
          trendPeriod="semaines"
        />
        <Stat label="Factures en attente" value={23} delta={-0.12} deltaLabel="vs semaine dernière" positiveIsGood={false} />
        <Stat label="Encaissements prévus" value={612000} format={MAD} deltaLabel="sur 30 jours" delta={0} />
      </StatGroup>
    </div>
  ),
};

/**
 * La couleur croise le sens et `positiveIsGood` ; la flèche et le signe
 * portent le sens, le lecteur d'écran entend « Hausse de 12,4 %, favorable ».
 * Une variation nulle reste neutre (« Stable »).
 */
export const Variation: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, maxWidth: 960 }}>
      <Stat label="Revenus · hausse favorable" value={128400} format={MAD} delta={0.124} deltaLabel="vs mois dernier" />
      <Stat label="Revenus · baisse défavorable" value={112900} format={MAD} delta={-0.087} deltaLabel="vs mois dernier" />
      <Stat label="Dépenses · baisse favorable" value={38200} format={MAD} delta={-0.046} deltaLabel="vs mois dernier" positiveIsGood={false} />
      <Stat label="Taux d'erreur · hausse défavorable" value={0.018} format={{ style: "percent", maximumFractionDigits: 1 }} delta={0.004} deltaFormat={{ style: "percent", maximumFractionDigits: 1 }} deltaLabel="vs hier" positiveIsGood={false} />
      <Stat label="Abonnés · stable" value={2140} delta={0} deltaLabel="vs semaine dernière" />
    </div>
  ),
};

/**
 * SVG pur : trait de 2 px dans une teinte effacée, lavis à 10 %, période
 * courante en accent, point final détouré de la couleur du fond. Courbe
 * `linear` (défaut) ou `smooth` (monotone), barres ; largeur fluide ou fixe.
 */
export const SparklineSeule: Story = {
  name: "Sparkline",
  render: () => (
    <Card width={520}>
      <Row label="Ligne">
        <Sparkline data={CA} width={160} period="mois" />
        <Sparkline data={CA} width={160} curve="smooth" period="mois" />
      </Row>
      <Row label="Barres">
        <Sparkline data={CLIENTS} width={160} variant="bars" period="mois" />
        <Sparkline data={[4, -2, 6, 3, -1, 5, 7, -3, 2, 6, 4, 8]} width={160} variant="bars" period="semaines" />
      </Row>
      <Row label="Accent">
        <Sparkline data={CHARGES} width={100} height={28} color="var(--ui-c2)" />
        <Sparkline data={CLIENTS} width={100} height={28} color="var(--ui-c3)" />
        <Sparkline data={DELAIS} width={100} height={28} color="var(--ui-c7)" />
      </Row>
      <Row label="Fluide">
        <div style={{ flex: 1 }}>
          <Sparkline data={CA} height={48} curve="smooth" label="Chiffre d'affaires en hausse de 18 % sur l'année" />
        </div>
      </Row>
    </Card>
  ),
};

/**
 * `filled` (défaut) : conteneur tonal. `outlined` : panneau à filet, pour les
 * tuiles posées sur le fond d'application. `plain` : sans surface, à
 * l'intérieur d'une carte existante.
 */
export const Surfaces: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
      <div style={{ width: 260 }}>
        <Stat label="filled" value={86} delta={0.075} deltaLabel="vs mois dernier" trend={CLIENTS} />
      </div>
      <div style={{ width: 260 }}>
        <Stat variant="outlined" label="outlined" value={86} delta={0.075} deltaLabel="vs mois dernier" trend={CLIENTS} />
      </div>
      <Card width={260}>
        <Stat variant="plain" label="plain, dans une carte" value={86} delta={0.075} deltaLabel="vs mois dernier" trend={CLIENTS} />
      </Card>
    </div>
  ),
};
