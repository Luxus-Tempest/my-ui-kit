# @acme/ui

Librairie de composants React façon MUI, construite sur **Radix UI** (logique + accessibilité) avec une couche de style maison en **variables CSS** et un langage visuel **Drive × iOS**. Clair, sombre, droite à gauche ; chaque composant est testé (comportement + axe) et documenté dans Storybook.

## Démarrer

```bash
pnpm install
pnpm storybook      # doc interactive sur http://localhost:6006
pnpm test           # Vitest + Testing Library + axe
pnpm build          # librairie (ESM découpé + CJS + types + styles.css), Storybook, application d'exemple
pnpm size           # budget de poids : ce qu'embarque une application selon ce qu'elle importe
pnpm e2e            # chaque story dans un vrai navigateur : axe (contraste compris) et régression visuelle
pnpm --filter example dev   # l'application d'exemple Next.js sur http://localhost:3001
```

Prérequis : Node 20+ et pnpm (`corepack enable`).

La CI GitHub Actions (`.github/workflows/ci.yml`) rejoue les types, les tests, le build et le budget de poids sur
chaque push vers `main` et chaque pull request, puis ouvre chaque story dans Chromium (accessibilité et régression
visuelle, voir « Qualité »).

## Structure

```
ui-kit/
├── packages/ui/                     → la librairie publiée sur npm
│   ├── src/theme/tokens.css         → jetons du langage Drive × iOS (clair + sombre)
│   ├── src/theme/ThemeProvider      → mode clair/sombre, sens de lecture, surcharge de jetons
│   ├── src/hooks/                   → useMediaQuery, useControllableState
│   ├── src/components/<nom>/        → un dossier par composant : .tsx, .css, .test.tsx
│   ├── src/index.ts                 → API publique, par famille
│   ├── src/styles.css               → CSS des composants, par famille
│   └── scripts/build-css.mjs        → dist/styles.css (minifié) et dist/styles.dev.css (lisible), via esbuild
├── apps/example/                    → application Next.js qui consomme le paquet buildé (rendu serveur, Tailwind, next-themes)
├── apps/docs/                       → Storybook (documentation, a11y, bascule de thème)
│   ├── tests/                       → Playwright : axe et captures de chaque story
│   └── stories/
│       ├── introduction/            → Bienvenue, statut des composants (MDX)
│       ├── fondations/              → langage, couleurs, typographie, espacement, rayons et mouvement
│       ├── composants/<famille>/    → une page par composant (documentation automatique des props)
│       ├── blocs/                   → écrans prêts à l'emploi (application, connexion, paramètres, tableau de bord…)
│       └── _shared/                 → icônes, données et mise en page des démos
├── .changeset/                      → versioning et changelog
└── CONTRIBUTING.md                  → conventions et checklist de qualité
```

## Composants

Tous suivent le langage **Drive × iOS** (voir « Thème ») ; ceux qui flottent partagent une même surface en matériau translucide (`.ui-popup` : `--ui-material` + `--ui-blur`, rayon 12 px, ombre `sh3`).

Plus de 90 composants, chacun avec sa page Storybook, son test de comportement et son test axe. Statut (stable / bêta) :
page *Introduction › Statut des composants* de la documentation.

