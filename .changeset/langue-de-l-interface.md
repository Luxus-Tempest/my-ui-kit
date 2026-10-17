---
"@rovia/ui": minor
---

Langue de l'interface : `LocaleProvider`, catalogues anglais et arabe.

- `LocaleProvider` (`locale`, `messages`), `useLocale()`, `useMessages()`, `getLocaleDirection()`. Sans provider, rien ne change : tout reste en français (`fr-FR`).
- Catalogues `localeEn` (en-US) et `localeAr` (ar-MA, pluriels arabes par `Intl.PluralRules`), typés par `UiMessages` : 31 espaces de noms, un par composant (DataTable, DatePicker, FileUpload, Chat, graphiques, Pagination, Sidebar…).
- Dates, nombres, pluriels et listes suivent la locale : Stat, Sparkline, graphiques, NumberInput, Slider, Rating, Timeline, Chat (heures et séparateurs de date), DatePicker, FileUpload (unités de taille, « PNG, JPG ou PDF » par `Intl.ListFormat`).
- Calendar : la locale de react-day-picker vient du catalogue, et le premier jour de la semaine suit la locale (lundi en français, dimanche en en-US).
- Toaster : le bouton de fermeture d'une notification ne s'annonce plus en anglais (« Close toast ») mais « Fermer la notification ».
- Utilitaires : `formatDate`, `formatDateRange` et `formatFileSize` acceptent une locale, `formatMessageDate` ses libellés ; `createDateRangePresets(libellés)` construit les périodes prédéfinies dans une langue.
- Changements de signature : `RatingLabels.valueText` reçoit la note déjà mise en forme ; `StepperLabels` gagne `label` ; `StatLabels` gagne `trendPeriod`.
