import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  DatePicker,
  Field,
  Grid,
  Input,
  NumberInput,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  type ThemeDensity,
} from "@acme/ui";
import { Copy, Download, FilePlus2, LayoutGrid, List, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { Section } from "../_shared/tokens";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Fondations/Densité",
  parameters: {
    docs: {
      description: {
        component: [
          "Trois densités pour toute l'interface, comme le mode compact d'un ERP ou de Gmail : **compacte**, **standard** (défaut) et **confortable**.",
          "Seules les hauteurs et les marges internes des contrôles et des lignes changent ; le texte et les icônes gardent leur taille.",
          "Chaque palier retire ou ajoute 4 px aux contrôles et 8 px aux lignes de liste et de table : un champ reste 4 px plus haut qu'un bouton dans les trois densités.",
          "",
          "- Avec `ThemeProvider` : `<ThemeProvider density=\"compact\">`. L'attribut `data-ui-density` est posé sur le conteneur et, en portée globale, sur `<html>` : menus, listes et modales rendus en portail suivent.",
          "- Sans `ThemeProvider` (next-themes, rendu serveur) : `data-ui-density=\"compact\"` sur `<html>`, `<body>` ou n'importe quel ancêtre suffit. Une zone peut avoir sa propre densité (un panneau d'administration compact dans une page standard).",
          "- Table et DataTable : une densité `compact` ou `comfortable` posée sur la table l'emporte toujours sur celle de l'interface ; `default` (la valeur par défaut) la suit.",
          "- Le plus petit contrôle (bouton ou champ `sm` en compacte) mesure 28 px : la cible de 24 px de WCAG 2.2 est tenue.",
          "",
          "Bascule « Densité » dans la barre d'outils de Storybook pour l'essayer sur n'importe quelle page.",
        ].join("\n"),
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const DENSITES: { value: ThemeDensity; titre: string; mesures: string; note: string }[] = [
  { value: "compact", titre: "Compacte", mesures: "bouton 32 · champ 36 · ligne 40", note: "Écrans de gestion denses : ERP, listes longues." },
  { value: "default", titre: "Standard", mesures: "bouton 36 · champ 40 · ligne 48", note: "Le langage Drive × iOS tel quel." },
  { value: "comfortable", titre: "Confortable", mesures: "bouton 40 · champ 44 · ligne 56", note: "Proportions tactiles : tablettes, bornes." },
];

/** Trois colonnes, chacune sous sa propre densité (`data-ui-density` sur la colonne). */
function TroisDensites({ children }: { children: (densite: ThemeDensity) => React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
      {DENSITES.map((d) => (
        <section key={d.value} data-ui-density={d.value} aria-label={`Densité ${d.titre.toLowerCase()}`} style={{ display: "grid", gap: 16, minWidth: 0 }}>
          <div style={{ display: "grid", gap: 2 }}>
            <Text as="h2" size={16} weight="semibold" style={{ margin: 0 }}>{d.titre}</Text>
            <Text size={12} tone="subtle" mono>{d.mesures}</Text>
            <Text size={13} tone="muted">{d.note}</Text>
          </div>
          {children(d.value)}
        </section>
      ))}
    </div>
  );
}

const FACTURES = [
  { id: "F-0142", client: "Atlas Négoce", montant: "12 400 MAD" },
  { id: "F-0141", client: "Sanad Conseil", montant: "3 250 MAD" },
  { id: "F-0140", client: "Rif Bâtiment", montant: "48 900 MAD" },
  { id: "F-0139", client: "Oasis Média", montant: "7 600 MAD" },
];

function Formulaire() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Nouvelle facture</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap={3}>
          <Field label="Client">
            <Input defaultValue="Atlas Négoce SARL" />
          </Field>
          <Grid columns={2} gap={3}>
            <Field label="Échéance">
              <DatePicker defaultValue={new Date(2026, 9, 31)} />
            </Field>
            <Field label="Statut">
              <Select defaultValue="envoyee">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoyee">Envoyée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Grid>
          <Field label="Montant TTC">
            <NumberInput defaultValue={12400} unit="MAD" />
          </Field>
        </Stack>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Annuler</Button>
        <Button>
          <Send aria-hidden />
          Envoyer
        </Button>
      </CardFooter>
    </Card>
  );
}

function Factures() {
  return (
    <Table variant="card" aria-label="Dernières factures">
      <TableHeader>
        <TableRow>
          <TableHead>Facture</TableHead>
          <TableHead>Client</TableHead>
          <TableHead numeric>Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURES.map((f, i) => (
          <TableRow key={f.id} selected={i === 1}>
            <TableCell className="ui-num">{f.id}</TableCell>
            <TableCell>{f.client}</TableCell>
            <TableCell numeric>{f.montant}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MenuActions({ titre }: { titre: string }) {
  return (
    <Card variant="elevated" style={{ padding: 0, overflow: "hidden" }}>
      <Command label={`Actions sur la facture (${titre.toLowerCase()})`}>
        <CommandList>
          <CommandGroup heading="Facture F-0141">
            <CommandItem shortcut="⌘E"><Pencil aria-hidden />Modifier</CommandItem>
            <CommandItem shortcut="⌘D"><Copy aria-hidden />Dupliquer</CommandItem>
            <CommandItem><Download aria-hidden />Télécharger le PDF</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem><Trash2 aria-hidden />Supprimer</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Card>
  );
}

/** Un même écran (formulaire, table, menu) dans les trois densités. */
export const CoteACote: Story = {
  name: "Côte à côte",
  render: () => (
    <TroisDensites>
      {(densite) => (
        <>
          <Formulaire />
          <Factures />
          <MenuActions titre={DENSITES.find((d) => d.value === densite)!.titre} />
        </>
      )}
    </TroisDensites>
  ),
};

/** Les contrôles d'action : boutons, bascules, onglets, puces, pagination. */
export const Controles: Story = {
  name: "Contrôles",
  render: () => (
    <TroisDensites>
      {(densite) => (
        <Card variant="elevated">
          <CardContent>
            <Stack gap={4}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <Button size="sm" variant="outline">Petit</Button>
                <Button variant="tonal"><Plus aria-hidden />Ajouter</Button>
                <Button size="lg">Grand</Button>
                <Button size="icon" variant="ghost" aria-label="Nouveau document"><FilePlus2 aria-hidden /></Button>
              </div>
              <ToggleGroup type="single" variant="segmented" defaultValue="liste" aria-label={`Affichage (${densite})`}>
                <ToggleGroupItem value="liste"><List aria-hidden /><span>Liste</span></ToggleGroupItem>
                <ToggleGroupItem value="grille"><LayoutGrid aria-hidden /><span>Grille</span></ToggleGroupItem>
              </ToggleGroup>
              <Tabs defaultValue="toutes">
                <TabsList variant="line" aria-label={`Factures (${densite})`}>
                  <TabsTrigger value="toutes">Toutes</TabsTrigger>
                  <TabsTrigger value="retard">En retard</TabsTrigger>
                  <TabsTrigger value="payees">Payées</TabsTrigger>
                </TabsList>
                <TabsContent value="toutes"><Text size={13} tone="muted">128 factures sur la période.</Text></TabsContent>
                <TabsContent value="retard"><Text size={13} tone="muted">6 factures en retard.</Text></TabsContent>
                <TabsContent value="payees"><Text size={13} tone="muted">97 factures payées.</Text></TabsContent>
              </Tabs>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Chip selected>Ce mois-ci</Chip>
                <Chip>Casablanca</Chip>
                <Chip>Plus de 10 000 MAD</Chip>
              </div>
              <Pagination defaultPage={3} pageCount={8} siblingCount={0} labels={{ nav: `Pagination (${densite})` }} />
            </Stack>
          </CardContent>
        </Card>
      )}
    </TroisDensites>
  ),
};

const JETONS: { jeton: string; usage: string; axe: "h" | "w" }[] = [
  { jeton: "--ui-ctl-h-sm", usage: "Bouton sm, puce, déclencheur de Menubar", axe: "h" },
  { jeton: "--ui-ctl-h", usage: "Bouton, bascule, pagination, entrée de Sidebar", axe: "h" },
  { jeton: "--ui-ctl-h-lg", usage: "Bouton lg, case d'InputOTP", axe: "h" },
  { jeton: "--ui-ctl-px", usage: "Marge interne d'un bouton", axe: "w" },
  { jeton: "--ui-field-h-sm", usage: "Champ sm", axe: "h" },
  { jeton: "--ui-field-h", usage: "Input, Select, Combobox, DatePicker, NumberInput, SearchBar…", axe: "h" },
  { jeton: "--ui-field-px", usage: "Marge interne d'un champ", axe: "w" },
  { jeton: "--ui-row-h", usage: "Entrée de menu, de commande, d'arborescence", axe: "h" },
  { jeton: "--ui-row-h-list", usage: "Ligne de List, en-tête d'Accordion", axe: "h" },
  { jeton: "--ui-row-py", usage: "Marge verticale d'une ligne sur deux lignes de texte", axe: "w" },
  { jeton: "--ui-row-h-table", usage: "Ligne de Table", axe: "h" },
  { jeton: "--ui-row-h-table-head", usage: "En-tête de Table", axe: "h" },
  { jeton: "--ui-cell-px", usage: "Marge interne d'une cellule de Table", axe: "w" },
];

/** Valeur calculée d'un jeton sous une densité donnée, avec sa mesure dessinée. */
function Valeur({ jeton, densite, axe }: { jeton: string; densite: ThemeDensity; axe: "h" | "w" }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [valeur, setValeur] = React.useState("");
  React.useEffect(() => {
    if (ref.current) setValeur(getComputedStyle(ref.current).getPropertyValue(jeton).trim());
  }, [jeton, densite]);
  const mesure = `var(${jeton})`;
  return (
    <span ref={ref} data-ui-density={densite} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          flexShrink: 0,
          width: axe === "h" ? 28 : mesure,
          height: axe === "h" ? mesure : 12,
          borderRadius: "var(--ui-r-xs)",
          background: axe === "h" ? "var(--ui-card-hover)" : "var(--ui-pri-container)",
        }}
      />
      <Text size={12.5} mono>{valeur}</Text>
    </span>
  );
}

/** Les jetons et leurs valeurs, lues dans la feuille de style pour chaque densité. */
export const Jetons: Story = {
  render: () => (
    <Section
      title="Jetons de densité"
      description="Définis dans tokens.css sous [data-ui-density]. Aucun n'est dérivé d'un autre : les composants font leurs calculs eux-mêmes (calc), à leur niveau."
    >
      <Table variant="card" aria-label="Jetons de densité">
        <TableHeader>
          <TableRow>
            <TableHead>Jeton</TableHead>
            {DENSITES.map((d) => (
              <TableHead key={d.value}>{d.titre}</TableHead>
            ))}
            <TableHead>Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {JETONS.map((j) => (
            <TableRow key={j.jeton}>
              <TableCell><Text size={12.5} weight="semibold" mono>{j.jeton}</Text></TableCell>
              {DENSITES.map((d) => (
                <TableCell key={d.value} style={{ paddingBlock: 8 }}>
                  <Valeur jeton={j.jeton} densite={d.value} axe={j.axe} />
                </TableCell>
              ))}
              <TableCell><Text size={13} tone="muted">{j.usage}</Text></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  ),
};
