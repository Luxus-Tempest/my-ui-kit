---
"@rovia/ui": major
---

Première publication sous le nom `@rovia/ui` (anciennement `@acme/ui`) : remplace `@acme/ui` par `@rovia/ui` dans tes imports.

- Un sous chemin par composant et pour `theme`, `i18n`, `hooks`, `utils` (`import { Button } from "@rovia/ui/button"`), en ESM avec ses types. Le barrel `@rovia/ui` ne change pas.
- Types émis module par module (`tsc`), plus de fichier de types unique.
- Registre `@rovia` (CLI shadcn) : installer un bloc ou éjecter un composant dans ton application. Voir *Introduction › Bienvenue* dans la documentation.
