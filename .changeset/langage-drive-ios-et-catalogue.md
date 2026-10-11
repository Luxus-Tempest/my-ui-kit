---
"@acme/ui": minor
---

Langage visuel Drive × iOS et catalogue complet.

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
