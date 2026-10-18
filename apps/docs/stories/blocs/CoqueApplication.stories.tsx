import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Heading, Text, toast, Toaster, Tooltip } from "@rovia/ui";
import { CoqueApplication, coqueApplicationSample } from "@rovia/blocks/coque-application";
import { CircleHelp } from "lucide-react";

const meta: Meta = {
  title: "Blocs/Coque d'application",
  parameters: {
    padding: 0,
    docs: {
      story: { inline: false, height: "640px" },
      description: {
        component:
          "La coque de toute application : barre latérale réductible (⌘B) dont la navigation vient d'un seul tableau, fil d'Ariane construit depuis l'entrée active, actions de la barre d'application, menu utilisateur et zone de page `#contenu` (cible du lien « Aller au contenu »). Passe le `Link` de ton framework en `linkComponent`.",
      },
    },
  },
};
export default meta;

/** Le bloc `@rovia/blocks/coque-application` avec sa navigation d'exemple ; les liens changent l'entrée active. */
function Demo() {
  const [href, setHref] = React.useState(coqueApplicationSample.activeHref);
  // Lien de démonstration : change l'entrée active au lieu de naviguer.
  const DemoLink = React.useCallback(
    ({ href: to, children, className }: { href: string; children?: React.ReactNode; className?: string }) => (
      <a
        href={to}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setHref(to);
        }}
      >
        {children}
      </a>
    ),
    [],
  );
  return (
    <>
      <CoqueApplication
        {...coqueApplicationSample}
        activeHref={href}
        linkComponent={DemoLink}
        onSignOut={() => toast("Déconnexion")}
        actions={
          <Tooltip content="Aide">
            <Button size="icon" variant="ghost" aria-label="Aide"><CircleHelp /></Button>
          </Tooltip>
        }
      >
        <Heading level={1} size="lg">Page {href}</Heading>
        <Text tone="muted">Le contenu de la page vient ici.</Text>
      </CoqueApplication>
      <Toaster />
    </>
  );
}

export const Ecran: StoryObj = { name: "Écran complet", parameters: { registry: "coque-application" }, render: () => <Demo /> };
