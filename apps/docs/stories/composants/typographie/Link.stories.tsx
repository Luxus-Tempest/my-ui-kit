import type { Meta, StoryObj } from "@storybook/react";
import { Link, Text } from "@rovia/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Typographie/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    registry: "typography",
    docs: {
      description: {
        component:
          "Lien de contenu, encre primaire, souligné au survol. `external` ouvre un nouvel onglet (avec `rel` sûr) et l'annonce par une icône ; `variant=\"subtle\"` garde la couleur du texte (mentions légales, pied de page). `asChild` pour le `<Link>` d'un routeur. Pour une action, utiliser `Button variant=\"link\"`.",
      },
    },
  },
  args: { children: "Voir l'historique", href: "#historique", variant: "inline", external: false },
  argTypes: { variant: { control: "inline-radio", options: ["inline", "subtle"] } },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variantes: Story = {
  render: () => (
    <Row>
      <Link href="#historique">Voir l'historique</Link>
      <Link href="https://www.dgi.gov.ma" external>Portail de la DGI</Link>
      <Link href="#cgv" variant="subtle">Conditions générales</Link>
    </Row>
  ),
};

/** Dans un paragraphe, le lien hérite du corps de texte. */
export const DansUnTexte: Story = {
  name: "Dans un texte",
  render: () => (
    <Text as="p" style={{ maxWidth: 480 }}>
      Votre déclaration est prête. Vérifiez-la puis déposez-la sur le{" "}
      <Link href="https://www.dgi.gov.ma" external>portail de la DGI</Link> avant le 31 octobre.
    </Text>
  ),
};
