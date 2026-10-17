# Verify: registre de blocs installables · spec 0001 · updated 2026-10-18
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Commands
- [x] `pnpm registry:build` → `apps/docs/storybook-static/r/` contient `registry.json`, `connexion.json` et 70 éléments d'éjection ; aucune erreur → AC-1
- [x] `pnpm --filter @rovia/registry test` → 12 tests verts, dont les fautes attendues : barrel importé par un bloc, sous chemin inconnu, paquet non déclaré, import hors dossier, import relatif non réécrit, dépendance sans version, nom en double, story absente ou inconnue → AC-1, AC-8
- [x] `pnpm --filter @rovia/registry smoke` (après `pnpm build`) → « Installation réelle réussie » : application Next.js vierge sans Tailwind, mise en place, `connexion` installé, `button` éjecté, types, build, navigateur clair et sombre, `--overwrite` → AC-2, AC-3, AC-4, AC-5, AC-6, AC-10, AC-11
- [x] `pnpm lint` → `subpaths --check` vert (74 sous chemins à jour) et types verts sur les 5 paquets → AC-7, AC-9
- [x] `pnpm test`, `pnpm build`, `pnpm size`, `pnpm --filter example e2e` verts après le renommage → AC-12
- [x] `STORIES=authentification pnpm --filter docs e2e` → la story Connexion, qui importe `@rovia/blocks/connexion`, est identique aux captures de référence (clair, sombre, RTL) → AC-9
- [x] Sur une PR : le job CI « Registre, installation réelle » passe sous Linux (Chromium) et joint les captures → AC-10
- [x] Après fusion sur `main` : `https://luxus-tempest.github.io/my-ui-kit/r/registry.json` répond 200 et liste `connexion` → AC-8
- [x] Avec le secret `NPM_TOKEN` : la PR « Version des paquets » publie `@rovia/ui@1.0.0` ; `npm view @rovia/ui exports` liste `./button`, `./theme`… → AC-7

## Résultats du 2026-10-18
- PR #1 : CI verte (types, tests, build, poids, installation réelle sous Linux, accessibilité et régression visuelle), fusionnée.
- GitHub Pages : Storybook, `r/registry.json` et `r/connexion.json` répondent 200 ; `connexion.json` déclare `@rovia/ui@^1.0.0` et commence par `"use client";` puis l'en tête `1.0.0`.
- PR #2 « Version des paquets » fusionnée : `@rovia/ui@1.0.0` publié (`latest`), 77 entrées dans `exports`.

## UI / manual
- [ ] Storybook déployé, page *Composants › Actions › Button* (onglet Docs) → bloc « Éjecter ce composant » avec `pnpm dlx shadcn@4.21.4 add @rovia/button` → AC-8
- [ ] Page *Blocs › Authentification* (Docs) → bloc « Installer ce bloc » avec `@rovia/connexion` → AC-8
- [ ] *Introduction › Bienvenue* → section « Blocs et éjection » avec le `components.json` minimal → AC-2
- [ ] Dans une vraie application : `pnpm dlx shadcn@4.21.4 add @rovia/connexion` depuis le registre public, puis affichage en clair et en sombre → AC-3

## Value sourcing
- [x] En tête : version lue dans `packages/ui/package.json` (`0.1.0` aujourd'hui, `1.0.0` après publication) ; en CI, `REGISTRY_PKG_SPEC=file:<archive>` remplace la dépendance `@rovia/ui` (test « REGISTRY_PKG_SPEC remplace la version ») → AC-5, AC-10
- [x] Dépendances npm : `button` → `@radix-ui/react-slot`, `class-variance-authority` ; `data-table` → `@tanstack/react-table`, `@tanstack/react-virtual` ; `chart` → `echarts` (réduit depuis `echarts/core`) ; aucun `react` ni `react-dom` → AC-1
- [x] Réécriture : `data-table/DataTable.tsx` éjecté importe `@rovia/ui/utils`, `@rovia/ui/i18n`, `@rovia/ui/pagination` ; ses imports internes (`./context`) restent relatifs → AC-4
- [x] URL de base : sans `REGISTRY_BASE_URL`, `registry.json` porte `homepage: https://luxus-tempest.github.io/my-ui-kit` → AC-8

## Acceptance-criteria coverage
- AC-1 : registry:build, tests du générateur · AC-2 : smoke (mise en place), Bienvenue · AC-3 : smoke · AC-4 : smoke, réécriture · AC-5 : smoke, en tête · AC-6 : smoke (redirection + règle de la copie, `--overwrite`) · AC-7 : subpaths, publication npm · AC-8 : tests du générateur, pages Docs, Pages · AC-9 : story Connexion · AC-10 : smoke local, job CI · AC-11 : smoke sans Tailwind · AC-12 : lint, test, build, size, e2e

## Hors périmètre, constaté pendant la vérification
- `Fondations/Couleur de marque › Essayer une couleur` : violation axe `aria-valid-attr-value` (onglets Radix, `aria-controls` vers un panneau absent). Elle existe déjà avant ce chantier (vérifié sur le commit `b4e14d9`).
- Bloc connexion : le titre de carte est un `div`, pas un titre (`h1`) ; à reprendre avec les blocs (fonctionnalité 9).
