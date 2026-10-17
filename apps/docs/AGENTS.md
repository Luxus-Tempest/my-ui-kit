# apps/docs (Storybook)

## Overview

La documentation interactive de `@rovia/ui` (Storybook 8, Vite) et sa suite de tests en vrai navigateur : chaque story est ouverte en clair, en sombre et de droite à gauche, vérifiée par axe et comparée à une capture de référence.

## Key files

| File | Owns |
|---|---|
| `.storybook/` | configuration, bascules Thème, Sens, Densité, Marque |
| `stories/introduction/` | bienvenue, installation, `Statut.mdx` (statut des composants) |
| `stories/fondations/` | langage visuel, couleurs, typographie, espacement, mouvement |
| `stories/composants/<catégorie>/` | une page par composant |
| `stories/blocs/` | écrans assemblés (application, connexion, Drive, messagerie…) |
| `stories/_shared/` | `demo` (Row, Card), `data` ; `icons` est historique, ne plus l'étendre |
| `tests/stories.spec.ts`, `playwright.config.ts` | axe et régression visuelle sur le Storybook construit |

## Commands

```bash
pnpm storybook                                   # http://localhost:6006
pnpm --filter docs build                         # storybook-static
STORIES=<composant> pnpm --filter docs e2e       # axe + captures, filtré
pnpm --filter docs e2e -- --update-snapshots=all # accepter un changement visuel voulu
```

## Conventions

- Modèle de story dans `CONTRIBUTING.md` : `Playground` en premier, puis une story par axe (Variantes, Tailles, États, Composition), un JSDoc au dessus de chacune.
- Icônes de démo : `lucide-react`.

## Gotchas

- Les e2e tournent sur le Storybook construit (`dependsOn: build`), pas sur le serveur de dev.
- Sous Windows, Playwright utilise Edge installé ; en CI, Chromium. Les captures sont rangées par plateforme (`tests/__screenshots__/{platform}`) et ignorées par git : celles de Windows ne se comparent pas à celles de la CI.
- `PW_PORT` change le port du serveur statique (6100 par défaut) pour lancer plusieurs suites en parallèle.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
