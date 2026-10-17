import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, Separator, Skeleton } from "@rovia/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Retour/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    registry: "skeleton",
    docs: {
      description: {
        component:
          "Gabarit de chargement qui annonce la forme du contenu à venir : un dégradé balayé, jamais un bloc qui clignote. Le conteneur porte `aria-busy` et un libellé ; les squelettes eux-mêmes sont décoratifs. Pour un rechargement, garder plutôt l'ancien contenu estompé.",
      },
    },
  },
  args: { circle: false, style: { width: 240, height: 12 } },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Une fiche en cours de chargement : avatar, titre, lignes de texte. */
export const Fiche: Story = {
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 380 }}>
      <CardContent>
        <div role="status" aria-busy="true" aria-label="Chargement du client">
          <Row>
            <Skeleton circle style={{ width: 40, height: 40 }} />
            <div style={{ display: "grid", gap: 8, flex: 1 }}>
              <Skeleton style={{ width: "60%", height: 12 }} />
              <Skeleton style={{ width: "40%", height: 10 }} />
            </div>
          </Row>
          <Separator style={{ margin: "4px 0 16px" }} />
          <div style={{ display: "grid", gap: 8 }}>
            <Skeleton style={{ height: 10 }} />
            <Skeleton style={{ height: 10, width: "92%" }} />
            <Skeleton style={{ height: 10, width: "70%" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};
