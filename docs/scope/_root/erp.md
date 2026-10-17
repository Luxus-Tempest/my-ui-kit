# Lot 1, ERP

Le premier lot, parce que le DataTable ERP est déjà là et que le formulaire et le bloc CRUD serviront ensuite à toutes tes autres applications. Retour à l'[index](index.md).

## Slice 1: ERP

### 11. Formulaire avec validation · needs a decision
Un `Form` qui relie validation, erreurs et soumission aux `Field` existants, pour ne plus câbler chaque formulaire à la main.
**Done when:** un formulaire affiche les erreurs par champ et en résumé, place le focus sur la première erreur, bloque la double soumission et gère un état d'envoi.
- [ ] Design it (spec): `/architect formulaire avec validation`

### 12. Sélection multiple et tags · needs a decision
`MultiSelect` et `TagsInput` : choisir plusieurs valeurs dans une liste longue, ou saisir des étiquettes libres.
**Done when:** on choisit et retire plusieurs valeurs au clavier et à la souris, avec recherche, limite de nombre et rendu correct en RTL.
- [ ] Design it (spec): `/architect sélection multiple et tags`

### 13. Saisies spécialisées · needs a decision
Mot de passe (afficher, indicateur de force), téléphone avec indicatif, saisie masquée (ICE, RIB, dates), montant avec devise.
**Done when:** chaque saisie formate pendant la frappe, rend une valeur brute propre au formulaire et s'intègre à `Field`.
- [ ] Design it (spec): `/architect saisies spécialisées`

### 14. Petits retours et confirmations
`Banner` (message en haut de page), confirmation en ligne attachée à un bouton (à la Popconfirm), `CopyButton`.
**Done when:** les trois composants existent avec leur story, leurs tests et axe, dans le langage Drive × iOS.
- [ ] Build it: `/develop petits retours et confirmations`

### 15. Bloc CRUD · needs a decision
L'écran que tu referas dans chaque module ERP : liste avec DataTable et filtres, détail dans un tiroir, formulaire de création et d'édition, confirmation de suppression, état vide.
**Done when:** depuis la liste on crée, consulte, modifie et supprime un enregistrement sans quitter la page ; les états vide, chargement et erreur s'affichent ; le bloc s'installe par le registre.
- [ ] Design it (spec): `/architect bloc CRUD`

### 16. Bloc document imprimable · needs a decision
Facture, devis, bon de livraison : une vue à l'écran qui s'imprime et s'exporte proprement.
**Done when:** le document s'imprime sur A4 sans élément d'interface, avec totaux et mentions, en français et en arabe.
- [ ] Design it (spec): `/architect bloc document imprimable`

### 17. Blocs auth complets
Compléter connexion et inscription avec mot de passe oublié, code OTP et double authentification.
**Done when:** les trois écrans s'installent par le registre et passent axe et la capture visuelle.
- [ ] Build it: `/develop blocs auth complets`

### 18. Blocs pages système
404, 500, maintenance, accès refusé, et un assistant en plusieurs étapes.
**Done when:** chaque page s'installe par le registre et passe axe et la capture visuelle, en clair, en sombre et en RTL.
- [ ] Build it: `/develop blocs pages système`
