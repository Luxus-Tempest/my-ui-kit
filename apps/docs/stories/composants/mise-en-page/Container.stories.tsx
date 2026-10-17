import type { Meta, StoryObj } from "@storybook/react";
import { Box, Container, Text } from "@rovia/ui";

const meta = {
  title: "Composants/Mise en page/Container",
  component: Container,
  tags: ["autodocs"],
  parameters: {
    registry: "layout",
    docs: {
      description: {
        component:
          "Centre le contenu d'une page et borne sa largeur : `sm` 640, `md` 960, `lg` 1200, `xl` 1440 px, avec une marge latérale qui protège les petits écrans.",
      },
    },
  },
  args: { size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] } },
  render: (args) => (
    <Container {...args}>
      <Box bg="panel" border radius="lg" p={4}>
        <Text size={13} tone="muted">Contenu borné et centré</Text>
      </Box>
    </Container>
  ),
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
