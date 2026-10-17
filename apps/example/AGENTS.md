# apps/example (Next.js)

## Overview

Une application Next.js qui consomme `@acme/ui` comme une vraie application : le paquet buildé, le rendu serveur, Tailwind et `next-themes`, avec un menu de langue (français, anglais, arabe). Elle prouve que la librairie marche hors de Storybook.

## Stack

- Next.js 16 (App Router), React 19, Tailwind 4, `next-themes`, `lucide-react`, Playwright.

## Commands

```bash
pnpm --filter example dev    # http://localhost:3001
pnpm --filter example build
pnpm --filter example e2e
```

## Gotchas

- Elle lit `@acme/ui` depuis son `dist` : construis la librairie (`pnpm --filter @acme/ui build`) avant de lancer l'application, sinon un changement de composant n'apparaît pas.
- Le thème sombre passe par la classe `.dark` posée par `next-themes`, que la librairie reconnaît directement.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
