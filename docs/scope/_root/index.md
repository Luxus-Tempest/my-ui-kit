# Scope : @acme/ui, ta boîte à outils d'interface

Une librairie React personnelle et très complète : des composants élémentaires dans le langage Drive × iOS, et des blocs prêts à brancher, à la shadcn, pour démarrer vite chacune de tes applications (ERP, pipeline IA, streaming, chat, messagerie, gestion documentaire, gestion de projet, landing pages artistiques et tech, automatisation). Tu en es le premier utilisateur.

**Build approach:** Tracer Bullet (un lot par application : ses composants manquants, ses blocs et leur entrée dans le registre, utilisables de bout en bout dès que le lot est fini).
**Workflow:** Prototype (rien après `/develop`, qui fait sa propre vérification : typage, rendu de la story). Le niveau de rigueur par défaut. Les conventions du dépôt restent valables : chaque composant garde ses tests de comportement et axe, chaque bloc sa vérification axe et sa capture visuelle. `/architect` est le premier arrêt recommandé quand une décision est due, mais tu peux le sauter si tu sais déjà comment construire. Une fonctionnalité peut porter son propre niveau (par exemple `· Alpha`).

_Ce sont des recommandations pour garder ton travail en ordre, pas des obligations. Saute ce qui ne te sert pas : si tu sais déjà comment construire une fonctionnalité, lance `/develop` et passe `/architect`. C'est toi qui décides quand une fonctionnalité est `done`._

## Avancement par épique

- [Socle](socle.md) : ce qui existe déjà, plus les fondations du registre et du starter. 1 / 5 (dont 1 `in-progress`), plus 5 `existing`.
- [Lot 1, ERP](erp.md) : formulaires, saisies avancées, bloc CRUD et documents imprimables. 0 / 8.
- [Lot 2, IA, chat et streaming](ia.md) : réponses en streaming, étapes d'agent, lecteur média, messagerie complète. 0 / 7.
- [Lot 3, gestion documentaire](documents.md) : visionneuse, éditeur riche, explorateur. 0 / 3.
- [Lot 4, gestion de projet](projets.md) : Kanban, calendrier, Gantt. 0 / 4.
- [Lot 5, landing pages](landing.md) : effets expressifs, sections marketing, portfolio. 0 / 4.
- [Lot 6, automatisation et pipeline IA](automatisation.md) : éditeur de nœuds, suivi d'exécution. 0 / 3.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Composants de base (70 familles, graphiques, messagerie) | Foundation | existing |
| 2 | Thème Drive × iOS, marque, densité, RTL, langues | Foundation | existing |
| 3 | Documentation Storybook et chaîne qualité | Foundation | existing |
| 4 | Blocs Storybook (7 écrans) | Foundation | existing |
| 5 | Application d'exemple | Foundation | existing |
| 6 | DataTable ERP | Foundation | in-progress |
| 7 | Conventions et contexte IA du dépôt | Foundation | planned |
| 8 | Registre de blocs installables | Foundation | done |
| 9 | Blocs existants dans le registre | Skeleton | planned |
| 10 | Starter d'application | Skeleton | planned |
| 11 | Formulaire avec validation | Slice 1 | planned |
| 12 | Sélection multiple et tags | Slice 1 | planned |
| 13 | Saisies spécialisées | Slice 1 | planned |
| 14 | Petits retours et confirmations | Slice 1 | planned |
| 15 | Bloc CRUD | Slice 1 | planned |
| 16 | Bloc document imprimable | Slice 1 | planned |
| 17 | Blocs auth complets | Slice 1 | planned |
| 18 | Blocs pages système | Slice 1 | planned |
| 19 | Texte en streaming et Markdown | Slice 2 | planned |
| 20 | Bloc de code et copie | Slice 2 | planned |
| 21 | Saisie de prompt enrichie | Slice 2 | planned |
| 22 | Étapes d'agent et appels d'outils | Slice 2 | planned |
| 23 | Lecteur média et direct | Slice 2 | planned |
| 24 | Centre de notifications | Slice 2 | planned |
| 25 | Blocs IA et messagerie | Slice 2 | planned |
| 26 | Visionneuse de fichiers | Slice 3 | planned |
| 27 | Éditeur de texte riche | Slice 3 | planned |
| 28 | Bloc gestion documentaire | Slice 3 | planned |
| 29 | Kanban | Slice 4 | planned |
| 30 | Grand calendrier et planning | Slice 4 | planned |
| 31 | Gantt | Slice 4 | planned |
| 32 | Blocs gestion de projet | Slice 4 | planned |
| 33 | Couche d'effets expressifs | Slice 5 | planned |
| 34 | Sections marketing | Slice 5 | planned |
| 35 | Galerie et portfolio | Slice 5 | planned |
| 36 | Modèles de landing (art, tech) | Slice 5 | planned |
| 37 | Éditeur de nœuds | Slice 6 | planned |
| 38 | Suivi d'exécution et journaux | Slice 6 | planned |
| 39 | Blocs automatisation | Slice 6 | planned |

## Deferred

Hors de ce passage, gardés pour que le plan reste honnête.
- **Visite guidée** (Tour) : mettre en valeur une fonctionnalité au premier lancement.
- **Liste de transfert et sélection en arbre** (TransferList, TreeSelect) : à construire quand un écran en aura besoin.
- **Signature et QR code** : petits composants de niche, à envelopper autour d'une librairie.
- **Générateur de thème visuel** : choisir sa marque et ses rayons dans une page, copier les jetons · needs a decision.
- **Kit Figma aligné** (voir `figma.txt`) : utile seulement si un designer rejoint le travail · needs a decision.

## Legend

**La case de décision.** Chaque fonctionnalité en a exactement une, la sous tâche dont le libellé finit par `(spec)`. Les skills la repèrent à ce suffixe. Toutes les autres cases sont des cases d'exécution.

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | une case : `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` à la capture de la spec | `Design it` cochée, spec liée, `Build it: /develop <feature>` avec 2 à 5 jalons |
| `in-progress` (building) | `/develop` | les jalons se cochent, le chemin du code est renseigné |
| `done` | toi, quand tu le décides ; `/sync` réconcilie | en Prototype, le point suggéré est la fin de `/develop` |

- **Prochaine étape** = la première case non cochée.
- **needs a decision** = lance `/architect` d'abord ; sinon directement `/develop`.
- **Les tâches détaillées vivent dans la spec** (`## Build plan`), pas ici.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (avant ce workflow) et `dropped` (retiré, gardé pour l'historique).
- **Tag de niveau** à côté d'un titre (par exemple `· Alpha`) : rigueur propre à cette fonctionnalité. Sans tag, elle hérite de Prototype.
- **Ligne de pointeurs** (`spec <n> · code in <path>`) : ajoutée par `/architect` puis `/develop`.
