# 0001. Registre de blocs installables et éjection de composants

**Date**: 2026-10-17
**Status**: In Progress

## Summary

Chaque application installe le paquet npm `@rovia/ui`, qui reçoit les correctifs. Par dessus, un registre au format shadcn permet deux gestes en une commande : installer un bloc (un écran complet copié dans l'application, à modifier librement), ou éjecter un composant (copier un seul dossier de composant pour le transformer, ses liens vers les autres composants restant branchés sur le paquet). Le registre est généré depuis le code, servi avec Storybook sur GitHub Pages, et une vraie installation est rejouée en CI à chaque PR.

## Requirements

**User stories**:
- En tant que développeur de mes propres applications, je veux installer un bloc (connexion, CRUD…) en une commande pour démarrer un écran sans le réécrire.
- En tant que développeur, je veux prendre possession d'un seul composant dans une application pour le transformer, sans copier toute la librairie.
- En tant que mainteneur, je veux que le registre se génère depuis le code et qu'une installation cassée bloque la PR.

**Acceptance criteria**:
- **AC-1**: `pnpm registry:build` génère `r/registry.json` et un JSON par élément : un élément de bloc par bloc de `packages/blocks/src/`, un élément d'éjection par dossier de `packages/ui/src/components/` (sauf `popup`, surface partagée sans composant). Le build échoue si : un fichier listé manque ; deux éléments portent le même nom ; un fichier d'éjection garde, après réécriture, un import relatif qui sort de son dossier ; un bloc importe autre chose que `@rovia/ui/<sous chemin>`, `react`, ses dépendances npm déclarées ou ses propres fichiers.
- **AC-2**: Mise en place unique d'une application (documentée, scriptée en CI) : `pnpm add @rovia/ui`, import de `@rovia/ui/styles.css` dans la mise en page racine avant tout autre CSS, `ThemeProvider` autour de l'application, `components.json` minimal (voir Decision) avec `"registries": { "@rovia": "<base>/r/{name}.json" }`. Aucune de ces étapes n'installe ni n'exige Tailwind.
- **AC-3**: Bloc. Dans une application mise en place (AC-2), `shadcn add @rovia/connexion` copie les fichiers du bloc et `connexion.sample.ts` sous `<dossier components>/blocks/connexion/`, ajoute les dépendances npm du bloc. Une page qui rend le bloc avec les données d'exemple passe la vérification des types et le build, et s'affiche en clair et en sombre, sans modifier les fichiers copiés.
- **AC-4**: Éjection. `shadcn add @rovia/button` copie le seul dossier `button` (sans tests) sous `<dossier components>/rovia/button/`. Ses imports relatifs vers d'autres dossiers sont réécrits en `@rovia/ui/<dossier>` ; ceux vers `utils`, `i18n`, `hooks`, `theme` en `@rovia/ui/utils`, `@rovia/ui/i18n`, `@rovia/ui/hooks`, `@rovia/ui/theme`. L'application compile, et une règle CSS modifiée dans la copie l'emporte sur celle du paquet.
- **AC-5**: Chaque module `.ts`/`.tsx` copié (bloc ou éjection) commence par `"use client";` puis, sur la ligne suivante, l'en tête `/* @rovia/ui <version> · <élément> */` (le CLI shadcn supprime tout commentaire placé en première position ; prouvé en tâche 1). Le CSS d'un composant éjecté est importé par son propre module, pas par un fichier à part.
- **AC-6**: Redirection d'un éjecté. En ajoutant `"@rovia/ui/button": ["<chemin disque>/rovia/button"]` aux `paths` du `tsconfig`, les blocs et le code de l'application utilisent la copie. Les composants internes du paquet (par exemple DataTable) gardent le bouton du paquet, et c'est documenté.
- **AC-7**: Le paquet est publié sur npm sous `@rovia/ui` : `.` (barrel actuel, ESM et CJS), `./styles.css`, et un sous chemin ESM avec types par dossier de composant et pour `theme`, `i18n`, `hooks`, `utils`. Une publication part de la CI par Changesets quand une version est fusionnée sur `main`.
- **AC-8**: À chaque push sur `main`, Storybook et le registre sont déployés ensemble sur GitHub Pages : `https://luxus-tempest.github.io/my-ui-kit/r/registry.json` répond. Chaque page de composant affiche sa commande d'éjection, chaque page de bloc sa commande d'installation, à partir d'un `parameters.registry` explicite ; le build échoue si un élément n'a pas de story ou si une story nomme un élément inconnu.
- **AC-9**: Le bloc connexion vit dans `packages/blocks`, et sa story l'importe (aucun code dupliqué entre doc et registre). Storybook et `packages/blocks` résolvent `@rovia/ui/<sous chemin>` vers les sources.
- **AC-10**: À chaque PR, la CI construit le paquet (archive locale), construit le registre en pointant la dépendance `@rovia/ui` vers cette archive, le sert en local, crée une application Next.js vierge sans Tailwind hors du workspace, la met en place (AC-2), installe `connexion` et éjecte `button`, puis vérifie les types, construit et capture la page en clair et en sombre. Un échec bloque la fusion.
- **AC-11**: Aucune étape n'exige Tailwind. Si le CLI shadcn ne peut pas installer, même avec un `components.json` minimal, un élément avec une cible imbriquée (`.tsx`, `.ts`, `.css`) et une dépendance npm, le build s'arrête à la première tâche et l'installeur repasse par `/architect` (repli prévu : petit CLI sur l'API `shadcn/registry`).
- **AC-12**: Le paquet est renommé de `@acme/ui` en `@rovia/ui` partout (librairie, Storybook, application d'exemple, docs), et `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm size` et les e2e passent.

## Decision

**Chosen option**: Paquet partout, registre pour les blocs et l'éjection.

`@rovia/ui` est publié sur npm et installé par chaque application ; un registre au format shadcn, généré depuis le code et servi sur GitHub Pages sous un seul espace de noms `@rovia`, distribue les blocs (copiés) et l'éjection de composants (un dossier copié, branché sur le paquet).

Décisions de détail (choix, pourquoi, second choix) :
- **Code du registre** : nouveau paquet interne `packages/registry` (script `registry:build`), lancé après `storybook build` (qui vide `storybook-static`), sortie dans `apps/docs/storybook-static/r/`, ordre tenu par turbo (`dependsOn`, `outputs` avec `r/**`). Second choix : un dossier `scripts/` à la racine.
- **Blocs** : nouveau paquet interne `packages/blocks` (non publié), importé par les stories. Un bloc prend ses données et ses actions en props typées et livre `<nom>.sample.ts`. Textes en français en clair.
- **Analyse des imports** : par un vrai analyseur de modules (pas d'expression régulière, `lucide-react` apparaît dans des commentaires), en excluant `react` et `react-dom` (dépendances pair), en réduisant `echarts/core` ou `@scope/pkg/x` au nom du paquet, en ignorant les `import type`, et en excluant `*.test.ts(x)`, `vitest-axe.d.ts`, `src/index.ts` et `styles.css`. Versions lues dans `packages/ui/package.json` et `packages/blocks/package.json`.
- **Sous chemins et types** : un `index.ts` (réexports) par dossier de composant et pour `theme`, `i18n`, `hooks`, `utils` ; une entrée tsup ESM par sous chemin ; types émis par `tsc --emitDeclarationOnly` dans l'arborescence de `dist`. Pas de CJS par sous chemin (évite deux copies d'un même contexte React). Second choix : `dts` tsup sur chaque entrée (lent, déclarations dupliquées).
- **CSS d'un éjecté** : le module principal copié importe son `.css` ; le paquet reste chargé d'abord par la mise en page racine, donc à spécificité égale la copie l'emporte. Pas de couches CSS.
- **Dépendance au paquet** : un bloc et un éjecté déclarent `@rovia/ui@^<version>` ; la première publication sort en `1.0.0` pour que `^` accepte les versions mineures suivantes. En CI, `REGISTRY_PKG_SPEC` remplace cette valeur par `file:<archive>`.
- **Version du CLI** : `shadcn@4.21.4`, épinglée dans `packages/registry/package.json` et reprise par la CI et la doc, jamais `@latest`. Monter de version est un changement délibéré, validé par le job d'installation de la CI.
- **`components.json` minimal** (prouvé en tâche 1, sans Tailwind installé ni `globals.css` modifié) : le bloc `tailwind` doit être présent mais reste inerte.

  ```json
  {
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": true,
    "tsx": true,
    "tailwind": { "config": "", "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
    "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
    "registries": { "@rovia": "https://luxus-tempest.github.io/my-ui-kit/r/{name}.json" }
  }
  ```

  `rsc: true` est obligatoire (avec `false`, le CLI retire `"use client"`). Avec un dossier `src/`, `tailwind.css` devient `src/app/globals.css`.
- **Types de fichiers et cibles** (prouvés en tâche 1) : `.ts`/`.tsx` en `registry:ui` (éjection) ou `registry:block` (bloc), `.css` en `registry:file` ; cibles imbriquées `@components/rovia/<dossier>/<fichier>` et `@components/blocks/<nom>/<fichier>`. Le CLI ne réécrit pas les imports `@rovia/ui/<sous chemin>`, et un alias `paths` vers un dossier (avec `index.ts`) se résout au build Next 16.

## Rationale

Raisonnement et options : voir [rationale.md](rationale.md).

## Feature design

**Data model sketch** (pas de base de données ; le modèle est le format du registre) :

| Élément | Champs clés | Notes |
|---|---|---|
| `registry.json` | `name: "rovia"`, `homepage`, `items[]` | généré, jamais commité ni modifié à la main |
| Bloc `<nom>` | `type: registry:block`, `files[]` (modules du bloc + `<nom>.sample.ts`), `dependencies[]` (`@rovia/ui@^v`, `lucide-react@…`) | cible `<dossier components>/blocks/<nom>/` |
| Éjection `<dossier>` | `type: registry:ui` (ou le type validé en tâche 1), `files[]` (`.tsx`, `.ts`, `.css`, sans tests), `dependencies[]` (`@rovia/ui@^v` + paquets importés directement), `docs` (ligne `paths` à ajouter pour rediriger) | cible `<dossier components>/rovia/<dossier>/` |
| Fichier | `path`, `type`, `target` | cibles `@components/rovia/<dossier>/<fichier>` et `@components/blocks/<nom>/<fichier>` (prouvées en tâche 1) |

Invariant de nommage : les noms sont uniques entre blocs et dossiers de composants ; le build échoue sinon.

**State transitions**: aucune.

**API surface** (commandes et contrats) :

| Interface | Forme | Entrées | Sorties | Accès | Erreurs clés |
|---|---|---|---|---|---|
| Build du registre | `pnpm registry:build` | sources de `packages/ui/src` et `packages/blocks/src`, `REGISTRY_BASE_URL`, `REGISTRY_PKG_SPEC` (option) | `storybook-static/r/*.json` | local, CI | fichier manquant, nom en double, import hors dossier, import interdit dans un bloc, story absente (AC-1, AC-8) |
| Installer un bloc | `pnpm dlx shadcn@<version> add @rovia/<bloc>` | `components.json` (AC-2) | fichiers copiés, dépendances npm installées | public | élément inconnu (404) |
| Éjecter un composant | `pnpm dlx shadcn@<version> add @rovia/<dossier>` | idem | dossier copié | public | idem |
| Mettre à jour une copie | même commande avec `--overwrite` | idem | fichiers remplacés, diff visible dans git | public | aucune |
| Paquet npm | `@rovia/ui`, `@rovia/ui/<sous chemin>`, `@rovia/ui/styles.css` | `pnpm add @rovia/ui` | ESM (et CJS pour `.`), types | public | sous chemin inexistant |
| Redirection | `tsconfig.json` `paths` : `"@rovia/ui/<dossier>": ["./components/rovia/<dossier>"]` (ou `./src/components/…`) | une ligne par éjecté | blocs et application utilisent la copie | n/a | chemin disque erroné |

**Value sourcing**:

| Action | Valeur produite | Source |
|---|---|---|
| Build | version de l'en tête et de la dépendance `@rovia/ui` | `version` de `packages/ui/package.json` (ou `REGISTRY_PKG_SPEC` en CI) |
| Build | `dependencies` npm d'un élément | imports nus des fichiers, analysés (règles ci dessus), versions des `package.json` de `ui` et `blocks` |
| Build | réécriture d'un import d'éjecté | `../<dossier>/X` → `@rovia/ui/<dossier>` ; `../../utils/x` → `@rovia/ui/utils` ; idem `i18n`, `hooks`, `theme` |
| Build | cible de chaque fichier | nom de l'élément et chemin relatif dans son dossier, syntaxe de la tâche 1 |
| Build | URL de base | `REGISTRY_BASE_URL`, défaut `https://luxus-tempest.github.io/my-ui-kit` |
| Build | ligne `paths` affichée dans `docs` | nom du dossier, deux variantes (`./components/…`, `./src/components/…`) |
| Pages Storybook | commande affichée | `parameters.registry` de la story (nom d'élément) + version épinglée du CLI |
| Install d'un bloc | données affichées | `<nom>.sample.ts`, passé en props par la page d'exemple |
| CI | application vierge | `create-next-app` (TypeScript, App Router, sans Tailwind, sans `src`, pnpm) dans `$RUNNER_TEMP`, hors du workspace |
| Publication | version publiée | Changesets |

**Key invariants**:
- Un bloc n'importe que `@rovia/ui/<sous chemin>`, `react`, ses dépendances npm déclarées et ses propres fichiers.
- Un fichier éjecté ne contient aucun import relatif qui sort de son dossier.
- Le registre est toujours généré, jamais commité.
- Chaque module copié commence par `"use client"`, puis l'en tête de version.
- Le CSS du paquet est chargé avant tout CSS copié.

**Security model**: paquet et registre publics, en lecture seule, sans authentification (le dépôt est public). Seul secret : le jeton de publication npm, dans les secrets GitHub. Le déploiement Pages utilise `pages: write` et `id-token: write`, limité à `main`.

**Configuration required**:
- `NPM_TOKEN` : secret GitHub de publication (prérequis : organisation npm `rovia`, créée, jeton d'automatisation).
- `REGISTRY_BASE_URL` : URL publique du registre (la CI la remplace par `http://localhost:<port>`).
- `REGISTRY_PKG_SPEC` : remplace la version de `@rovia/ui` dans les éléments (CI : `file:<archive>`).
- GitHub Pages activé, source « GitHub Actions ».

**Critical test scenarios**:
- Happy path : application vierge sans Tailwind, mise en place, `add @rovia/connexion`, build, captures clair et sombre, vérifie **AC-2**, **AC-3**, **AC-10**, **AC-11**
- Éjection : `add @rovia/button`, une couleur changée dans la copie se voit, DataTable garde le bouton du paquet, vérifie **AC-4**, **AC-6**
- Échec attendu : un fichier de test d'échec (import `../menu/Menu` dans un bloc, import relatif non réécrit) fait échouer `registry:build`, vérifie **AC-1**
- Mise à jour : modifier un fichier copié, réinstaller avec `--overwrite`, la diff git montre le retour, vérifie **AC-5**
- Doc : retirer `parameters.registry` d'une story fait échouer le build, vérifie **AC-8**

## Build plan

Ordonné en Tracer Bullet : un fil fin de bout en bout (bloc connexion, éjection de button, CI) avant d'étendre.

1. Fait le 2026-10-17 (`shadcn@4.21.4`, Next 16.3.8 sans Tailwind ; résultats reportés dans Decision et AC-5). Prouver le CLI shadcn sans Tailwind : servir à la main un élément avec cibles imbriquées (`.tsx`, `.ts`, `.css`) et une dépendance npm, l'installer dans une application Next.js vierge sans Tailwind ; noter le `components.json` minimal, la syntaxe de cible et le type de fichier qui marchent, et vérifier que Turbopack suit les `paths`. Échec : arrêt et retour à `/architect`, satisfies **AC-11**
2. Fait le 2026-10-17. Renommer `@acme/ui` en `@rovia/ui` dans tout le dépôt, satisfies **AC-12**
3. Fait le 2026-10-17. Sous chemins : `index.ts` par dossier et pour `theme`, `i18n`, `hooks`, `utils`, entrées tsup, types par `tsc`, `exports` ; alias Vite et `tsconfig` de Storybook et de `packages/blocks`, satisfies **AC-7**, **AC-9**
4. Fait le 2026-10-17. Créer `packages/blocks`, y déplacer le bloc connexion avec props typées et `connexion.sample.ts`, faire importer la story avec `parameters.registry`, satisfies **AC-9**
5. Fait le 2026-10-17. Créer `packages/registry` et `registry:build` : analyse des imports, réécriture des éjectés, en têtes et `"use client"`, contrôles d'échec avec fichiers de test d'échec, ordre turbo après Storybook, satisfies **AC-1**, **AC-3**, **AC-4**, **AC-5**
6. Écrit et vérifié en local le 2026-10-17 (`pnpm --filter @rovia/registry smoke`), job CI `registre` pas encore exécuté. Job CI d'installation réelle (archive du paquet, registre local, application vierge, mise en place, bloc, éjection, types, build, captures), satisfies **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-10**
7. Écrit le 2026-10-17 (job `deployer`, page Docs), pas encore exécuté. Déploiement GitHub Pages de Storybook et du registre, bloc de doc qui affiche la commande depuis `parameters.registry`, satisfies **AC-8**
8. Écrit le 2026-10-17 (`.github/workflows/release.yml`, changeset majeur), attend le secret `NPM_TOKEN` et la fusion sur `main`. Publication npm par Changesets depuis la CI, première version `1.0.0`, satisfies **AC-7**

## Consequences

**Positive**:
- Une seule source de vérité : le paquet. Les correctifs arrivent partout par une mise à jour.
- Copier un écran ou transformer un composant reste une commande, sans copier toute la librairie.
- La CI prouve que l'installation marche dans une vraie application, pas seulement que le JSON est valide.

**Negative / tradeoffs**:
- Un composant éjecté n'est pas utilisé par les autres composants du paquet (DataTable garde le bouton du paquet). Pour changer partout, il faut changer la librairie elle même.
- Dépendance au CLI shadcn, qui évolue vite ; la version épinglée devra être montée à la main.
- Une copie (bloc ou éjecté) ne reçoit plus les correctifs : il faut la réinstaller et fusionner ses modifications à la main.
- L'ordre CSS de l'éjecté repose sur une convention (paquet chargé d'abord) ; une application qui la casse verra la copie perdre.
- Le renommage touche tous les imports du dépôt d'un coup.

**Neutral**:
- Deux nouveaux paquets internes (`packages/blocks`, `packages/registry`), un workflow GitHub Pages (activé), l'organisation npm `rovia` (créée).
- Les 6 autres blocs migrent dans la fonctionnalité 9 du scope.

## Follow-up

- [x] Organisation npm : `luxus` était pris, `rovia` est créée.
- [ ] Ajouter le secret GitHub `NPM_TOKEN` (jeton d'automatisation de l'organisation `rovia`) avant la tâche 8.
- [x] GitHub Pages activé, source GitHub Actions.
- [ ] `/sync` : mettre à jour `AGENTS.md` (racine, `packages/ui`) avec le nouveau nom, `packages/blocks`, `packages/registry` et la règle d'import des blocs ; l'ajouter aussi à `CONTRIBUTING.md`.
- [ ] Le starter (fonctionnalité 10) livre la mise en place AC-2 toute prête.
