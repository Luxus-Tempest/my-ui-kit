# Contribuer à @acme/ui

Ce guide décrit comment un composant naît, est documenté et est validé. Toute
contribution (humaine ou outillée) le suit : c'est ce qui garde la librairie
cohérente quand elle grandit.

## 1. Anatomie d'un composant

```
packages/ui/src/components/<nom-en-kebab>/
├── <Nom>.tsx          composant(s) et types exportés
├── <nom>.css          styles, classes préfixées `ui-`
└── <Nom>.test.tsx     comportement + test axe
```

Puis, dans le même changement :

1. `packages/ui/src/styles.css` : `@import` du CSS, dans la bonne famille.
2. `packages/ui/src/index.ts` : exports (composants **et** types), dans la bonne famille.
3. `apps/docs/stories/composants/<catégorie>/<Nom>.stories.tsx` : la page Storybook.
4. `apps/docs/stories/introduction/Statut.mdx` : une ligne dans le tableau de statut.
5. Une entrée Changeset (`pnpm changeset`).

### Règles d'écriture

- **Primitives Radix** pour tout ce qui a un comportement (focus, clavier, ARIA) ; jamais de réimplémentation.
- `React.forwardRef` sur l'élément principal ; `className` toujours accepté et fusionné avec `cn()` ;
  `asChild` (Radix Slot) quand le composant peut devenir un lien ou un autre élément.
- **États pilotés par ARIA et `data-*`** (`aria-invalid`, `aria-pressed`, `aria-expanded`,
  `data-state`, `data-size`…), jamais par des classes d'état.
- Variantes avec `class-variance-authority` ; **la variante est le rôle, jamais la couleur**.
- Un contrôle de formulaire appelle `useFieldControl(props)` pour recevoir libellé, aide et erreur d'un `Field`.
- Valeur contrôlée ou non : `useControllableState` (`src/hooks/`) plutôt qu'un `useState` doublé d'un effet.
  Comportement selon l'écran : `useMediaQuery(breakpoints.md)`.
- Une dépendance lourde (graphiques, tableaux) ne s'initialise jamais au chargement du module : le build garde
  un module par composant et `sideEffects` ne couvre que le CSS, un effet de bord au chargement l'embarquerait partout.
- Libellés, commentaires, messages et documentation **en français**. Les libellés internes
  (« Fermer », « Effacer ») sont surchargeables par une prop.

### Règles de style (langage Drive × iOS)

- **Jamais de valeur en dur** : couleurs, rayons, ombres, durées et courbes viennent des jetons `--ui-*`
  (`packages/ui/src/theme/tokens.css`). Les variables locales d'un composant sont préfixées `--_`.
- **Hauteurs et marges internes des contrôles : jetons de densité.** Un bouton, une bascule, un onglet prennent
  `--ui-ctl-h` (`-sm`, `-lg`) et `--ui-ctl-px` ; un champ `--ui-field-h` (`-sm`) et `--ui-field-px` ; une entrée de
  menu `--ui-row-h`, une ligne de liste `--ui-row-h-list` et `--ui-row-py`, une ligne de table `--ui-row-h-table`.
  Une mesure voisine se dérive dans le CSS du composant (`calc(var(--ui-ctl-h) - 6px)`), jamais dans `tokens.css` :
  elle suit ainsi une densité posée sur n'importe quel ancêtre. La taille du texte et des icônes ne dépend pas de la
  densité. Vérifier le rendu dans les trois densités (bascule « Densité » de Storybook) : cible tactile ≥ 24 px
  en compacte, rien ne déborde en confortable.
- Surfaces tonales plutôt qu'ombres au repos ; ombres réservées à ce qui flotte.
- Actions et puces en pilule (`--ui-r-pill`), champs en `--ui-r-ctl`, cartes en `--ui-r-lg`, modales en `--ui-r-xl`.
- Couche d'état Material : survol `--ui-state-hover`, appui `--ui-state-press`, sur `currentColor`
  (pseudo-élément `::before` + `isolation: isolate`).