| Famille | Composants | Primitives |
|---|---|---|
| Actions | `Button`, `ButtonGroup`, `Toggle`, `ToggleGroup`, `Chip`, `Fab`, `SpeedDial` | Radix |
| Formulaire | `Field`, `Label`, `Input`, `Textarea`, `InputGroup`, `SearchBar`, `NumberInput`, `InputOTP`, `Select`, `NativeSelect`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Rating`, `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker`, `DateTimePicker`, `Dropzone`, `FileUploadList` | Radix, cmdk, react-day-picker, input-otp |
| Affichage | `Avatar`, `Badge`, `Card`, `List`, `Table`, `AspectRatio`, `Carousel` | Radix, Embla |
| Données | `DataTable` (+ ses briques : barre d'outils, facettes, colonnes, pagination), `TreeView`, `Timeline`, `DescriptionList`, `Stat`, `StatGroup`, `Sparkline` | TanStack Table, TanStack Virtual |
| Typographie | `Text`, `Heading`, `Link`, `Kbd`, `VisuallyHidden` | — |
| Mise en page | `Box`, `Stack`, `HStack`, `Grid`, `Container`, `Separator`, `ScrollArea`, `Accordion`, `Collapsible`, `ResizablePanelGroup` | Radix, react-resizable-panels |
| Navigation | `Sidebar`, `AppBar`, `BottomNavigation`, `Tabs`, `Breadcrumb`, `Pagination`, `Stepper`, `Menubar`, `NavigationMenu` | Radix |
| Surcouches | `Tooltip`, `Popover`, `HoverCard`, `Menu`, `ContextMenu`, `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Command` | Radix, vaul, cmdk |
| Retour | `Alert`, `Toaster` + `toast`, `Progress`, `Spinner`, `Skeleton`, `EmptyState` | sonner |
| Messagerie | `MessageList`, `MessageGroup`, `Message`, `ChatComposer`, `TypingIndicator`, `MessageDateSeparator` | — |
| Graphiques | `LineChart`, `BarChart`, `DonutChart`, `Chart` (option ECharts libre) | Apache ECharts 6 |

Les **Blocs** de Storybook assemblent ces composants en écrans complets (application, tableau de bord, formulaire client,
connexion, paramètres, messagerie) : point de départ à copier.

### DataTable : la table de gestion clé en main

```tsx
const columns: ColumnDef<Facture, any>[] = [
  { accessorKey: "numero", header: "Facture" },
  { accessorKey: "statut", header: "Statut", meta: { label: "Statut", filterOptions: STATUTS } },
  { accessorKey: "montant", header: "Montant TTC", meta: { numeric: true, format: mad.format } },
];

<DataTable
  aria-label="Factures"
  columns={columns}
  data={factures}
  getRowId={(f) => f.id}
  enableRowSelection
  enableExport
  onRowClick={(row) => ouvrir(row.original)}
/>
```

Tri (Maj+clic pour plusieurs colonnes), recherche sans accents ni casse, filtres à facettes avec compteurs,
sélection avec plage Maj+clic et actions groupées, colonnes masquables, densité, export CSV, état persistant,
mode serveur (`manualPagination`, `manualSorting`, `manualFiltering`) et virtualisation des grands volumes.
Une cellule tient sur une ligne ; `meta.wrap` autorise le retour à la ligne (notes, descriptions).
Pour une mise en page sur mesure, `useDataTable` et les briques (`DataTableToolbar`, `DataTableView`, `DataTablePagination`…)
s'assemblent librement.

### Field : un champ complet en une ligne

`Field` relie tout seul libellé, aide, erreur, obligatoire et désactivé au contrôle qu'il contient
(Input, Textarea, Select, Checkbox, Switch, RadioGroup) : `id`, `aria-describedby`, `aria-invalid`.

```tsx
<Field label="ICE" required hint="15 chiffres" error={errors.ice}>
  <Input />
</Field>

<Field label="Relances automatiques" orientation="horizontal">
  <Switch />
</Field>
```

### Graphiques (Apache ECharts)

```tsx
<LineChart
  title="Chiffre d'affaires par mois"          // nom accessible + légende du tableau
  data={rows} x="mois" xLabel="Mois"
  series={[{ key: "ca", label: "CA" }, { key: "charges", label: "Charges" }]}
  area valueFormatter={(v) => mad.format(v)}
/>

<Chart aria-label="…" option={(tokens, size) => ({ /* n'importe quel exemple ECharts */ })} />
```

- Couleurs : palette catégorielle `--ui-c1…c8`, **ordre fixe** validé pour le daltonisme (ne pas la permuter ;
  toute nouvelle palette repasse le contrôle). La couleur suit la série, jamais son rang : masquer une série
  depuis la légende ne repeint pas les autres.
- Marques : traits de 2 px, barres de 24 px au plus à bout arrondi de 4 px, écart de 2 px couleur du fond entre
  segments empilés, grille en filets pleins, texte en encres du thème.
- Accessibilité : légende dès deux séries, infobulle construite sans `innerHTML`, parcours au clavier (flèches),
  vue tableau toujours lue par les lecteurs d'écran (`view="table"` pour l'afficher), hachures (`texture`)
  activées d'office en contraste élevé.
- Thème : les jetons sont relus quand le thème bascule (`setTheme` d'ECharts, sans recréer le graphique).
- Seuls les graphiques ligne, barre, secteur et nuage sont enregistrés, au premier graphique affiché (pas au
  chargement) ; pour un autre type : `registerChartModules([HeatmapChart, VisualMapComponent])`.

### Raccourcis

```tsx
<Tooltip content="Dupliquer" shortcut="⌘D"><Button size="icon" aria-label="Dupliquer">…</Button></Tooltip>

