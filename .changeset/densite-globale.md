---
"@acme/ui": minor
---

Densité globale : compacte, standard ou confortable, pour toute l'interface.

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
- Storybook : bascule « Densité » dans la barre d'outils, page *Fondations › Densité*.
