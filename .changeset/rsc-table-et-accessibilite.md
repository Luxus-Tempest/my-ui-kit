---
"@acme/ui": minor
---

Intégration Next.js (composants serveur), défilement des tables, accessibilité vérifiée en vrai navigateur.

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