<Toaster />                         // une fois, près de la racine
toast.success("Facture envoyée");
toast.promise(save(), { loading: "Enregistrement…", success: "Enregistré", error: "Échec" });
```

## Thème

Le langage visuel mêle, à parts égales, deux grammaires (vitrine : *Fondations › Langage Drive × iOS* dans Storybook) :

| De Google Drive | D'iOS |
|---|---|
| Surfaces tonales bleutées plutôt qu'ombres (`--ui-app`, `--ui-card-2`, `--ui-card-hover`) | Grands rayons continus (`--ui-r-lg` 16, `--ui-r-xl` 20, `--ui-r-2xl` 28) |
| Sélection en conteneur bleu (`--ui-sel`, `--ui-pri-container`) | Matériau translucide flouté pour ce qui flotte (`--ui-material`, `--ui-blur`) |
| Actions en pilule (`--ui-r-pill`), boutons `tonal` et `elevated` | Interrupteur 44 × 26 qui s'étire à l'appui, segmented control en capsule |
| Couches d'état : texte à 8 % au survol, 12 % à l'appui (`--ui-state-*`) | Courbe « ressort » pour les surfaces (`--ui-ease-spring`), pression à 97 % |
| Infobulle inversée (`--ui-inverse`), onglets à indicateur arrondi, tiroir de navigation | Graisses légères (400 / 500 / 600), listes groupées, corps 14 px |

Les jetons sont préfixés `--ui-` ; les noms historiques (`--ui-pri`, `--ui-line-2`, `--ui-r-ctl`…) sont conservés,
une application qui les surcharge continue donc de fonctionner. Le focus reste « filet primaire + halo 3 px » (`--ui-ring`).
Le thème sombre s'active avec `<ThemeProvider defaultMode="dark">` **ou** la classe `.dark` sur un parent :
la librairie fonctionne donc telle quelle avec `next-themes`.

Par défaut, `ThemeProvider` pose aussi le thème sur `<html>` (`scope="global"`) : les menus, infobulles et modales,
rendus dans un portail hors du provider, suivent ainsi le mode et les surcharges. `scope="local"` le limite au conteneur.

## Utilisation dans une application

```tsx
import { ThemeProvider, Button } from "@acme/ui";
import "@acme/ui/styles.css";

<ThemeProvider defaultMode="dark" overrides={{ pri: "#7c3aed", "r-ctl": "6px" }}>
  <Button size="lg">Commencer</Button>
</ThemeProvider>
```

`overrides` surcharge n'importe quel token : la clé `"r-ctl"` correspond à `--ui-r-ctl`.

### Couleur de marque

Une seule couleur suffit : `createBrandTokens("#7c3aed")` calcule la famille primaire (bouton plein, conteneur
tonal, sélection, liens, focus) pour le clair **et** le sombre, en OKLCH. La teinte est gardée ; luminosité et
saturation s'ajustent pour garantir les contrastes (texte sur le primaire et liens ≥ 4,5:1, texte sur le conteneur
≥ 7:1) : une marque jaune vif donne un bouton ambré lisible.

```tsx
import { createBrandCss, createBrandTokens } from "@acme/ui";

// Feuille de style, avec ou sans ThemeProvider (next-themes…), après @acme/ui/styles.css :
<style>{createBrandCss("#7c3aed")}</style>

// Ou les valeurs, pour ThemeProvider overrides selon le mode :
const { light, dark } = createBrandTokens("#7c3aed");
```

Page *Fondations › Couleur de marque* : essayer une couleur et lire les contrastes obtenus.

### Next.js (App Router) et composants serveur

Les composants s'importent directement dans un composant serveur, tant que leurs props sont sérialisables
(textes, nombres, tableaux, options `Intl`, éléments React) :

```tsx
// app/page.tsx — composant serveur, sans "use client"
import { Stat, StatGroup } from "@acme/ui";

