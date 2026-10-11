import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle, ScrollArea, Text } from "@acme/ui";

const meta = {
  title: "Composants/Mise en page/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Zone défilante aux barres fines et flottantes (7 px, 11 px au survol), identiques sur tous les systèmes. Le défilement reste natif : molette, tactile, clavier. `maxHeight` borne la hauteur ; `orientation` `horizontal` ou `both`.",
      },
    },
  },
  args: { maxHeight: 220 },
  render: (args) => (
    <Card variant="elevated" style={{ maxWidth: 340 }}>
      <CardHeader><CardTitle>Journal d'activité</CardTitle></CardHeader>
      <CardContent>
        <ScrollArea {...args}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={{ padding: "10px 2px", borderBottom: "1px solid var(--ui-line)" }}>
              <Text size={13}>Facture FAC-2026-{String(400 + i).padStart(5, "0")} envoyée</Text>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
