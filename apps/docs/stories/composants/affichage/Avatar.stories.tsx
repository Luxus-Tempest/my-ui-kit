import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@rovia/ui";
import { Row } from "../../_shared/demo";

// Portrait de démonstration (données, pas un jeton de style).
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#c7d6f2'/><circle cx='32' cy='25' r='11' fill='#6b84b8'/><path d='M12 60c2-12 10-18 20-18s18 6 20 18' fill='#6b84b8'/></svg>`,
  );

const meta = {
  title: "Composants/Affichage/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    registry: "avatar",
    docs: {
      description: {
        component:
          "Représente une personne : photo, sinon monogramme sur conteneur tonal (comme Google). `AvatarBadge` ajoute un état de présence (toujours avec un libellé pour les lecteurs d'écran) ; `AvatarGroup` empile plusieurs avatars et `AvatarGroupCount` résume le reste.",
      },
    },
  },
  args: { size: "default" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "default", "lg"] } },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={photo} alt="Sara Alami" />
      <AvatarFallback name="Sara Alami" />
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 24 / 32 / 40 px ; sans photo, les initiales sont tirées de `name`. */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="Photo">
        <Avatar size="sm"><AvatarImage src={photo} alt="Sara Alami" /><AvatarFallback name="Sara Alami" /></Avatar>
        <Avatar><AvatarImage src={photo} alt="Sara Alami" /><AvatarFallback name="Sara Alami" /></Avatar>
        <Avatar size="lg"><AvatarImage src={photo} alt="Sara Alami" /><AvatarFallback name="Sara Alami" /></Avatar>
      </Row>
      <Row label="Initiales">
        <Avatar size="sm"><AvatarFallback name="Karim Benali" /></Avatar>
        <Avatar><AvatarFallback name="Karim Benali" /></Avatar>
        <Avatar size="lg"><AvatarFallback name="Karim Benali" /></Avatar>
      </Row>
    </>
  ),
};

/** La présence se lit par la couleur **et** par le libellé annoncé. */
export const Presence: Story = {
  name: "Présence",
  render: () => (
    <Row>
      <Avatar><AvatarFallback name="Nadia Tazi" /><AvatarBadge tone="ok" label="En ligne" /></Avatar>
      <Avatar><AvatarFallback name="Omar Fassi" /><AvatarBadge tone="warn" label="Absent" /></Avatar>
      <Avatar size="lg"><AvatarImage src={photo} alt="Sara Alami" /><AvatarBadge tone="neu" label="Hors ligne" /></Avatar>
    </Row>
  ),
};

/** Groupe : chevauchement de 8 px, cercle couleur du fond (`--ui-avatar-ring` sur une carte). */
export const Groupe: Story = {
  render: () => (
    <Row>
      <AvatarGroup>
        <Avatar><AvatarImage src={photo} alt="Sara Alami" /></Avatar>
        <Avatar><AvatarFallback name="Karim Benali" /></Avatar>
        <Avatar><AvatarFallback name="Nadia Tazi" /></Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup size="sm">
        <Avatar><AvatarFallback name="Omar Fassi" /></Avatar>
        <Avatar><AvatarFallback name="Lina Kettani" /></Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    </Row>
  ),
};
