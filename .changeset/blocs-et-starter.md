---
"@rovia/ui": minor
---

- `EmptyState` : `titleAs="h1"` accepté, pour une page d'erreur ou une 404 dont l'état vide est le titre de la page.
- Registre `@rovia` : huit blocs installables (`application`, `tableau-de-bord`, `drive`, `messagerie`, `formulaire-client`, `parametres`, `connexion`, `inscription`) et la coque `coque-application` ; les blocs `application` et `parametres` ne montent plus leur propre `Toaster` (un seul, à la racine de l'application) ; `inscription` affiche une erreur globale (`error`).
- Starter d'application Next.js : `pnpm create next-app mon-app --example https://github.com/Luxus-Tempest/my-ui-kit/tree/starter/templates/next`.
