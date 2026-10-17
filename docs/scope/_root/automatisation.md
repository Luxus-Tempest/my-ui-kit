# Lot 6, automatisation et pipeline IA

Le lot le plus lourd, placé en dernier : construire des enchaînements visuellement et suivre leurs exécutions. Retour à l'[index](index.md).

## Slice 6: automatisation et pipeline IA

### 37. Éditeur de nœuds · needs a decision
Un graphe où l'on pose, relie et configure des nœuds (à la n8n), autour d'une librairie existante et habillé du thème.
**Done when:** on ajoute, relie, déplace et supprime des nœuds, on configure un nœud dans un panneau, et le graphe se sauvegarde et se recharge.
- [ ] Design it (spec): `/architect éditeur de nœuds`

### 38. Suivi d'exécution et journaux · needs a decision
Voir une exécution étape par étape : statut de chaque nœud, durée, entrées et sorties, journaux en direct.
**Done when:** une exécution montre l'état de chaque étape en temps réel, les journaux défilent sans ralentir, et une erreur mène à l'étape fautive.
- [ ] Design it (spec): `/architect suivi d'exécution et journaux`

### 39. Blocs automatisation
Constructeur de workflow, historique des exécutions, page de détail d'une exécution.
**Done when:** les trois blocs s'installent par le registre et passent axe et la capture visuelle.
- [ ] Build it: `/develop blocs automatisation`
