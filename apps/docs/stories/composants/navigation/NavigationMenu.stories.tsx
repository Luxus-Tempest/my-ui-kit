import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  type NavigationMenuProps,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@rovia/ui";
import {
  BookOpen,
  ChartColumn,
  FileSpreadsheet,
  HardDrive,
  LifeBuoy,
  Receipt,
  Rocket,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

/** Tuile mise en avant d'un panneau : grand lien sur le bandeau de marque. */
const Featured = () => (
  <NavigationMenuLink
    href="#plateforme"
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      gap: 6,
      height: "100%",
      minHeight: 200,
      padding: 20,
      borderRadius: "var(--ui-r-lg)",
      background: "var(--ui-brand-wash)",
      color: "#fff",
    }}
  >
    <Rocket size={22} aria-hidden />
    <span style={{ font: "600 17px/1.25 var(--ui-font-sans)", letterSpacing: "-0.01em" }}>La plateforme Acme</span>
    <span style={{ font: "400 13px/1.4 var(--ui-font-sans)", color: "rgb(255 255 255 / .78)" }}>
      Gestion, comptabilité et documents réunis dans un seul espace.
    </span>
  </NavigationMenuLink>
);

function SiteNav(props: NavigationMenuProps) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="produits">
          <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ display: "grid", gridTemplateColumns: "220px auto", gap: 8 }}>
              <Featured />
              <NavigationMenuGrid columns={2}>
                <NavigationMenuLink href="#drive" icon={<HardDrive />} description="Stockez, partagez et retrouvez tous vos fichiers.">
                  Drive
                </NavigationMenuLink>
                <NavigationMenuLink href="#facturation" icon={<Receipt />} description="Devis, factures et relances en quelques clics.">
                  Facturation
                </NavigationMenuLink>
                <NavigationMenuLink href="#tresorerie" icon={<Wallet />} description="Rapprochement bancaire et prévisions.">
                  Trésorerie
                </NavigationMenuLink>
                <NavigationMenuLink href="#tableaux" icon={<FileSpreadsheet />} description="Tableaux de bord partagés, à jour en temps réel.">
                  Tableaux
                </NavigationMenuLink>
              </NavigationMenuGrid>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="solutions">
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid columns={2}>
              <NavigationMenuLink href="#pme" icon={<Users />} description="Tout pour piloter une équipe de 5 à 50 personnes.">
                PME
              </NavigationMenuLink>
              <NavigationMenuLink href="#cabinets" icon={<ChartColumn />} description="Portefeuille clients, liasses et déclarations.">
                Cabinets comptables
              </NavigationMenuLink>
              <NavigationMenuLink href="#automatisation" icon={<Workflow />} description="Règles, validations et flux d'approbation.">
                Automatisation
              </NavigationMenuLink>
              <NavigationMenuLink href="#support" icon={<LifeBuoy />} description="Un conseiller dédié, en français et en arabe.">
                Accompagnement
              </NavigationMenuLink>
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem value="ressources">
          <NavigationMenuTrigger>Ressources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid columns={1}>
              <NavigationMenuLink href="#guide" description="Configurer votre espace en dix minutes.">
                Guide de démarrage
              </NavigationMenuLink>
              <NavigationMenuLink href="#nouveautes" description="Ce qui a changé ce mois-ci.">
                Nouveautés
              </NavigationMenuLink>
              <NavigationMenuLink href="#api" description="Intégrez Acme à vos outils.">
                Documentation de l'API
              </NavigationMenuLink>
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink href="#tarifs" active className={navigationMenuTriggerStyle()}>
            Tarifs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#blog" className={navigationMenuTriggerStyle()}>
            <BookOpen aria-hidden />
            Blog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  );
}

const meta = {
  title: "Composants/Navigation/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  parameters: {
    registry: "navigation-menu",
    docs: {
      description: {
        component:
          "Navigation principale d'un site ou d'un produit : déclencheurs en pilule, panneaux déroulants riches (grille de liens titre + description, tuile d'icône) en matériau translucide. Le viewport commun change de taille en ressort et les panneaux glissent d'un menu à l'autre. `active` marque la page courante (`aria-current`, fond `--ui-sel`) ; `navigationMenuTriggerStyle()` donne l'allure d'un déclencheur à un lien simple ; `asChild` accueille le `Link` du routeur.",
      },
    },
  },
  args: { viewport: true, delayDuration: 200 },
  argTypes: {
    viewport: { control: "boolean" },
    delayDuration: { control: { type: "number", min: 0, step: 50 } },
    orientation: { table: { disable: true } },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    dir: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <SiteNav {...args} />
    </div>
  ),
} satisfies Meta<typeof NavigationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Survolez « Produits », puis passez à « Solutions » : le viewport s'ajuste en ressort. */
export const Playground: Story = {};

/** Dans un en-tête de site : logo, navigation, action à droite. */
export const EnTeteDeSite: Story = {
  name: "En-tête de site",
  render: () => (
    <div style={{ minHeight: 440 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          maxWidth: 1040,
          padding: "10px 16px",
          borderRadius: "var(--ui-r-pill)",
          background: "var(--ui-panel)",
        }}
      >
        <span style={{ font: "600 17px/1 var(--ui-font-sans)", letterSpacing: "-0.02em", color: "var(--ui-fg)", paddingLeft: 8 }}>
          Acme
        </span>
        <SiteNav />
      </header>
    </div>
  ),
};

/** `viewport={false}` : chaque panneau s'ouvre sous son propre déclencheur, sans surface commune. */
export const SansViewport: Story = {
  name: "Sans viewport",
  render: () => (
    <div style={{ minHeight: 420 }}>
      <SiteNav viewport={false} />
    </div>
  ),
};

/**
 * `asChild` : le lien du routeur (`Link` de Next.js, React Router…) reçoit
 * classes, état actif, titre, `description` et `icon`.
 */
export const AvecUnRouteur: Story = {
  name: "Avec un routeur (asChild)",
  render: () => (
    <div style={{ minHeight: 260 }}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid columns={1}>
                <NavigationMenuLink asChild active icon={<HardDrive />} description="Rendu par le Link du routeur, marqué page courante.">
                  <a href="#drive" data-router-link="">Drive</a>
                </NavigationMenuLink>
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <a href="#tarifs" data-router-link="">Tarifs</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: () => (
    <div style={{ minHeight: 440 }}>
      <SiteNav defaultValue="produits" />
    </div>
  ),
};
