# Socle

Ce qui existe déjà, puis les fondations que chaque lot utilise : le registre de blocs et le starter. Retour à l'[index](index.md).

## Foundations

### 1. Composants de base · existing
Environ 70 familles de composants (actions, formulaire, affichage, données, navigation, surcouches, retour, typographie, mise en page, messagerie, graphiques ECharts), chacune testée et documentée. code in `packages/ui/src/components/`

### 2. Thème Drive × iOS, marque, densité, RTL, langues · existing
Jetons clair et sombre, couleur de marque, densité globale, sens de lecture, catalogues français, anglais et arabe. code in `packages/ui/src/theme/`, `packages/ui/src/i18n/`

### 3. Documentation Storybook et chaîne qualité · existing
Storybook (fondations, composants, blocs, statut), tests Vitest et axe, captures Playwright, budget de poids, CI. code in `apps/docs/`, `.github/workflows/`

### 4. Blocs Storybook (7 écrans) · existing
Application, connexion et inscription, Drive, formulaire client, messagerie, paramètres, tableau de bord. Visibles seulement dans Storybook pour l'instant, rien à installer. code in `apps/docs/stories/blocs/`

### 5. Application d'exemple · existing
Application Next.js qui consomme le paquet buildé (rendu serveur, Tailwind, menu de langue). code in `apps/example/`

### 6. DataTable ERP · in-progress
Colonnes figées et redimensionnables, lignes dépliables, totaux : fusionnés. Des changements non commités sont en cours sur la branche `feat/config-globale-et-datatable` (barre d'outils, facettes, export, agrégats, locales). Termine les avec `/develop`. code in `packages/ui/src/components/data-table/`

### 7. Conventions et contexte IA du dépôt
Le `AGENTS.md` racine ne contient que le bloc Turborepo. Recommandé : y capturer les vraies conventions (structure d'un composant, tests, jetons, Drive × iOS, RTL) pour que chaque skill suivante travaille avec le bon contexte.
**Done when:** le `AGENTS.md` racine décrit la stack réelle et la checklist de qualité de `CONTRIBUTING.md`, et `packages/ui` a son `AGENTS.md`.
- [x] Capture conventions: `/audit`

### 8. Registre de blocs installables · needs a decision
Le cœur du « plug and play » : un bloc s'installe dans n'importe laquelle de tes applications en une commande, avec son code copié pour être modifié librement. À décider : le modèle de distribution (piste recommandée : hybride, composants sur npm pour recevoir les correctifs, blocs copiés par le registre), où le registre est servi, et comment une application l'utilise.
**Done when:** depuis une application vierge, une seule commande installe un bloc existant, qui s'affiche avec le thème, en clair et en sombre ; la doc montre la commande à côté de chaque bloc.
- [ ] Design it (spec): `/architect registre de blocs installables`

## Skeleton

### 9. Blocs existants dans le registre
Passer les 7 blocs de Storybook dans le registre, pour que les stories et l'installation partagent le même code source.
**Done when:** les 7 blocs s'installent par le registre, leurs stories affichent le même code, et chacun passe axe et la capture visuelle.
- [ ] Build it: `/develop blocs existants dans le registre`

### 10. Starter d'application · needs a decision
Un modèle d'application tiré de `apps/example`, pour qu'une nouvelle application démarre en quelques minutes avec la coque, le thème, les langues et les écrans d'auth déjà branchés.
**Done when:** une commande crée une application qui démarre, affiche la coque et la connexion, bascule clair, sombre et RTL.
- [ ] Design it (spec): `/architect starter d'application`
