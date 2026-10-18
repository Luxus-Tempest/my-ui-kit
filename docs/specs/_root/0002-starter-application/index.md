# 0002. Starter d'application Next.js (`templates/next`)

**Date**: 2026-10-18
**Status**: In Progress

## Summary

Une nouvelle application se crée en une commande, `pnpm create next-app mon-app --example https://github.com/Luxus-Tempest/my-ui-kit/tree/starter/templates/next`, et démarre complète : coque avec barre latérale, connexion et inscription, tableau de bord, paramètres, thème clair et sombre, français, anglais et arabe (RTL), palette ⌘K, pages système, SEO, qualité et CI. Les blocs qu'elle contient sont des copies du registre `@rovia`, régénérées par un script et contrôlées par la CI. L'authentification n'impose rien : une seule règle, seul `lib/auth.ts` connaît le fournisseur.

## Requirements

**User stories**:
- En tant que développeur de mes applications, je veux créer une application prête à l'emploi en une commande, pour commencer directement par mes écrans métier.
- En tant que développeur, je veux brancher n'importe quel fournisseur d'authentification sans toucher aux écrans.
- En tant que mainteneur, je veux que le modèle suive la librairie et le registre sans copie manuelle, et ne propose jamais un bloc plus récent que le paquet publié.

**Acceptance criteria**:
- **AC-1**: `pnpm create next-app mon-app --example https://github.com/Luxus-Tempest/my-ui-kit/tree/starter/templates/next` crée une application qui installe `@rovia/ui` depuis npm, puis `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` et `pnpm test:e2e` réussissent sans modification.
- **AC-2**: Routes : `/` (accueil public), `/connexion`, `/inscription` (groupe `(auth)`), `/tableau-de-bord`, `/parametres` (groupe `(app)`, dans la coque). Une route inconnue affiche la 404 (composée avec `EmptyState`, « Page introuvable », lien vers l'accueil) ; une erreur affiche la page d'erreur avec « Réessayer » ; chaque groupe a son `loading.tsx` (squelettes).
- **AC-3**: La coque (bloc `coque-application`, nouveau dans le registre) affiche la barre latérale réductible (⌘B), le fil d'Ariane (libellé du groupe de navigation, puis libellé de la page), le menu utilisateur (nom, rôle, « Se déconnecter »), la bascule de thème et le menu de langue. Sa navigation vient d'un seul fichier, `config/navigation.ts`.
- **AC-4**: Thème clair, sombre ou système, sans flash au chargement, mémorisé par navigateur.
- **AC-5**: Langue français, anglais ou arabe, mémorisée dans le cookie `locale` ; `<html lang dir>` est posé par le serveur (RTL dès le premier rendu en arabe) ; les libellés des composants du kit sont traduits (`localeEn`, `localeAr`). Les textes propres au modèle (blocs, coque, accueil, 404, ⌘K) restent en français, modifiables dans le code.
- **AC-6**: Authentification : les pages, actions et la coque n'appellent que `lib/auth.ts` (`getSession`, `requireSession`, `signIn`, `signUp`, `signOut`). L'adaptateur de démonstration accepte toute adresse valide et un mot de passe d'au moins 8 caractères. Sans session, une page `(app)` redirige vers `/connexion?suivant=<chemin>` ; après connexion, retour vers `suivant` s'il est un chemin interne (`^/(?![/\\])`), sinon `/tableau-de-bord`. Une erreur (identifiants refusés, conditions non acceptées, fournisseur non branché) s'affiche dans le bloc.
- **AC-7**: Quand `NODE_ENV=production` et `AUTH_DEMO` n'est pas `true`, l'adaptateur de démonstration refuse toute connexion avec le message « Branche ton fournisseur dans lib/auth.ts ». Avec `AUTH_DEMO=true` en production, un avertissement est journalisé au démarrage et un bandeau « Mode démonstration » s'affiche dans la coque.
- **AC-8**: Palette ⌘K : pages de `config/navigation.ts` (groupe « Aller à »), actions « Thème clair », « Thème sombre », « Thème du système », « Français », « English », « العربية », « Se déconnecter ». Un seul Toaster, monté à la racine.
- **AC-9**: SEO : `config/site.ts` alimente le titre (« %s · Nom », titre de page = libellé de navigation), la description, `sitemap.xml` (`/`, `/connexion`, `/inscription`), `robots.txt` (interdit les `href` de `config/navigation.ts`), une image de partage générée, le manifeste (icônes PNG 192 et 512, SVG), l'icône, et `themeColor` clair `#f6f8fc` et sombre `#131416`.
- **AC-10**: Qualité : TypeScript strict, ESLint (`eslint .`, configuration Next.js) et Prettier propres, les copies du registre exclues des deux ; `.env.example` documente chaque variable ; Playwright ouvre chaque route, vérifie l'absence d'erreur console, passe axe en clair et en sombre, bascule l'arabe ; un workflow GitHub Actions lance types, lint, build et tests.
- **AC-11**: Accessibilité : lien « Aller au contenu » vers `#contenu` (la zone de page de la coque, ou le `<main>` du groupe `(auth)` et de l'accueil), un seul titre de niveau 1 par page.
- **AC-12**: `components.json` préconfiguré (registre `@rovia`, comme la spec 0001) ; `tsconfig.json` contient `@/*` et un exemple de redirection d'un éjecté en commentaire ; `pnpm dlx shadcn@4.21.4 add @rovia/drive` fonctionne tout de suite.
- **AC-13**: Les blocs du modèle sont des copies exactes du registre (mêmes octets que `shadcn add`). `pnpm template:sync` les régénère avec la version de `@rovia/ui` et leurs dépendances npm ; `pnpm template:check` échoue en CI s'ils diffèrent. La PR de version (Changesets) lance aussi `template:sync`.
- **AC-14**: Dans la CI du dépôt, le modèle est copié hors du workspace, installé avec l'archive locale de `@rovia/ui`, puis types, lint, build et Playwright passent.
- **AC-15**: Après chaque publication npm, le workflow Publication pousse l'état publié de `main` sur la branche `starter` : la commande de création ne propose jamais un bloc qui attend une version non publiée.

## Decision

**Chosen option**: Modèle `templates/next` dans ce dépôt, créé par `create-next-app --example` depuis la branche `starter`, blocs copiés et synchronisés depuis le registre, authentification derrière un module unique.

Décisions de détail (choix, pourquoi, second choix) :
- **Emplacement** : `templates/next`, hors des globs de `pnpm-workspace.yaml`, sans lockfile ; en local on y travaille avec `pnpm install --ignore-workspace`. Le dépôt doit rester public (`--example` télécharge sans authentification).
- **Branche `starter`** : mise à jour par le workflow Publication après `changeset publish` (`git push origin HEAD:starter --force` quand une version a été publiée). Second choix : pointer sur `main` (risque de blocs plus récents que le paquet).
- **Nouveau bloc `coque-application`** (`packages/blocks`) : `SidebarProvider`, barre latérale réductible, `AppBar` (fil d'Ariane, slot `actions`, menu utilisateur), zone de page `<div id="contenu" tabIndex={-1}>` qui reçoit `children`. Props : `appName`, `orgName?`, `logo?`, `navigation: { label?: string; items: { href: string; label: string; icon: LucideIcon; badge?: number }[] }[]`, `activeHref`, `user: { name, role }`, `onSignOut`, `actions?: ReactNode`, `banner?: ReactNode`, `linkComponent?` (défaut `<a>`). Sans Toaster.
- **Blocs modifiés** : `inscription` reçoit `error?: string | null` ; les `Toaster` d'`application` et `parametres` sont retirés (le Toaster est à la racine de l'application ; les stories en montent un).
- **Frontière client et serveur** :
  - `lib/locale.ts` (serveur) : `LOCALES = { fr: { tag: "fr-FR", dir: "ltr" }, en: { tag: "en-US", dir: "ltr" }, ar: { tag: "ar-MA", dir: "rtl" } }` (`ar-MA` donne des chiffres latins) et `getLocale()` (cookie, défaut `fr`) ; aucune fonction du paquet n'est appelée côté serveur.
  - `components/providers.tsx` (client) reçoit le code de langue, choisit le catalogue, monte `ThemeProvider` de next-themes, `DirectionProvider` et `LocaleProvider` du kit, et le Toaster.
  - `components/app-shell.tsx` (client) importe `config/navigation.ts`, `Link`, `usePathname`, et rend `CoqueApplication` ; le layout serveur `(app)` ne lui passe que `user`, `demo` et `signOutAction`.
  - Chaque page qui affiche un bloc passe par un petit composant client qui importe le bloc et son fichier `*.sample.ts` (les copies portent `"use client"`).
- **Authentification** :
  - `lib/auth.ts` exporte `Session = { user: { id, name, email, role } }`, `getSession()`, `requireSession(suivant)` (redirige si absente), `signIn({ email, password, remember })`, `signUp({ name, email, password, acceptTerms })`, `signOut()`. Chaque fonction de connexion renvoie `{ error?: string }` et ne lève jamais d'exception (Next masque les messages en production).
  - `proxy.ts` neutre : il ne fait que transmettre le chemin demandé dans l'en tête `x-pathname`, lu par `requireSession` pour construire `suivant`. Aucune logique d'authentification dans le proxy.
  - `requireSession` est appelé par `(app)/layout.tsx`, par chaque page `(app)` et par chaque action qui en a besoin.
  - Démo : `name` = partie locale de l'adresse avec majuscule initiale (ou le nom saisi à l'inscription), `role` = « Membre », `id` = SHA-256 de l'adresse. Le cookie `session` contient ce JSON encodé en base64 UTF-8 (`Buffer`), httpOnly, `sameSite=lax`, `secure` en production, 7 jours si « Rester connecté », sinon cookie de session. Validation serveur : adresse valide, mot de passe de 8 caractères ou plus, conditions acceptées.
  - Pages `(auth)` : un composant client par page, avec `useTransition`, l'état d'erreur et `suivant` (lu depuis `await searchParams` et lié à l'action).
- **Thème** : `next-themes` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`), comme `apps/example` ; le `ThemeProvider` du kit n'est pas utilisé (la classe `.dark` suffit aux jetons).
- **Polices** : Inter (latin) et Noto Sans Arabic via `next/font/google`, en variables CSS combinées dans `--ui-font-sans`.
- **Rendu** : la lecture du cookie `locale` dans le layout racine rend toutes les routes dynamiques ; c'est accepté (applications métier).
- **Versions** : `next` 16.3.8, `react` et `react-dom` ^19.0.0, `next-themes` ^0.4.6, `tailwindcss` et `@tailwindcss/postcss` ^4.3.0, `typescript` ^5.6.0, `eslint-config-next` 16.3.8, `eslint` ^9, `prettier` ^3, `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0, `lucide-react` 1.48.0, `packageManager: pnpm@10.28.0`. `globals.css`, `postcss.config.mjs` et le pont `@theme inline` des jetons viennent d'`apps/example`.
- **Qualité** : `eslint.config.mjs` et `.prettierignore` ignorent `components/blocks` ; `tsconfig.json` strict, pas plus que `packages/blocks`. Playwright : `webServer` en `next start` avec `AUTH_DEMO=true` ; un second serveur sans `AUTH_DEMO`, sur un autre port, sert au test de refus.
- **Synchronisation** : `templates/next/rovia.json` (`{ "blocks": ["coque-application", "connexion", "inscription", "tableau-de-bord", "parametres"] }`). `pnpm template:sync` (`packages/registry`) appelle `buildRegistry`, écrit chaque `content` tel quel à sa cible (`@components/` → `templates/next/components/`), fusionne les `dependencies` de chaque élément dans `templates/next/package.json` (dont `@rovia/ui@^<version>`). `pnpm template:check` refait l'opération dans un dossier temporaire et compare. Le test d'installation réelle (spec 0001) compare une fois les octets écrits par `shadcn add` à ceux du script.
- **Version** : dans `release.yml`, `changesets/action` reçoit `version: pnpm changeset version && pnpm template:sync`.

## Rationale

Raisonnement et options : voir [rationale.md](rationale.md).

## Feature design

**Data model sketch**:

| Structure | Champs | Source |
|---|---|---|
| `siteConfig` (`config/site.ts`) | `name`, `description`, `url` (`NEXT_PUBLIC_SITE_URL`, défaut `http://localhost:3000`) | fichier du modèle |
| `navigation` (`config/navigation.ts`) | groupes `{ label?, items: { href, label, icon, badge? }[] }` | fichier du modèle |
| `Session` | `user: { id, name, email, role }` | `lib/auth.ts` |
| Cookie `session` (démo) | JSON base64 UTF-8, httpOnly, `sameSite=lax`, `secure` en production, 7 jours ou session | adaptateur de démonstration |
| Cookie `locale` | `fr` · `en` · `ar`, 1 an | menu de langue |
| `rovia.json` | `blocks: string[]` | fichier du modèle |

**State transitions**: session : absente → présente (`signIn`, `signUp`) → absente (`signOut`).

**API surface**:

| Interface | Forme | Entrées | Sorties | Accès | Erreurs clés |
|---|---|---|---|---|---|
| `signInAction` | action serveur | email, mot de passe, `remember`, `suivant` | redirection ou `{ error }` | public | identifiants refusés, démo refusée en production |
| `signUpAction` | action serveur | nom, email, mot de passe, conditions | redirection ou `{ error }` | public | conditions non acceptées, mot de passe court |
| `signOutAction` | action serveur | aucune | redirection `/connexion` | session | aucune |
| `setLocaleAction` | action serveur | code | cookie posé, `router.refresh()` côté client | public | code inconnu : langue actuelle conservée |
| `proxy.ts` | proxy Next 16 | requête | en tête `x-pathname` | tous | aucune |
| Métadonnées | `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx` | `siteConfig`, `navigation` | fichiers | public | aucune |

**Value sourcing**:

| Action | Valeur | Source |
|---|---|---|
| Layout racine | `lang`, `dir` | cookie `locale` → `LOCALES` de `lib/locale.ts` |
| Providers | catalogue des composants | code de langue → `localeEn` / `localeAr` / aucun pour `fr` |
| Coque | nom, rôle, initiales | `getSession()` (initiales dérivées du nom) |
| Coque | entrée active, fil d'Ariane, titre de page | `usePathname()` comparé aux `href` de `config/navigation.ts` |
| `requireSession` | chemin de retour | en tête `x-pathname` posé par `proxy.ts` |
| Démo | `name`, `role`, `id` | partie locale de l'adresse (ou nom saisi), « Membre », SHA-256 de l'adresse |
| SEO | URL absolue | `NEXT_PUBLIC_SITE_URL` via `lib/env.ts` |
| Sitemap, robots | listes | pages publiques fixes ; `href` de `config/navigation.ts` |
| `themeColor` | couleurs | `#f6f8fc` (clair), `#131416` (sombre), valeurs de `--ui-app` |
| Pages à blocs | données | `*.sample.ts` des blocs, via un composant client |
| `template:sync` | version, dépendances, contenu | `packages/ui/package.json`, `dependencies` et `content` des éléments du registre |

**Key invariants**:
- Seul `lib/auth.ts` connaît le fournisseur ; `proxy.ts` ne contient aucune logique d'authentification.
- `suivant` vérifie `^/(?![/\\])`, sinon `/tableau-de-bord`.
- Les fichiers de `templates/next/components/blocks` sont identiques à la sortie du registre.
- La branche `starter` ne contient que des blocs compatibles avec une version publiée de `@rovia/ui`.
- Un seul Toaster par application.

**Security model**: pages et actions `(app)` protégées par `requireSession` (pas seulement le layout) ; cookies httpOnly, `sameSite=lax`, `secure` en production ; pas de redirection ouverte ; en têtes `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` (CSP laissée à chaque application, emplacement commenté). Le cookie de démo n'est pas signé : il n'est accepté en production qu'avec `AUTH_DEMO=true`, avec avertissement et bandeau.

**Configuration required**:
- `NEXT_PUBLIC_SITE_URL` : URL publique (SEO, image de partage).
- `AUTH_DEMO` : `true` pour garder la démo en production (tests, présentation).

**Critical test scenarios**:
- Happy path : connexion de démo, tableau de bord, sombre, arabe (RTL au rendu serveur), déconnexion, vérifie **AC-1**, **AC-3** à **AC-6**
- Échec : sans `AUTH_DEMO` en production, message « Branche ton fournisseur » ; `suivant=//evil.com` mène à `/tableau-de-bord`, vérifie **AC-6**, **AC-7**
- Synchronisation : un bloc modifié sans `template:sync` fait échouer `template:check`, vérifie **AC-13**

## Build plan

Ordonné en Tracer Bullet : un fil fin (création, connexion, coque, tableau de bord) prouvé en `next start` avec les frontières client et serveur en place, puis l'épaisseur.

1. Fait le 2026-10-18. Blocs : `coque-application` (props, sample, story `Blocs/Coque d'application` avec `parameters.registry`), `error` sur `inscription`, `Toaster` retiré d'`application` et `parametres` (stories ajustées), satisfies **AC-3**, **AC-6**, **AC-8**
2. Fait le 2026-10-18. `templates/next` minimal : `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `globals.css`, `.gitignore`, layout racine, `lib/locale.ts`, providers, `proxy.ts`, `lib/auth.ts` (démo), `(auth)` connexion et inscription, `(app)` layout + `app-shell` + tableau de bord, `components.json`, satisfies **AC-1**, **AC-2**, **AC-6**, **AC-7**, **AC-12**
3. Fait le 2026-10-18. `template:sync` et `template:check`, premières copies générées, satisfies **AC-13**
4. Écrit le 2026-10-18 et vérifié en local (`pnpm --filter @rovia/registry template-smoke`) ; job CI `starter` et branche `starter` pas encore exécutés. Job CI du dépôt (modèle hors workspace, archive locale, types, lint, build, Playwright, `template:check`) ; `release.yml` : `template:sync` dans la version, branche `starter` après publication, satisfies **AC-13**, **AC-14**, **AC-15**
5. Fait le 2026-10-18. Langue par cookie (menu, action) et bascule de thème, polices, satisfies **AC-4**, **AC-5**
6. Fait le 2026-10-18. Paramètres, palette ⌘K, pages système et chargement, accueil public, lien d'évitement, bandeau de démo, satisfies **AC-2**, **AC-7**, **AC-8**, **AC-11**
7. Fait le 2026-10-18. SEO (config, métadonnées, sitemap, robots, manifeste, icônes, image de partage, couleurs) et en têtes de sécurité, satisfies **AC-9**
8. Fait le 2026-10-18. Qualité : ESLint, Prettier, `.env.example`, `lib/env.ts`, Playwright avec axe et test de refus, workflow CI du modèle, README ; commande de création dans le README racine et *Introduction › Bienvenue*, satisfies **AC-10**, **AC-11**

## Consequences

**Positive**:
- Une application démarre complète en une commande, avec les conventions du kit en place.
- Aucun fournisseur imposé ; changer de fournisseur ne touche que `lib/auth.ts`.
- Le modèle ne dérive pas et ne devance jamais le paquet publié.

**Negative / tradeoffs**:
- Le modèle ajoute des dépendances à suivre (Next.js, ESLint, Playwright…).
- Toutes les routes sont dynamiques (cookie de langue).
- L'adaptateur de démonstration doit être remplacé dans chaque application ; garde de production et bandeau le rendent visible.
- Pas d'URL par langue ; une landing multilingue référencée devra ajouter `/[lang]`.
- Un en tête de version change à chaque publication : la PR de version touche aussi le modèle.

**Neutral**:
- Nouveau bloc `coque-application`, réutilisable hors du starter.
- `apps/example` reste l'application de démonstration interne.

## Follow-up

- [ ] Après la première publication qui crée la branche `starter` : créer une app avec la commande réelle et la démarrer (vérification manuelle de **AC-1**).
- [ ] `/sync` : documenter `templates/next`, `template:sync`, la branche `starter` et la règle « seul `lib/auth.ts` connaît le fournisseur » dans les `AGENTS.md`.
- [ ] Plus tard, si une landing multilingue en a besoin : routes `/[lang]` (fonctionnalité 34).
