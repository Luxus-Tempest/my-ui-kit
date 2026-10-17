<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# @rovia/ui (monorepo)

## Stack

- **Language / Runtime**: TypeScript 5, React 19, Node 20+
- **Framework**: librairie de composants sur Radix UI, style en variables CSS (jetons `--ui-*`) ; Storybook 8 (doc) ; Next.js 16 (application d'exemple)
- **Key dependencies**: Radix UI, class-variance-authority, TanStack Table et Virtual, Apache ECharts 6, cmdk, sonner
- **Package manager**: pnpm 10 avec Turborepo 2 ; versions et changelog par Changesets

## Build approach

Tracer Bullet (un lot par application : ses composants manquants, ses blocs et leur entrée dans le registre, utilisables de bout en bout dès que le lot est fini).

## Commands

```bash
pnpm install
pnpm storybook                 # doc sur http://localhost:6006
pnpm --filter example dev      # application d'exemple sur http://localhost:3001
pnpm build                     # librairie, Storybook, application d'exemple
pnpm test                      # Vitest + Testing Library + axe
pnpm lint                      # vérification des types
pnpm size                      # budget de poids
pnpm e2e                       # chaque story en vrai navigateur : axe et captures
pnpm changeset                 # entrée de changelog
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`. Le scope (quoi construire, dans quel ordre) est dans `docs/scope/`.

## Rules

- `CONTRIBUTING.md` fait foi : anatomie d'un composant, règles d'écriture et de style, checklist avant fusion.
- Code, libellés, commentaires, documentation et messages de commit en français.
- Aucune valeur en dur dans le CSS : jetons `--ui-*` et jetons de densité ; propriétés logiques seulement (droite à gauche).
- Chaque composant a un test de comportement (clavier compris) et un test axe ; rendu vérifié en clair, en sombre et en RTL.
- Tout changement de `@rovia/ui` s'accompagne d'une entrée Changeset.

## Context files

- [packages/ui/AGENTS.md](packages/ui/AGENTS.md): la librairie, ses fichiers clés et ses pièges de build
- [apps/docs/AGENTS.md](apps/docs/AGENTS.md): Storybook, stories et tests axe et visuels
- [apps/example/AGENTS.md](apps/example/AGENTS.md): application Next.js qui consomme le paquet buildé

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