export default async function Page() {
  const kpi = await getKpi();
  return <StatGroup><Stat label="Documents" value={kpi.documents} delta={0.12} trend={kpi.serie} /></StatGroup>;
}
```

Une prop **fonction** (formateur, `onClick`, colonnes de `DataTable` avec `cell`) ne traverse pas la frontière :
le composant qui la porte vit dans un fichier `"use client"` (voir `apps/example/components/`). Les utilitaires
(`dataTableFormatters`, `formatFileSize`, `breakpoints`…) sont du code client : appelez-les côté client.
Les formulaires marchent avec les server actions : les champs postent leur valeur par leur `name`.

Le barrel `@acme/ui` ne porte pas `"use client"` ; chaque module le porte. Une page n'embarque ainsi que ce
qu'elle affiche : dans l'application d'exemple, la page de connexion pèse 193 Ko gzip (React et Next compris),
sans ECharts ni TanStack, au lieu de 606 Ko quand tout le paquet devenait une seule frontière client.

### Tailwind CSS v4

Rangez les styles de la librairie dans la couche `components` de Tailwind : ils l'emportent sur la remise à zéro
(`base`), et une classe utilitaire posée sur un composant l'emporte sur eux.

```css
@import "tailwindcss";
@import "@acme/ui/styles.css" layer(components);

/* Les jetons comme couleurs Tailwind : bg-panel, text-fg-2… */
@theme inline {
  --color-panel: var(--ui-panel);
  --color-fg-2: var(--ui-fg-2);
}
```

Avec `next-themes` (`attribute="class"`), le `ThemeProvider` de la librairie est facultatif : les jetons sombres
suivent la classe `dark` de `<html>`.

### Poids embarqué

Le build ESM garde un module par composant et le paquet déclare `"sideEffects": ["**/*.css"]` : le bundler de
l'application (Vite, webpack, Next, esbuild) ne garde que ce qui est importé. `pnpm size` mesure chaque scénario
et échoue au-delà de son budget, ou si ECharts ou TanStack apparaissent là où ils n'ont rien à faire :

| Import | gzip | Budget |
|---|---|---|
| `Button` | 2,4 Ko | 5 Ko |
| Formulaire (`Field`, `Input`, `Select`, `Checkbox`) | 34 Ko | 40 Ko |
| `Dialog`, `Menu`, `toast` | 43 Ko | 50 Ko |
| `DataTable` | 83 Ko | 95 Ko |
| `LineChart` (ECharts compris) | 225 Ko | 245 Ko |
| `styles.css` | 34 Ko | 40 Ko |

`styles.dev.css` est la version lisible de la feuille, pour le débogage.

### Langue (français, anglais, arabe…)

Les composants parlent français sans configuration. `LocaleProvider` change la langue de toute l'interface :
la **locale** `Intl` (dates, nombres compacts, pluriels, listes « A, B ou C », premier jour de la semaine) et le
**catalogue** de libellés (boutons, annonces aux lecteurs d'écran, erreurs de dépôt de fichiers…).

```tsx
import { LocaleProvider, ThemeProvider, getLocaleDirection, localeEn, localeAr } from "@acme/ui";

<LocaleProvider locale="en-US" messages={localeEn}>…</LocaleProvider>

// Arabe : catalogue et sens de lecture.
<ThemeProvider dir={getLocaleDirection("ar-MA")}>
  <LocaleProvider locale="ar-MA" messages={localeAr}>…</LocaleProvider>
