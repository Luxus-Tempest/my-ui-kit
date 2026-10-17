# Lot 2, IA, chat et streaming

Ce qu'il faut pour une boîte de chat IA, ton application de messagerie et ton application de streaming. Les composants de messagerie existants sont la base. Retour à l'[index](index.md).

## Slice 2: IA, chat et streaming

### 19. Texte en streaming et Markdown · needs a decision
Afficher une réponse qui arrive morceau par morceau, en Markdown, sans clignotement ni saut de mise en page.
**Done when:** un flux de texte s'affiche au fil de l'eau avec titres, listes, tableaux et liens ; le défilement suit sans voler la main à l'utilisateur ; un lecteur d'écran annonce la fin de la réponse.
- [ ] Design it (spec): `/architect texte en streaming et Markdown`

### 20. Bloc de code et copie · needs a decision
`CodeBlock` avec coloration syntaxique, nom du langage et bouton copier, utilisé dans les réponses IA et la doc.
**Done when:** le code s'affiche coloré en clair et en sombre, se copie en un clic, et reste lisible pendant le streaming.
- [ ] Design it (spec): `/architect bloc de code et copie`

### 21. Saisie de prompt enrichie · needs a decision
Étendre `ChatComposer` : pièces jointes, commandes avec `/`, mentions avec `@`, bouton stop pendant une génération.
**Done when:** on joint un fichier, choisit une commande et mentionne une ressource au clavier ; le bouton envoyer devient stop pendant une réponse.
- [ ] Design it (spec): `/architect saisie de prompt enrichie`

### 22. Étapes d'agent et appels d'outils · needs a decision
Montrer ce que fait un agent : raisonnement repliable, appels d'outils avec statut et résultat, sources citées.
**Done when:** chaque étape affiche son statut (en cours, réussie, échouée), se replie, et les sources s'ouvrent depuis la réponse.
- [ ] Design it (spec): `/architect étapes d'agent et appels d'outils`

### 23. Lecteur média et direct · needs a decision
Lecteur vidéo et audio dans le langage du kit, avec un mode direct (badge en direct, chat à côté).
**Done when:** le lecteur se pilote au clavier, affiche sous titres et qualité, et un écran de direct montre la vidéo avec son chat.
- [ ] Design it (spec): `/architect lecteur média et direct`

### 24. Centre de notifications
Une liste de notifications dans un popover, groupées par jour, avec lu et non lu.
**Done when:** le badge compte les non lues, on marque tout comme lu, et la liste a un état vide.
- [ ] Build it: `/develop centre de notifications`

### 25. Blocs IA et messagerie
Écrans prêts à installer : chat IA (historique, conversation, réglages du modèle), messagerie complète (conversations, fil, détails du contact), page de direct.
**Done when:** les trois blocs s'installent par le registre et passent axe et la capture visuelle.
- [ ] Build it: `/develop blocs IA et messagerie`
