# @rovia/ui

## 1.0.0

### Major Changes

- f7b22e5: Première publication sous le nom `@rovia/ui` (anciennement `@acme/ui`) : remplace `@acme/ui` par `@rovia/ui` dans tes imports.

  - Un sous chemin par composant et pour `theme`, `i18n`, `hooks`, `utils` (`import { Button } from "@rovia/ui/button"`), en ESM avec ses types. Le barrel `@rovia/ui` ne change pas.
  - Types émis module par module (`tsc`), plus de fichier de types unique.
  - Registre `@rovia` (CLI shadcn) : installer un bloc ou éjecter un composant dans ton application. Voir _Introduction › Bienvenue_ dans la documentation.

### Minor Changes

- cda9ea6: Composants d'application, de données et de messagerie ; droite à gauche ; poids embarqué réduit.

  - Actions : ButtonGroup (segments soudés, bouton scindé ; `variant` et `size` transmis aux boutons), Fab et SpeedDial.
  - Formulaire : InputOTP, NativeSelect, Rating, TimePicker et DateTimePicker, Dropzone et FileUploadList.
  - Affichage : AspectRatio, Carousel (Embla).
  - Données : DataTable (TanStack Table : tri, recherche, facettes, sélection, colonnes, densité, export CSV, mode serveur, virtualisation) et ses briques ; TreeView, Timeline, DescriptionList, Stat, StatGroup, Sparkline.
  - Mise en page : ResizablePanelGroup, ResizablePanel, ResizableHandle.
  - Navigation : Sidebar, AppBar, BottomNavigation, Stepper (`useStepper`), Menubar, NavigationMenu.
  - Surcouches : HoverCard, Drawer (feuille iOS à glisser).
  - Messagerie : MessageList, MessageGroup, Message, ChatComposer, TypingIndicator, MessageDateSeparator.
  - Droite à gauche : `ThemeProvider dir="rtl"`, `DirectionProvider`, `useDirection` ; tout le CSS passe aux propriétés logiques.
  - Hooks : `useMediaQuery` et `breakpoints`, `useControllableState`.
  - Table : `containerRef` ; `onSort` reçoit l'événement du clic.
  - Build : un module ESM par composant (le CommonJS reste un fichier unique) ; ECharts s'enregistre au premier graphique affiché, une application sans graphique ne l'embarque plus. `styles.css` est minifié ; `styles.dev.css` en est la version lisible.
  - Durées d'animation des boutons et des surfaces flottantes tirées des jetons `--ui-duration`.

- 2c372ce: Thème à partir d'une couleur de marque : `ThemeProvider brand`, `createBrandTokens`, `createBrandCss`, `brandStyle`, `contrastRatio`.

  - `ThemeProvider brand="#7c3aed"` : la famille primaire suit le mode courant ; `overrides` l'emporte ; une couleur illisible est signalée en console et ignorée.

  - La famille primaire (`pri`, `pri-d`, `pri-fg`, `pri-soft`, `pri-line`, `pri-container`, `on-pri-container`, `sel`, `sh-pri`) est calculée en OKLCH pour le clair et le sombre, teinte de la marque conservée.
  - Contrastes garantis sur la couleur livrée : texte sur le primaire et liens sur les surfaces ≥ 4,5:1, texte sur le conteneur primaire ≥ 7:1.
  - `createBrandCss` produit une feuille de style pour ThemeProvider (`data-theme`) et next-themes (`.dark`).

