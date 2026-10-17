# 0001. Registre installable : raisonnement

Le dossier de décision de [index.md](index.md). `/develop` n'a pas besoin de le lire.

## Context

`@acme/ui` a plus de 70 familles de composants et 7 blocs, mais rien ne sort du dépôt : le paquet n'est publié nulle part (`@acme` est un nom générique), et les blocs sont des stories Storybook qu'aucune application ne peut installer. L'objectif est une librairie « plug and play » à la shadcn pour huit applications personnelles prévues (ERP, pipeline IA, streaming, chat, messagerie, gestion documentaire, gestion de projet, landing pages, automatisation).

Forces en présence : un seul mainteneur, donc tout ce qui se fait à la main finit par dériver ; une chaîne qualité déjà exigeante (tests, axe, captures, budget de poids) qu'il faut garder ; des composants écrits sans Tailwind (CSS à jetons, styles en ligne dans les blocs), alors que l'écosystème shadcn suppose souvent Tailwind ; des imports internes relatifs entre dossiers de composants ; un CSS dont l'ordre compte (Toggle après Button, ContextMenu après Menu) ; un dépôt GitHub public.

Sans décision, chaque nouvelle application recopie des écrans à la main depuis Storybook, et les correctifs ne se propagent jamais.

> ⚠️ Premise note: tu as d'abord choisi « tout copié, shadcn pur », puis « les deux voies ». Copier 70 composants dans 8 applications multiplie la maintenance par 8. La relecture de la première version a montré que la copie complète (socle copié, ordre CSS par couches, `"use client"` absent des sources, CSS non chargé quand un composant en importe un autre par chemin relatif) coûtait beaucoup pour un gain faible. Tu as retenu le modèle « paquet partout + éjection », qui garde l'esprit shadcn (posséder le code qu'on veut transformer) sans copier la librairie.

## Options considered

### Option 1: Hybride (composants en paquet, blocs copiés)

Les composants restent un paquet npm, seuls les blocs passent par le registre.

**Pros**:
- Les correctifs de composants arrivent partout par une mise à jour.
- Registre petit (seulement les blocs).

**Cons**:
- Impossible de prendre possession d'un composant pour le transformer dans une application.
- Ne correspond pas à l'envie de pouvoir tout copier.

### Option 2: Tout copié, shadcn pur

Composants et blocs passent uniquement par le registre ; rien n'est publié.

**Pros**:
- Contrôle total dans chaque application, aucune dépendance à un paquet.
- Un seul canal de distribution.

**Cons**:
- Chaque correctif est à réinstaller dans chaque application ; les copies divergent.
- Le socle (thème, i18n, jetons) est copié partout, et ses mises à jour aussi.

### Option 3: Les deux voies sur une seule source (première version de la spec)

Chaque composant et chaque bloc est dans le registre en copie complète (socle compris), et le paquet est aussi publié ; deux saveurs de blocs.

**Pros**:
- Le choix se fait par application, sans changer les blocs.

**Cons**:
- La relecture a relevé 21 points, dont des défauts de conception : ordre CSS non garanti dans une même famille, CSS d'application vierge qui écrase les composants en couche, `"use client"` absent des sources, CSS non chargé quand un composant en importe un autre par chemin relatif, socle et traductions qui dérivent entre versions.
- Deux modes, deux sorties CSS, deux saveurs de blocs à tester à chaque PR.

### Option 5: Paquet partout + éjection (choisie)

Le paquet est la seule source installée ; le registre distribue les blocs (copiés) et l'éjection d'un dossier de composant, dont les imports vers le reste sont réécrits vers le paquet.

**Pros**:
- Un seul CSS de référence, pas de socle copié, pas de couches.
- On possède seulement ce qu'on veut transformer.

**Cons**:
- Un éjecté n'est pas repris par les autres composants du paquet.
- L'ordre CSS repose sur la convention « paquet chargé d'abord ».

### Option 4: Blocs en paquet aussi

Les blocs deviennent des composants importables (`<PageConnexion />`) avec des props.

**Pros**:
- Rien à copier, tout se met à jour.

**Cons**:
- Tout ce qu'une prop ne prévoit pas est impossible ; un écran est le code qu'on veut le plus modifier.

### Installeur : CLI shadcn, CLI maison, ou copie depuis la doc

Le CLI shadcn (choisi) apporte espaces de noms, résolution récursive des dépendances, installation des paquets npm et un format documenté ; le coût est une dépendance à un outil qui bouge et l'incertitude sur Tailwind (levée par la tâche 1). Un CLI maison donnerait le contrôle total mais serait un produit de plus à maintenir ; il reste la solution de repli si la tâche 1 échoue, en s'appuyant sur l'API programmatique `shadcn/registry`. La copie depuis la doc ne gère ni plusieurs fichiers ni les dépendances.

## Rationale

Le besoin réel est double : démarrer vite avec des écrans complets, et pouvoir pousser un composant hors de ses limites pour une application particulière (landing artistique, éditeur de nœuds). L'option 5 sert les deux avec une seule source installée. Les blocs, qui sont le code qu'on modifie le plus, sont copiés ; les composants restent dans le paquet tant qu'on ne les transforme pas, et l'éjection rend la possession possible dossier par dossier. Pour un seul mainteneur et huit applications, c'est ce qui garde les correctifs automatiques là où ils comptent.

Le CLI shadcn est retenu parce qu'il résout déjà ce qui coûte cher à écrire (espaces de noms, installation des dépendances npm, `--overwrite`), et que tu le connais. Le risque Tailwind n'est documenté ni dans un sens ni dans l'autre : il est placé en première tâche, avec un arrêt explicite.

Les sous chemins `@rovia/ui/<dossier>` sont le seul point de contact des blocs et des éjectés avec la librairie. Ils permettent aussi la redirection par `paths` : une application qui éjecte un composant peut faire utiliser la copie à ses blocs, sans toucher au code des blocs.

## References

**Project sources**:
- `CONTRIBUTING.md` : anatomie d'un composant, ordre des familles CSS, règle des effets de bord au chargement.
- `packages/ui/AGENTS.md` : barrel sans `"use client"`, `sideEffects` limité au CSS.
- `packages/ui/tsup.config.ts` : un point d'entrée par module de composant.
- `docs/scope/_root/socle.md` : fonctionnalités 8, 9 et 10.

**Practices & standards**:
- Source unique, artefacts générés (ne jamais commiter ni éditer à la main une sortie de build).
- Tester l'installation comme un utilisateur (test de fumée de bout en bout plutôt que validation de schéma seule).
- Éjection (« eject ») : sortir un seul élément d'un outil géré pour le posséder, le reste continuant d'être mis à jour.
- Relecture indépendante de la spec (même modèle, en lecture seule), dont les points ont été intégrés à la version actuelle.

**Links** (vérifiés pendant la conception, le 2026-10-17) :
- shadcn, registry.json : https://ui.shadcn.com/docs/registry/registry-json
- shadcn, registry-item.json : https://ui.shadcn.com/docs/registry/registry-item-json
- shadcn, démarrer un registre (build, sortie `public/r`) : https://ui.shadcn.com/docs/registry/getting-started
- shadcn, espaces de noms : https://ui.shadcn.com/docs/registry/namespace
- shadcn, components.json : https://ui.shadcn.com/docs/components-json
- shadcn, API programmatique du registre (repli si CLI maison) : https://ui.shadcn.com/docs/registry/api-reference
- shadcn, changelog : https://ui.shadcn.com/docs/changelog
