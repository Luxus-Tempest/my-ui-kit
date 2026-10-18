# 0002. Starter d'application : raisonnement

Le dossier de décision de [index.md](index.md). `/develop` n'a pas besoin de le lire.

## Context

Tu prévois huit applications (ERP, pipeline IA, streaming, chat, messagerie, gestion documentaire, gestion de projet, landing pages, automatisation). Le paquet `@rovia/ui` et le registre `@rovia` existent (spec 0001), mais chaque nouvelle application repart d'un `create-next-app` vide : thème, langues, RTL, coque, écrans d'auth, SEO, qualité et CI sont à refaire à chaque fois, et différemment.

Forces : un seul mainteneur ; Next.js App Router déjà utilisé par `apps/example` ; des blocs installables qui risquent de dériver si on les copie à la main ; aucun fournisseur d'authentification choisi, et des besoins différents selon les applications ; le souhait d'un démarrage « complet, pro et élégant » sans contrainte imposée.

Sans décision, chaque application porte ses propres variantes de ces fondations, et les corrections ne se propagent pas.

## Options considered

### Option 1: `templates/next` + `create-next-app --example` (choisie)

Le modèle vit dans ce dépôt ; l'outil officiel de Next.js le copie depuis GitHub.

**Pros**:
- Aucun outil à publier ni à maintenir ; commande connue.
- Le modèle évolue avec la librairie, testé dans la même CI.

**Cons**:
- Pas de questions interactives (quels blocs, avec ou sans Tailwind) ; tout le monde part du même modèle.
- La création copie l'état de `main` uniquement.

### Option 2: CLI maison `create-rovia-app`

Un paquet npm qui pose des questions et assemble l'application.

**Pros**:
- Options à la carte, étapes après création (installation de blocs choisis).

**Cons**:
- Un produit de plus à publier, tester et maintenir pour un seul utilisateur.

### Option 3: Dépôt modèle GitHub séparé

**Pros**:
- « Use this template » sur GitHub, historique propre.

**Cons**:
- Vit loin de la librairie : dérive dès la première mise à jour des blocs.

### Blocs : copies synchronisées ou installation après création

Les copies synchronisées font démarrer l'application complète et restent à jour grâce au contrôle en CI. Installer après création garderait le modèle léger mais l'application ne démarrerait pas complète, ce qui contredit le but.

### Authentification : écrans seulement, fournisseur imposé, ou rien

Tu as demandé « une seule règle, grande flexibilité, aucune contrainte ». Imposer un fournisseur contredit « aucune contrainte » ; ne rien fournir contredit « complet ». Un adaptateur unique (`lib/auth.ts`) avec une démonstration fonctionnelle donne une application qui marche dès la création, et un seul endroit à changer.

## Rationale

L'option 1 répond aux deux contraintes fortes : un seul mainteneur (rien de plus à publier) et aucune dérive (même dépôt, même CI, blocs générés). Le prix, l'absence de questions interactives, est faible : le modèle est fait pour être modifié après création, et le registre permet d'ajouter ou de retirer des blocs en une commande.

La garde de session dans `(app)/layout.tsx` plutôt qu'un `proxy.ts` laisse chaque fournisseur appliquer sa propre méthode (certains imposent leur intergiciel) sans conflit. Le cookie de langue évite d'imposer des URL par langue à des applications métier, tout en donnant le RTL dès le rendu serveur.

Les ajouts « pro » (pages système, ⌘K, SEO, en têtes de sécurité, lien d'évitement, axe en Playwright, CI) sont ceux que chaque application finirait par écrire ; les mettre dans le modèle coûte une fois.

## Relecture (2026-10-18)

Une relecture en lecture seule (même modèle) a relevé 18 points, tous intégrés à la version actuelle. Les plus importants :
- **Frontière client et serveur** : `getLocaleDirection`, `localeEn`, `localeAr` vivent dans un module `"use client"` du paquet, et les fichiers `*.sample.ts` copiés portent `"use client"` ; d'où `lib/locale.ts` côté serveur, des composants clients pour la coque et les pages à blocs.
- **Garde et retour** : un layout ne connaît pas le chemin demandé ; d'où un `proxy.ts` neutre qui transmet le chemin, et `requireSession` dans les pages et actions (le layout seul n'est pas une frontière de sécurité).
- **Redirection ouverte** : `//evil.com` passait la règle « commence par `/` ».
- **Version** : sans `template:sync` dans la PR de version, `template:check` casserait `main` ; sans branche `starter`, la commande de création pouvait proposer un bloc plus récent que le paquet publié.
- **Tests** : la garde de production aurait bloqué les tests Playwright en `next start` ; ils tournent avec `AUTH_DEMO=true`, et un second serveur teste le refus.
