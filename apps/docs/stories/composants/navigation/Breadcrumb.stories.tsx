import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@acme/ui";
import { Row } from "../../_shared/demo";
import { ChevronDownIcon, FolderIcon, HomeIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Situe la page dans une hiérarchie et permet d'y remonter. Chaque niveau parent est une pilule avec couche d'état au survol ; l'élément courant porte `aria-current=\"page\"`. `size=\"lg\"` donne le chemin-titre de Drive (« Mon Drive › Projets › 2026 »). `BreadcrumbLink asChild` accepte le `Link` d'un routeur.",
      },
    },
  },
  args: { size: "default", label: "Fil d'Ariane" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "lg"] },
    label: { control: "text" },
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#mon-drive">Mon Drive</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#projets">Projets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>2026</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * `default` (14 px) au-dessus d'un contenu ; `lg` (22 px / 400) comme titre de page,
 * à la manière de l'en-tête de Drive.
 */
export const Tailles: Story = {
  render: () => (
    <>
      {(["default", "lg"] as const).map((size) => (
        <Row key={size} label={size === "lg" ? "lg · 22" : "default · 14"}>
          <Breadcrumb size={size} label={`Fil d'Ariane (${size})`}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#mon-drive">Mon Drive</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#projets">Projets</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>2026</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Row>
      ))}
    </>
  ),
};

/**
 * Chemin profond : `BreadcrumbEllipsis` remplace les niveaux intermédiaires. Posé dans un
 * bouton qui ouvre un `Menu`, son texte masqué (« Plus de niveaux ») nomme le bouton.
 */
export const NiveauxReplies: Story = {
  name: "Niveaux repliés",
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#mon-drive">Mon Drive</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Plus de niveaux">
                <BreadcrumbEllipsis />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Clients</MenuItem>
              <MenuItem>Acme</MenuItem>
              <MenuItem>Projets</MenuItem>
            </MenuContent>
          </Menu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#livrables">Livrables</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Maquettes finales</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/**
 * Composition : icône dans un niveau, séparateur personnalisé (`children`), menu
 * d'actions sur l'élément courant comme le « Projets ▾ » de Drive, et lien de routeur
 * via `asChild`.
 */
export const Composition: Story = {
  render: () => (
    <>
      <Row label="Icône">
        <Breadcrumb label="Emplacement">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#accueil"><HomeIcon />Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#partages"><FolderIcon />Partagés avec moi</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Rapport annuel</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
      <Row label="Menu courant">
        <Breadcrumb size="lg" label="Chemin du dossier">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#mon-drive">Mon Drive</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Menu>
                <MenuTrigger asChild>
                  <BreadcrumbLink asChild>
                    <button type="button" aria-current="page" style={{ border: 0, background: "none", font: "inherit" }}>
                      Projets
                      <ChevronDownIcon />
                    </button>
                  </BreadcrumbLink>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem>Nouveau dossier</MenuItem>
                  <MenuItem>Renommer</MenuItem>
                  <MenuItem>Partager</MenuItem>
                </MenuContent>
              </Menu>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
      <Row label="asChild">
        <Breadcrumb label="Fil d'Ariane du routeur">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                {/* Dans une application : <Link to="/parametres"> de React Router, de Next… */}
                <a href="#parametres">Paramètres</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Row>
    </>
  ),
};
