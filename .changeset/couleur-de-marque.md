---
"@acme/ui": minor
---

Thème à partir d'une couleur de marque : `ThemeProvider brand`, `createBrandTokens`, `createBrandCss`, `brandStyle`, `contrastRatio`.

- `ThemeProvider brand="#7c3aed"` : la famille primaire suit le mode courant ; `overrides` l'emporte ; une couleur illisible est signalée en console et ignorée.

- La famille primaire (`pri`, `pri-d`, `pri-fg`, `pri-soft`, `pri-line`, `pri-container`, `on-pri-container`, `sel`, `sh-pri`) est calculée en OKLCH pour le clair et le sombre, teinte de la marque conservée.
- Contrastes garantis sur la couleur livrée : texte sur le primaire et liens sur les surfaces ≥ 4,5:1, texte sur le conteneur primaire ≥ 7:1.
- `createBrandCss` produit une feuille de style pour ThemeProvider (`data-theme`) et next-themes (`.dark`).