- 94f67a7: DataTable au niveau d'un ERP : colonnes figées et redimensionnables, lignes dépliables, ligne de totaux.

  - Colonnes figées : `meta.pin: "start" | "end"`, entrées « Figer au début », « Figer à la fin » et « Libérer » du menu de colonne, état `columnPinning` (`initialState`, `state`, `onColumnPinningChange`, mémorisé avec `persistKey`), option `enableColumnPinning`. Les colonnes de sélection et de dépliage se figent au début, celle d'actions à la fin. Position collante en propriétés logiques (droite à gauche compris), décalages mesurés, fond opaque, filet et ombre douce seulement quand du contenu passe dessous ; le fondu de défilement s'efface du côté figé.
  - Colonnes redimensionnables : `enableColumnResizing` (hook et `DataTable`), poignée `DataTableColumnResizer` au bord de chaque en-tête : glisser à la souris ou au doigt (inversé de droite à gauche), séparateur focalisable au clavier (`aria-valuenow`, flèches ± 16 px, Maj+flèche ± 64 px, Origine / Fin), double-clic pour la largeur par défaut ; `meta.minWidth` / `meta.maxWidth` ; mise en page fixe ; état `columnSizing` mémorisé avec `persistKey`.
  - Lignes dépliables : panneau de détail (`renderSubComponent`, `getRowCanExpand`) dans une ligne pleine largeur reliée au chevron par `aria-controls`, ou données hiérarchiques (`getSubRows`, enfants en retrait dans la première colonne de données, recherche qui garde les parents) ; colonne `expandColumn()` (chevron par ligne, « Tout déplier » en en-tête), boutons `DataTableExpandButton` et `DataTableExpandAllButton` ; état `expanded` contrôlable ; flèches droite / gauche sur une ligne cliquable ; compatible tri, sélection, pagination (les enfants suivent leur parent) et virtualisation.
  - Ligne de totaux : `meta.aggregate` (`sum`, `avg`, `min`, `max`, `count` ou fonction) calculé sur toutes les lignes filtrées et formaté par `meta.format`, libellé « Total » ou `meta.footerLabel`, prop `showFooter`, `<tfoot>` collé en bas avec `maxHeight` ou `virtualized` ; en pagination serveur, prop `aggregates`. Utilitaire `getDataTableAggregate`.
  - Nouveaux libellés dans `DataTableLabels` : `pinStart`, `pinEnd`, `unpin`, `resizeColumn`, `columnWidth`, `expandRow`, `collapseRow`, `expandAll`, `collapseAll`, `total`.
  - Nouveaux types exportés : `ColumnPinningState`, `ColumnSizingState`, `ExpandedState`, `Header`, `DataTablePinPosition`, `DataTableAggregate`, `DataTableAggregateFn`, `ExpandColumnOptions`, `DataTableColumnResizerProps`.
  - `persistKey` mémorise désormais aussi les colonnes figées et les largeurs (`persistState` : `columnPinning`, `columnSizing`).

- 18dd789: Densité globale : compacte, standard ou confortable, pour toute l'interface.

  - Jetons de densité dans `tokens.css`, sous `data-ui-density` : `--ui-ctl-h` (`-sm`, `-lg`), `--ui-ctl-px`,
    `--ui-field-h` (`-sm`), `--ui-field-px`, `--ui-row-h`, `--ui-row-h-list`, `--ui-row-py`, `--ui-row-h-table`,
    `--ui-row-h-table-head`, `--ui-cell-px`. La densité standard reproduit exactement les mesures précédentes.
  - `ThemeProvider` : prop `density` (`"compact" | "default" | "comfortable"`), posée en `data-ui-density` sur le
    conteneur et, en portée globale, sur `<html>` ; `useTheme()` l'expose. Type `ThemeDensity` exporté.
    Sans `ThemeProvider`, l'attribut `data-ui-density` sur n'importe quel ancêtre suffit.
  - Composants qui suivent la densité : Button, Toggle, ToggleGroup, Chip, Input, Textarea, InputGroup, SearchBar,
    NumberInput, InputOTP, Select, NativeSelect, Combobox, DatePicker, DateRangePicker, TimePicker, Tabs, Menu,
    ContextMenu, Menubar, Command, List, Table, Pagination, Sidebar, TreeView, Accordion, NavigationMenu.
  - Table : la densité par défaut (`default`) suit celle de l'interface ; `compact` et `comfortable` posés sur la
    table l'emportent toujours.
  - Storybook : bascule « Densité » dans la barre d'outils, page _Fondations › Densité_.

