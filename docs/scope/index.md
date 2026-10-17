# Scope du monorepo

Carte des scopes de ce dépôt. Chaque ligne renvoie au scope d'un espace de travail, avec son avancement (fait / total, hors `existing` et `dropped`).

- [_root](_root/index.md) : la librairie `@acme/ui` dans son ensemble (composants, blocs, registre, starter), qui touche `packages/ui`, `apps/docs` et `apps/example`. 1 / 34.

`packages/ui`, `apps/docs` et `apps/example` n'ont pas de scope propre : leur travail est planifié dans `_root`, parce que chaque lot les touche tous les trois.
