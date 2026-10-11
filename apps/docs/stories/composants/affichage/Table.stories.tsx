import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableSortDirection,
} from "@acme/ui";
import { FileIcon, MoreIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Affichage/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Table de données, à la manière de la vue liste de Drive : en-tête en casse de phrase, lignes séparées par un filet, survol tonal, ligne retenue en conteneur de sélection. `variant=\"card\"` l'enveloppe dans un panneau arrondi ; `density` règle la hauteur de ligne (40 / 48 / 56 px) ; `stickyHeader` fige l'en-tête ; `TableHead onSort` rend une colonne triable (`aria-sort`) ; `numeric` aligne les nombres. Pour paginer, voir `Pagination`.",
      },
    },
  },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

type Doc = { id: string; name: string; owner: string; initials: string; modified: string; size: number; status: "ok" | "warn" | "neu" };

const DOCS: Doc[] = [
  { id: "1", name: "Budget 2027.xlsx", owner: "Moi", initials: "SB", modified: "9 oct. 2026", size: 284, status: "ok" },
  { id: "2", name: "Contrat cadre.pdf", owner: "Inès Benali", initials: "IB", modified: "8 oct. 2026", size: 1240, status: "warn" },
  { id: "3", name: "Présentation Q4.pptx", owner: "Moi", initials: "SB", modified: "2 oct. 2026", size: 8420, status: "ok" },
  { id: "4", name: "Notes de réunion", owner: "Karim Alaoui", initials: "KA", modified: "28 sept. 2026", size: 36, status: "neu" },
  { id: "5", name: "Factures septembre.zip", owner: "Moi", initials: "SB", modified: "1 oct. 2026", size: 15300, status: "ok" },
];

const STATUS = { ok: ["ok", "Synchronisé"], warn: ["warn", "En attente"], neu: ["neu", "Hors connexion"] } as const;
const formatSize = (ko: number) => (ko >= 1000 ? `${(ko / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo` : `${ko} Ko`);

type SortKey = "name" | "modified" | "size";

function FilesTable({ variant, density }: { variant: "plain" | "card"; density?: "compact" | "default" | "comfortable" }) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: TableSortDirection }>({ key: "name", dir: "asc" });
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["2"]));
  const rows = [...DOCS].sort((a, b) => {
    const d = sort.key === "size" ? a.size - b.size : sort.key === "modified" ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name, "fr");
    return sort.dir === "asc" ? d : -d;
  });
  const by = (key: SortKey) => ({
    sort: sort.key === key ? sort.dir : (false as const),
    onSort: () => setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" })),
  });
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const all = selected.size === DOCS.length ? true : selected.size ? "indeterminate" : false;

  return (
    <Table variant={variant} density={density}>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 44 }}>
            <Checkbox
              aria-label="Tout sélectionner"
              checked={all}
              onCheckedChange={() => setSelected(all === true ? new Set() : new Set(DOCS.map((d) => d.id)))}
            />
          </TableHead>
          <TableHead {...by("name")}>Nom</TableHead>
          <TableHead>Propriétaire</TableHead>
          <TableHead {...by("modified")}>Modifié</TableHead>
          <TableHead>État</TableHead>
          <TableHead numeric {...by("size")}>Taille</TableHead>
          <TableHead style={{ width: 48 }}><span className="ui-sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((d) => (
          <TableRow key={d.id} selected={selected.has(d.id)}>
            <TableCell>
              <Checkbox aria-label={`Sélectionner ${d.name}`} checked={selected.has(d.id)} onCheckedChange={() => toggle(d.id)} />
            </TableCell>
            <TableCell>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", width: 18, height: 18, color: "var(--ui-c1)" }}><FileIcon /></span>
                {d.name}
              </span>
            </TableCell>
            <TableCell>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Avatar size="sm"><AvatarFallback>{d.initials}</AvatarFallback></Avatar>
                {d.owner}
              </span>
            </TableCell>
            <TableCell style={{ color: "var(--ui-fg-2)" }}>{d.modified}</TableCell>
            <TableCell><Badge variant={STATUS[d.status][0]}>{STATUS[d.status][1]}</Badge></TableCell>
            <TableCell numeric>{formatSize(d.size)}</TableCell>
            <TableCell>
              <Menu>
                <MenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost" aria-label={`Actions pour ${d.name}`}><MoreIcon /></Button>
                </MenuTrigger>
                <MenuContent align="end">
                  <MenuItem>Ouvrir</MenuItem>
                  <MenuItem>Renommer</MenuItem>
                  <MenuItem variant="danger">Supprimer</MenuItem>
                </MenuContent>
              </Menu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {variant === "card" && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>{DOCS.length} fichiers</TableCell>
            <TableCell numeric>{formatSize(DOCS.reduce((t, d) => t + d.size, 0))}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      )}
      <TableCaption>{selected.size} sélectionné{selected.size > 1 ? "s" : ""} · cliquez un intitulé pour trier.</TableCaption>
    </Table>
  );
}

/** Vue liste de Drive sur un panneau : sélection par cases, tri, menu d'actions par ligne. */
export const VueListe: Story = {
  name: "Vue liste (sur panneau)",
  render: () => (
    <div style={{ padding: "8px 8px 0", borderRadius: "var(--ui-r-2xl)", background: "var(--ui-panel)", maxWidth: 1040 }}>
      <FilesTable variant="plain" />
    </div>
  ),
};

/** Table seule sur le fond d'application : panneau arrondi, pied de totaux, densité compacte. */
export const EnCarte: Story = {
  name: "En carte, densité compacte",
  render: () => (
    <div style={{ maxWidth: 1040 }}>
      <FilesTable variant="card" density="compact" />
    </div>
  ),
};

/** Avec une hauteur maximale sur le conteneur, l'en-tête reste visible au défilement. */
export const EnTeteCollant: Story = {
  name: "En-tête collant",
  render: () => (
    <Table variant="card" stickyHeader containerStyle={{ maxHeight: 260, maxWidth: 560 }}>
      <TableHeader>
        <TableRow>
          <TableHead>Facture</TableHead>
          <TableHead numeric>Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 14 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>F-2026-{String(i + 101).padStart(4, "0")}</TableCell>
            <TableCell numeric>{(1250 + i * 317.5).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} MAD</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
