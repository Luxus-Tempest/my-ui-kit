# Mon application

Créée avec le starter [@rovia/ui](https://luxus-tempest.github.io/my-ui-kit/) : Next.js 16, coque d'application, connexion et inscription, tableau de bord, paramètres, thème clair et sombre, français, anglais et arabe (de droite à gauche), palette ⌘K, pages système, SEO, tests et CI.

## Démarrer

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Connecte toi avec n'importe quelle adresse et un mot de passe de 8 caractères ou plus : c'est l'authentification de démonstration (voir plus bas).

| Commande                                       | Rôle                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | serveur de développement                                                                              |
| `pnpm build` puis `pnpm start`                 | version de production                                                                                 |
| `pnpm typecheck` · `pnpm lint` · `pnpm format` | types, ESLint, Prettier                                                                               |
| `pnpm test:e2e`                                | tests Playwright sur la version construite (`pnpm exec playwright install chromium` la première fois) |

## Où changer quoi

| Fichier                | Contenu                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `config/site.ts`       | nom, description, URL, couleurs du navigateur                         |
| `config/navigation.ts` | pages de la barre latérale (aussi : palette ⌘K, titres, `robots.txt`) |
| `config/locales.ts`    | langues proposées                                                     |
| `lib/auth.ts`          | **le seul fichier qui connaît ton fournisseur d'authentification**    |
| `app/(app)/…`          | pages de l'application, dans la coque, après connexion                |
| `app/(auth)/…`         | connexion et inscription                                              |
| `app/page.tsx`         | accueil public                                                        |
| `components/blocks/…`  | blocs copiés du registre @rovia, à modifier librement                 |

### Ajouter une page

1. Ajoute l'entrée dans `config/navigation.ts`.
2. Crée `app/(app)/ma-page/page.tsx` et appelle `await requireSession()` au début.

### Brancher l'authentification

Remplace le contenu de `getSession`, `signIn`, `signUp` et `signOut` dans `lib/auth.ts` (Auth.js, Clerk, Supabase, Better Auth, ton API…), en gardant leurs signatures. Rien d'autre ne change. Tant que tu ne l'as pas fait, l'authentification de démonstration refuse de fonctionner en production (`AUTH_DEMO=true` la force, pour une présentation).

## Ajouter des blocs ou éjecter un composant

```bash
pnpm dlx shadcn@4.21.4 add @rovia/drive        # un écran complet, copié dans components/blocks
pnpm dlx shadcn@4.21.4 add @rovia/button       # éjecter un composant pour le transformer
```

Les blocs et composants disponibles sont dans la [documentation](https://luxus-tempest.github.io/my-ui-kit/). Pour mettre à jour une copie, relance la même commande avec `--overwrite`, puis relis la différence dans git.

## Variables d'environnement

Voir `.env.example` : copie le en `.env.local`.
