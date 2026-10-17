import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChatComposer,
  DatePicker,
  DirectionProvider,
  Dropzone,
  Field,
  getLocaleDirection,
  LocaleProvider,
  localeAr,
  localeEn,
  MessageDateSeparator,
  Pagination,
  Rating,
  SearchBar,
  Stat,
  Text,
  type UiMessagesInput,
} from "@rovia/ui";

const meta: Meta = {
  title: "Fondations/Langue",
  parameters: {
    docs: {
      description: {
        component: [
          "Chaque composant parle français par défaut. `LocaleProvider` change la langue de toute l'interface : la **locale** `Intl` (dates, nombres, pluriels, tri, premier jour de la semaine) et le **catalogue** de libellés (boutons, annonces aux lecteurs d'écran, messages d'erreur).",
          "",
          "```tsx",
          'import { LocaleProvider, ThemeProvider, getLocaleDirection, localeAr } from "@rovia/ui";',
          "",
          'const locale = "ar-MA";',
          "<ThemeProvider dir={getLocaleDirection(locale)}>",
          "  <LocaleProvider locale={locale} messages={localeAr}>…</LocaleProvider>",
          "</ThemeProvider>",
          "```",
          "",
          "Catalogues fournis : `localeEn` (en-US) et `localeAr` (ar-MA, à faire relire par un locuteur natif). Pour une autre langue, écrire un objet `UiMessages` complet : le typage signale chaque clé manquante. Un catalogue partiel (`UiMessagesInput`) ne remplace que ce qu'il précise ; la prop `labels` d'un composant l'emporte toujours. La barre d'outils « Langue » applique ces catalogues à toutes les pages.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

const NOW = new Date();
// Les textes métier (libellés de champ, nom d'indicateur) restent à l'application ; le catalogue couvre ceux des composants.
const LANGUES: { titre: string; locale: string; messages?: UiMessagesInput; echeance: string; chiffre: string }[] = [
  { titre: "Français (défaut)", locale: "fr-FR", echeance: "Échéance", chiffre: "Chiffre d'affaires" },
  { titre: "English", locale: "en-US", messages: localeEn, echeance: "Due date", chiffre: "Revenue" },
  { titre: "العربية", locale: "ar-MA", messages: localeAr, echeance: "تاريخ الاستحقاق", chiffre: "رقم المعاملات" },
];

function Panneau({ titre, locale, messages, echeance, chiffre }: (typeof LANGUES)[number]) {
  const dir = getLocaleDirection(locale);
  return (
    <LocaleProvider locale={locale} messages={messages}>
      <DirectionProvider dir={dir}>
        <Card variant="outlined" dir={dir} style={{ minWidth: 0 }}>
          <CardHeader>
            <CardTitle>{titre}</CardTitle>
            <Text size={12} tone="muted">{locale}</Text>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <SearchBar aria-label={titre} defaultValue="budget 2027" />
            <Field label={echeance}>
              <DatePicker defaultValue={NOW} />
            </Field>
            <Stat label={chiffre} value={128_400} format={{ style: "currency", currency: "MAD", maximumFractionDigits: 0 }} delta={0.124} trend={[4, 6, 5, 8, 7, 9]} />
            <Dropzone variant="compact" accept={["image/*", ".pdf"]} maxSize={10 * 1024 * 1024} />
            <MessageDateSeparator date={NOW} />
            <ChatComposer />
            <Rating defaultValue={3.5} precision={0.5} />
            <Pagination pageCount={12} defaultPage={4} />
            <Button variant="outline" disabled>
              {locale}
            </Button>
          </CardContent>
        </Card>
      </DirectionProvider>
    </LocaleProvider>
  );
}

/** Les mêmes composants, sans autre changement que le `LocaleProvider` qui les entoure. */
export const TroisLangues: StoryObj = {
  name: "Trois langues côte à côte",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: 1180 }}>
      {LANGUES.map((langue) => (
        <Panneau key={langue.locale} {...langue} />
      ))}
    </div>
  ),
};