</ThemeProvider>
```

- Catalogues fournis : `localeEn` (en-US) et `localeAr` (ar-MA, pluriels arabes via `Intl.PluralRules` ; à faire
  relire par un locuteur natif). Une autre langue : un objet `UiMessages` complet, le typage signale toute clé oubliée.
- Un catalogue partiel (`UiMessagesInput`) ne remplace que ce qu'il précise ; les providers s'emboîtent ; la prop
  `labels` d'un composant (ou `clearLabel`, `placeholder`…) l'emporte toujours.
- Dans vos propres composants : `useLocale()` pour `Intl`, `useMessages(espace, défauts)` pour les libellés.
- Utilitaires hors React : `formatDate(date, locale)`, `formatFileSize(octets, { locale, units })`,
  `formatMessageDate(date, now, { locale, today, yesterday })`, `createDateRangePresets(libellés)`.
- Les textes de l'application (en-têtes de colonnes, formateurs de cellules `dataTableFormatters.date(options, locale)`)
  restent à sa charge. Bascule « Langue » dans la barre d'outils de Storybook ; page *Fondations › Langue*.

### Droite à gauche (arabe, hébreu)

```tsx
<ThemeProvider dir="rtl">…</ThemeProvider>
```

`getLocaleDirection(locale)` donne le sens d'une locale. `dir` est posé sur le conteneur et sur `<html>`, et transmis aux primitives Radix (`DirectionProvider`) : menus,
curseurs, onglets et calendrier suivent le sens de lecture. Le CSS n'emploie que des propriétés logiques
(`margin-inline-start`, `inset-inline-end`…) ; flèches et chevrons se retournent d'eux-mêmes.
Bascule « Sens » dans la barre d'outils de Storybook.

### Hooks

- `useMediaQuery(breakpoints.md)` : vrai sous 768 px, sans écart entre rendu serveur et client (`useSyncExternalStore`).
- `useControllableState` : la mécanique contrôlé / non contrôlé des composants, pour écrire les vôtres.

## Qualité

- **Vitest** (`pnpm test`) : comportement, clavier et axe dans jsdom, pour chaque composant.
- **Navigateur** (`pnpm e2e`, Playwright) : chaque story du Storybook construit, dans Chromium (Edge en local
  sous Windows), avec une date figée et les animations coupées.
  - axe en clair et en sombre, **contraste compris** : jsdom ne calcule pas les couleurs, ce contrôle n'existe qu'ici ;
  - capture comparée à la référence, en clair, en sombre et en RTL.

  ```bash
  pnpm --filter docs e2e                              # tout (construire Storybook avant : pnpm build)
  STORIES=button pnpm --filter docs e2e               # les stories dont l'id contient « button »
  VISUAL=0 pnpm --filter docs e2e                     # accessibilité seule
  pnpm --filter docs e2e --update-snapshots=all       # accepter les changements visuels
  pnpm --filter docs e2e:report                       # rapport : images attendue, obtenue, différence
  ```

  Une story sans référence crée la sienne au premier passage. Les références sont rangées par plateforme et ne
  sont pas versionnées : en CI, celles du dernier passage sur `main` servent de base aux pull requests.
  Une story s'exclut avec `tags: ["!test"]`, ou seulement de la capture avec `tags: ["skip-visual"]`.
- **Budget de poids** (`pnpm size`), voir « Poids embarqué ».
- **Application d'exemple** (`apps/example`, `pnpm --filter example e2e`) : le paquet consommé comme dans une vraie application (rendu
  serveur, server actions, Tailwind, next-themes) ; son build casse si l'intégration casse.

## Ajouter un composant

1. Choisis la primitive Radix correspondante (`@radix-ui/react-tooltip`, `-popover`, `-select`…) et ajoute-la aux dépendances de `packages/ui`.
2. Crée `src/components/<nom>/` avec `<Nom>.tsx`, `<nom>.css` et `<Nom>.test.tsx`.
3. Utilise uniquement des tokens `var(--ui-…)` dans le CSS, jamais de valeurs en dur.
4. Ajoute le fichier CSS dans `src/styles.css` et l'export dans `src/index.ts`.
5. Écris une story dans `apps/docs/stories/`.

## Conventions d'API

**La variante est le rôle, jamais la couleur.** Une seule action `default` (primaire) par vue.

| `variant` | Rôle |
|---|---|
| `default` | Action primaire, une seule par vue |
| `outline` | Action secondaire, la plus courante |
| `secondary` | Secondaire sur fond légèrement teinté |
| `ghost` | Action discrète : ni fond, ni filet au repos |
| `danger` | Retire un accès ou détruit, sans crier |
| `destructive` | Confirmation destructive, en pied de dialogue |
| `link` | Navigation dans du texte |
| `onDark` / `onDarkGhost` | Uniquement sur le bandeau de marque sombre |

- `size` : `sm` (32 px) | `default` (36 px) | `lg` (44 px) | `icon` | `icon-sm` | `icon-lg`. Un bouton icône exige un `aria-label` (avertissement en développement).
- États pilotés par ARIA, sans prop dédiée : `aria-pressed` (bascule), `aria-expanded` (menu ouvert), `aria-invalid`.
- `loading` : garde la largeur et le focus, annonce `aria-busy`, ignore les clics.
- `asChild` : rend l'enfant (un `<a>`, un `<Link>`) avec le style du bouton ; `disabled` y bloque la navigation.
- Chaque composant transmet sa `ref` et accepte `className`.

## Publier

```bash
pnpm changeset      # décrire le changement (patch / minor / major)
pnpm changeset version
pnpm release        # build puis publication sur npm
```

Renomme d'abord `@acme/ui` avec ton propre scope npm.

## Prochaines étapes suggérées

- Utilitaires appelables depuis un composant serveur (formateurs, `breakpoints`) : un point d'entrée sans `"use client"`.
- Exports par composant (`@acme/ui/button`), comme `@mui/material/Button`, pour les outils qui ne lisent pas `sideEffects`.
- Remplacer `vaul` (Drawer), qui n'est plus maintenu, le jour où une alternative stable couvre le glisser iOS.