- cda9ea6: Langage visuel Drive × iOS et catalogue complet.

  - Nouveau langage visuel : surfaces tonales, actions en pilule, matériau translucide, mouvement en ressort. Les noms de jetons existants sont conservés ; leurs valeurs changent (rayons, couleurs, hauteurs de contrôle).
  - Palette catégorielle `--ui-c1…c8` validée pour le daltonisme ; jetons de graphiques (`--ui-chart-*`, `--ui-seq-*`, `--ui-div-*`).
  - Nouveaux composants composés : Card, List, Chip, SearchBar, Sheet, Command, Table, InputGroup, et graphiques Apache ECharts (Chart, LineChart, BarChart, DonutChart).
  - Nouveaux composants élémentaires : Toggle, ToggleGroup, Slider, NumberInput, Combobox, Calendar, DatePicker, DateRangePicker, Accordion, Collapsible, Breadcrumb, Pagination, ContextMenu, EmptyState.
  - Button : variantes `tonal` et `elevated`.
  - DateRangePicker : périodes prédéfinies (`presets`, `defaultDateRangePresets`) ; à chaque ouverture, le premier clic démarre une nouvelle période et le second la termine en fermant le panneau ; ligne d'état « Du … — choisissez la date de fin » ; un seul mois sous 640 px.
  - DatePicker : raccourci « Aujourd'hui » (`showToday`, `todayLabel`).
  - NumberInput : la valeur est publiée pendant la frappe dès qu'elle est lisible et dans les bornes ; bornage et mise en forme à la sortie du champ.
  - Field : un clic sur le libellé donne le focus aux contrôles non étiquetables (RadioGroup, Slider…).
  - Slider : orientation verticale.

- f402930: Langue de l'interface : `LocaleProvider`, catalogues anglais et arabe.

  - `LocaleProvider` (`locale`, `messages`), `useLocale()`, `useMessages()`, `getLocaleDirection()`. Sans provider, rien ne change : tout reste en français (`fr-FR`).
  - Catalogues `localeEn` (en-US) et `localeAr` (ar-MA, pluriels arabes par `Intl.PluralRules`), typés par `UiMessages` : 31 espaces de noms, un par composant (DataTable, DatePicker, FileUpload, Chat, graphiques, Pagination, Sidebar…).
  - Dates, nombres, pluriels et listes suivent la locale : Stat, Sparkline, graphiques, NumberInput, Slider, Rating, Timeline, Chat (heures et séparateurs de date), DatePicker, FileUpload (unités de taille, « PNG, JPG ou PDF » par `Intl.ListFormat`).
  - Calendar : la locale de react-day-picker vient du catalogue, et le premier jour de la semaine suit la locale (lundi en français, dimanche en en-US).
  - Toaster : le bouton de fermeture d'une notification ne s'annonce plus en anglais (« Close toast ») mais « Fermer la notification ».
  - Utilitaires : `formatDate`, `formatDateRange` et `formatFileSize` acceptent une locale, `formatMessageDate` ses libellés ; `createDateRangePresets(libellés)` construit les périodes prédéfinies dans une langue.
  - Changements de signature : `RatingLabels.valueText` reçoit la note déjà mise en forme ; `StepperLabels` gagne `label` ; `StatLabels` gagne `trendPeriod`.

- cda9ea6: Intégration Next.js (composants serveur), défilement des tables, accessibilité vérifiée en vrai navigateur.

  - Next.js : le barrel ESM ne porte plus `"use client"` (chaque module le garde). Un composant serveur qui importe un composant n'embarque plus tout le paquet : dans l'application d'exemple, la page de connexion passe de 606 à 193 Ko gzip, sans ECharts ni TanStack Table.
  - Table et DataTable : `data-overflow-start` et `data-overflow-end` signalent les colonnes cachées au défilement horizontal (RTL compris), avec un fondu sur le bord concerné. `containerRef` reste transmis.
  - Zones défilantes (Table, ScrollArea) : sans contenu focalisable, elles deviennent focalisables pour défiler au clavier (WCAG 2.1.1).
  - ToggleGroup `type="single"` : un choix reste toujours sélectionné, comme le segmented control d'iOS ; `allowEmpty` rétablit la désélection.
  - Corrections relevées par axe dans un vrai navigateur (contraste compris) :
    - Button : en chargement, le libellé masqué reste dans l'arbre d'accessibilité, le bouton garde son nom.
    - Label et Dropzone désactivés : textes en encre tertiaire (≥ 4,5:1) au lieu d'une opacité illisible.
    - Badge `tinted` : texte mêlé à l'encre, lisible quelle que soit la teinte.
    - Message en cours d'envoi : bulle pleine (le texte passait sous 4,5:1).
    - Chip : bouton de retrait de 24 px (WCAG 2.2, 2.5.8).
    - CommandSeparator : filet décoratif (`role="none"`), le `role="separator"` de cmdk étant interdit dans une liste d'options ; `alwaysRender` le garde pendant une recherche.
    - Chart : `role="img"` dès qu'un nom est fourni.
  - Nouveau script `size` : budget de poids par scénario d'import.