- Sélection : `--ui-sel` + `--ui-on-pri-container`. Focus : filet `--ui-pri` + halo 3 px `--ui-ring`.
- Ce qui flotte : surface `.ui-popup` (matériau translucide), entrées `.ui-menu-item`.
- Mouvement : `--ui-duration` / `--ui-ease` pour les états, `--ui-duration-slow` / `--ui-ease-spring` pour les surfaces.
- Toujours : `prefers-reduced-motion`, `forced-colors`, cible tactile ≥ 24 px (pseudo-élément `::after`).
- **Droite à gauche** : propriétés logiques uniquement (`margin-inline-start`, `padding-inline`, `inset-inline-end`,
  `text-align: start`) ; une flèche ou un chevron directionnel se retourne sous `[dir="rtl"]` ; une primitive
  Radix reçoit le sens via `useDirection()`.
- Graphiques : palette `--ui-c1…c8` dans l'ordre (validée daltonisme, ne pas permuter).

## 2. Anatomie d'une page Storybook

Arborescence de la barre latérale :

| Rubrique | Contenu |
|---|---|
| `Introduction` | Bienvenue, installation, statut des composants |
| `Fondations` | Couleurs, typographie, espacement, densité, rayons & élévation, mouvement, langage visuel |
| `Composants/<Catégorie>/<Nom>` | **une page par composant**, documentation automatique |
| `Blocs` | Écrans prêts à l'emploi qui assemblent les composants (application, connexion, tableau de bord…) |

Catégories : `Actions`, `Formulaire`, `Affichage`, `Données`, `Typographie`, `Mise en page`,
`Navigation`, `Surcouches`, `Retour`, `Messagerie`, `Graphiques`.

Modèle :

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@acme/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Une phrase : à quoi sert le composant, quand le choisir." } },
  },
  args: { children: "Enregistrer" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** Une story par axe : variantes, tailles, états, intégration (Field, asChild…). */
export const Variantes: Story = { render: () => <Row>…</Row> };
```

- `Playground` en premier, branché sur les contrôles (`args` / `argTypes`).
- Ensuite une story par axe : **Variantes**, **Tailles**, **États** (désactivé, invalide, chargement…),
  **Composition** (dans un `Field`, `asChild`, avec d'autres composants).
- Un commentaire JSDoc au-dessus de chaque story : il devient sa description dans la page Docs.
- Icônes de démo : **`lucide-react`** (dépendance de l'app docs) ; mise en page de démo : `../../_shared/demo` (`Row`, `Card`) ;
  données de démo : `../../_shared/data`. `_shared/icons` est historique : ne plus l'étendre.
- Les composants eux-mêmes n'importent **aucune** librairie d'icônes : leurs pictogrammes internes (chevron, croix…)
  sont des SVG en ligne ; l'appelant passe ses propres icônes (`lucide-react` recommandé) en `children` ou en props.

## 3. Checklist avant fusion

- [ ] `pnpm lint` (types), `pnpm test` (Vitest + axe), `pnpm build` et `pnpm size` (budget de poids) passent.
- [ ] `STORIES=<composant> pnpm --filter docs e2e` passe : axe en vrai navigateur (contraste compris) et captures.
      Un changement visuel voulu s'accepte avec `--update-snapshots=all`, après lecture du rapport.
- [ ] Le test du composant couvre le clavier et contient un test axe sans violation.
- [ ] Rendu vérifié en clair, en sombre **et** de droite à gauche (bascules « Thème » et « Sens » de Storybook), addon a11y sans erreur ;
      contrôles vérifiés dans les trois densités (bascule « Densité »).
- [ ] Aucune valeur en dur dans le CSS (hauteurs de contrôle comprises : jetons de densité) ; textes en français.
- [ ] Exports, styles, story, statut et Changeset ajoutés.
