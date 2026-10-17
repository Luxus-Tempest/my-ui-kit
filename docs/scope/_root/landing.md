# Lot 5, landing pages

Pages publiques pour les secteurs artistique et tech : expressives, rapides et bien référencées. Retour à l'[index](index.md).

## Slice 5: landing pages

### 33. Couche d'effets expressifs · needs a decision
Un sous ensemble séparé de la librairie (les apps métier n'en chargent rien) : révélation au défilement, texte animé, marquee, parallaxe, fonds animés.
**Done when:** chaque effet s'importe à part, n'alourdit pas le paquet principal, et se coupe proprement quand l'utilisateur réduit les animations.
- [ ] Design it (spec): `/architect couche d'effets expressifs`

### 34. Sections marketing · needs a decision
Hero, fonctionnalités, tarifs, FAQ, témoignages, logos, appel à l'action, pied de page, avec rendu serveur et métadonnées SEO.
**Done when:** chaque section s'installe par le registre, se rend côté serveur, et une page assemblée passe axe, la capture visuelle et un bon score de performance.
- [ ] Design it (spec): `/architect sections marketing`

### 35. Galerie et portfolio · needs a decision
Grille en maçonnerie, projets avec visuels plein écran, adaptée aux artistes et studios. S'appuie sur la visionneuse de fichiers.
**Done when:** des images de tailles variées se rangent sans trous, se chargent progressivement et s'ouvrent en grand au clavier.
- [ ] Design it (spec): `/architect galerie et portfolio`

### 36. Modèles de landing (art, tech)
Deux pages complètes assemblées à partir des sections : une pour un artiste ou studio, une pour un produit tech.
**Done when:** les deux modèles s'installent par le registre et passent axe et la capture visuelle, en clair et en sombre.
- [ ] Build it: `/develop modèles de landing`
