import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "@acme/ui";
import type { PaginationProps } from "@acme/ui";
import { Row } from "../../_shared/demo";

/** Démo pilotée : la page courante vit dans l'état de la story. */
function Controlled({ page: initial = 1, ...props }: Partial<PaginationProps> & { pageCount: number }) {
  const [page, setPage] = React.useState(initial);
  React.useEffect(() => setPage(initial), [initial]);
  return (
    <Pagination
      {...props}
      page={page}
      onPageChange={(p) => {
        setPage(p);
        props.onPageChange?.(p);
      }}
    />
  );
}

const meta = {
  title: "Composants/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Parcourt un résultat découpé en pages. `variant=\"pages\"` (défaut) : flèches circulaires et pastilles, page courante en conteneur de sélection (`aria-current=\"page\"`), ellipses calculées par `getPaginationRange`. `variant=\"compact\"` : « Page 3 sur 12 » entre deux flèches, quand la place manque. Pages numérotées à partir de 1.",
      },
    },
  },
  args: { page: 5, pageCount: 12, siblingCount: 1, boundaryCount: 1, variant: "pages", disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["pages", "compact"] },
    page: { control: { type: "number", min: 1 } },
    pageCount: { control: { type: "number", min: 1 } },
    siblingCount: { control: { type: "number", min: 0, max: 3 } },
    boundaryCount: { control: { type: "number", min: 0, max: 3 } },
    disabled: { control: "boolean" },
    defaultPage: { table: { disable: true } },
    labels: { control: "object" },
  },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** `pages` pour une liste ou un tableau ; `compact` dans une barre étroite ou sur mobile. */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="pages"><Controlled page={5} pageCount={12} labels={{ nav: "Pagination des fichiers" }} /></Row>
      <Row label="compact"><Controlled variant="compact" page={3} pageCount={12} labels={{ nav: "Pagination compacte" }} /></Row>
    </>
  ),
};

/**
 * Les ellipses suivent la page courante ; le nombre de pastilles reste constant pour que
 * la pagination ne change pas de largeur. `siblingCount` et `boundaryCount` règlent la densité.
 */
export const Plages: Story = {
  render: () => (
    <>
      <Row label="Début"><Controlled page={1} pageCount={20} labels={{ nav: "Début" }} /></Row>
      <Row label="Milieu"><Controlled page={10} pageCount={20} labels={{ nav: "Milieu" }} /></Row>
      <Row label="Fin"><Controlled page={20} pageCount={20} labels={{ nav: "Fin" }} /></Row>
      <Row label="Peu de pages"><Controlled page={2} pageCount={5} labels={{ nav: "Peu de pages" }} /></Row>
      <Row label="sibling 2 · boundary 2">
        <Controlled page={10} pageCount={20} siblingCount={2} boundaryCount={2} labels={{ nav: "Plage large" }} />
      </Row>
    </>
  ),
};

/**
 * Aux bornes, la flèche est `aria-disabled` : elle garde le focus au lieu de le perdre.
 * `disabled` fige toute la pagination (chargement des résultats).
 */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Première page"><Controlled page={1} pageCount={8} labels={{ nav: "Première page" }} /></Row>
      <Row label="Dernière page"><Controlled page={8} pageCount={8} labels={{ nav: "Dernière page" }} /></Row>
      <Row label="Désactivée"><Controlled page={3} pageCount={8} disabled labels={{ nav: "Désactivée" }} /></Row>
    </>
  ),
};

/** Tous les libellés internes sont surchargeables (traduction, précision du contexte). */
export const Libelles: Story = {
  name: "Libellés",
  render: () => (
    <>
      <Row label="Anglais">
        <Controlled
          page={2}
          pageCount={9}
          labels={{
            nav: "Pagination",
            previous: "Previous page",
            next: "Next page",
            page: (n) => `Page ${n}`,
          }}
        />
      </Row>
      <Row label="Compacte">
        <Controlled
          variant="compact"
          page={4}
          pageCount={9}
          labels={{ nav: "Résultats de recherche", status: (p, n) => `Résultats ${p} / ${n}` }}
        />
      </Row>
    </>
  ),
};

/** Sous un tableau, la pagination s'aligne à droite ; la compacte se loge dans un pied de carte. */
export const Composition: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 8px 8px 16px",
          borderRadius: "var(--ui-r-lg)",
          background: "var(--ui-card-2)",
          color: "var(--ui-fg-3)",
          fontSize: 13,
        }}
      >
        41–60 sur 238 fichiers
        <Controlled variant="compact" page={3} pageCount={12} labels={{ nav: "Pagination du tableau" }} />
      </div>
    </div>
  ),
};
