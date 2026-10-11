---
"@acme/ui": minor
---

Composants d'application, de données et de messagerie ; droite à gauche ; poids embarqué réduit.

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
