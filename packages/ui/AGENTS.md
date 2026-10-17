# packages/ui (@acme/ui)

## Overview

La librairie publiée : plus de 70 familles de composants React, construites sur Radix UI, habillées en variables CSS dans le langage Drive × iOS (clair, sombre, droite à gauche, trois densités). Tout le reste du dépôt la consomme.

## Key files

| File | Owns |
|---|---|
| `src/components/<nom>/` | un composant : `<Nom>.tsx`, `<nom>.css`, `<Nom>.test.tsx` |
| `src/index.ts` | l'API publique, rangée par famille (composants et types) |
| `src/styles.css` | les `@import` CSS de chaque composant, par famille |
| `src/theme/tokens.css` | les jetons `--ui-*` (clair et sombre) |
| `src/theme/ThemeProvider.tsx`, `brand.ts` | mode, sens de lecture, densité, couleur de marque |
| `src/i18n/` | `LocaleProvider`, `messages.ts`, catalogues `locales/en.tsx` et `locales/ar.tsx` |
| `src/hooks/` | `useControllableState`, `useMediaQuery` |
| `tsup.config.ts` | build ESM découpé par composant, plus CJS |
| `scripts/build-css.mjs`, `scripts/check-size.mjs` | `dist/styles.css` et le budget de poids |

## Commands

```bash
pnpm --filter @acme/ui test        # Vitest + Testing Library + axe (jsdom)
pnpm --filter @acme/ui typecheck
pnpm --filter @acme/ui build       # tsup puis CSS
pnpm --filter @acme/ui size        # budget de poids, après build
```

## Conventions

- La checklist complète est dans `CONTRIBUTING.md` (anatomie, règles d'écriture, règles de style, checklist avant fusion). Lis la avant de créer ou modifier un composant.
- Un nouveau composant touche aussi `src/styles.css`, `src/index.ts`, sa story dans `apps/docs`, la page de statut (`apps/docs/stories/introduction/Statut.mdx`) et une entrée Changeset.
- Comportement par Radix, états par ARIA et `data-*`, variantes par `class-variance-authority` (la variante est un rôle, jamais une couleur).
- Aucune valeur en dur dans le CSS : jetons `--ui-*`, jetons de densité pour les hauteurs, propriétés logiques pour le RTL.
- Tout texte visible part d'une constante `XXX_LABELS` lue avec `useMessages`, traduite en anglais et en arabe (le typage l'exige).
- Les composants n'importent aucune librairie d'icônes : SVG en ligne, l'appelant passe ses icônes.

## Gotchas

- Une dépendance lourde (ECharts, TanStack) ne doit jamais s'initialiser au chargement du module : `sideEffects` ne couvre que le CSS, et un effet de bord l'embarquerait dans toutes les applications.
- Le barrel `dist/index.js` perd sa directive `"use client"` au build (voulu) : chaque module de composant garde la sienne, sinon une page serveur Next.js embarque tout le paquet.
- La palette `--ui-c1…c8` est validée pour le daltonisme : ne la permute pas sans relancer le validateur.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
