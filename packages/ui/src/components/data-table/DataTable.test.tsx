import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { onTestFinished } from "vitest";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Badge } from "../badge/Badge";
import { Button } from "../button/Button";
import { MenuItem } from "../menu/Menu";
import { actionsColumn, dataTableFormatters } from "./columns";
import { createColumnHelper, DataTable, type ColumnDef, type DataTableInstance } from "./DataTable";

type Statut = "payee" | "attente" | "retard";
interface Facture {
  id: string;
  numero: string;
  client: string;
  statut: Statut;
  montant: number;
  emission: Date | null;
}

const CLIENTS = ["Atlas Négoce", "Bennani & Fils", "Café Zellige", "Électro Sud"];
const STATUTS: Statut[] = ["payee", "attente", "retard"];
const STATUT_LABEL: Record<Statut, string> = { payee: "Payée", attente: "En attente", retard: "En retard" };

const FACTURES: Facture[] = Array.from({ length: 25 }, (_, i) => ({
  id: `f${i + 1}`,
  numero: `F-2026-${String(i + 1).padStart(3, "0")}`,
  client: CLIENTS[i % CLIENTS.length],
  statut: STATUTS[i % STATUTS.length],
  montant: 1000 + ((i * 7919) % 25) * 100 + 0.5,
  emission: i === 3 ? null : new Date(2026, 8, 1 + i),
}));

const col = createColumnHelper<Facture>();
const COLUMNS = [
  col.accessor("numero", { header: "Numéro" }),
  col.accessor("client", {
    header: "Client",
    meta: { filterOptions: CLIENTS.map((c) => ({ value: c, label: c })) },
  }),
  col.accessor("statut", {
    header: "Statut",
    cell: ({ getValue }) => <Badge variant="neu">{STATUT_LABEL[getValue<Statut>()]}</Badge>,
    meta: {
      format: (v: Statut) => STATUT_LABEL[v],
      filterOptions: STATUTS.map((s) => ({ value: s, label: STATUT_LABEL[s] })),
    },
  }),
  col.accessor("montant", { header: "Montant", meta: { numeric: true, format: dataTableFormatters.currency("MAD") } }),
  col.accessor("emission", { header: "Émission" }),
] as ColumnDef<Facture, any>[];

const getRowId = (f: Facture) => f.id;
const table = () => screen.getByRole("table");
const bodyRows = () => within(table()).getAllByRole("row").slice(1);
const firstCells = () => bodyRows().map((row) => within(row).getAllByRole("cell")[0]?.textContent);
const header = (name: string) => within(table()).getByRole("columnheader", { name: new RegExp(`^${name}`) });
const sortButton = (name: string) => within(table()).getByRole("button", { name });
const selectionBar = () => screen.getByRole("group", { name: "Actions sur la sélection" });

afterEach(() => {
  window.localStorage.clear();
});

describe("DataTable", () => {
  it("marche sans configuration : en-têtes, cellules formatées, pagination", () => {
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} aria-label="Factures" />);
    expect(table()).toHaveAccessibleName("Factures");
    expect(bodyRows()).toHaveLength(10);
    const row = bodyRows()[0];
    // Montant : formateur MAD, aligné à droite ; date au format français.
    const montant = within(row).getAllByRole("cell")[3];
    expect(montant).toHaveAttribute("data-numeric", "true");
    expect(montant.textContent).toMatch(/1\s?000,50\s?MAD/);
    expect(within(row).getAllByRole("cell")[4]).toHaveTextContent("1 sept. 2026");
    // Valeur vide : tiret discret.
    expect(within(bodyRows()[3]).getAllByRole("cell")[4]).toHaveTextContent("—");
    expect(screen.getByText("1–10 sur 25")).toBeInTheDocument();
  });

  it("une cellule tient sur une ligne, sauf colonne `meta.wrap`", () => {
    const columns = [
      col.accessor("numero", { header: "Numéro" }),
      col.accessor("client", { header: "Client", meta: { wrap: true } }),
    ] as ColumnDef<Facture, any>[];
    render(<DataTable columns={columns} data={FACTURES.slice(0, 2)} getRowId={getRowId} toolbar={false} />);
    const [numero, client] = within(bodyRows()[0]).getAllByRole("cell");
    expect(numero).not.toHaveAttribute("data-wrap");
    expect(client).toHaveAttribute("data-wrap", "true");
  });

  it("trie au clic (aria-sort), puis multi-colonnes avec Maj+clic", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} enablePagination={false} />);
    expect(header("Montant")).toHaveAttribute("aria-sort", "none");

    await user.click(sortButton("Montant"));
    expect(header("Montant")).toHaveAttribute("aria-sort", "ascending");
    const asc = bodyRows().map((r) => within(r).getAllByRole("cell")[3].textContent);
    expect(asc[0]).toMatch(/^1\s?000,50/);

    await user.click(sortButton("Montant"));
    expect(header("Montant")).toHaveAttribute("aria-sort", "descending");
    expect(within(bodyRows()[0]).getAllByRole("cell")[3].textContent).toMatch(/^3\s?400,50/);

    await user.click(sortButton("Montant"));
    expect(header("Montant")).toHaveAttribute("aria-sort", "none");

    // Tri français : « Électro Sud » se range avec les E, avant les lettres suivantes.
    await user.click(sortButton("Client"));
    const clients = bodyRows().map((r) => within(r).getAllByRole("cell")[1].textContent);
    expect(clients[clients.length - 1]).toBe("Électro Sud");

    // Maj+clic : second critère, rang affiché.
    await user.keyboard("{Shift>}");
    await user.click(sortButton("Montant"));
    await user.keyboard("{/Shift}");
    expect(header("Client")).toHaveAttribute("aria-sort", "ascending");
    expect(header("Montant")).toHaveAttribute("aria-sort", "ascending");
    expect(within(header("Montant")).getByText("2")).toBeInTheDocument();
  });

  it("menu de colonne : trier et masquer la colonne", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} />);
    await user.click(screen.getByRole("button", { name: "Options de la colonne Montant" }));
    await user.click(screen.getByRole("menuitem", { name: "Trier par ordre décroissant" }));
    expect(header("Montant")).toHaveAttribute("aria-sort", "descending");

    await user.click(screen.getByRole("button", { name: "Options de la colonne Montant" }));
    await user.click(screen.getByRole("menuitem", { name: "Masquer la colonne" }));
    expect(within(table()).queryByRole("columnheader", { name: /Montant/ })).not.toBeInTheDocument();
  });

  it("recherche globale sans accents ni casse, plusieurs mots, Échap pour vider", async () => {
    // Collage plutôt que frappe : chaque frappe re-rend les 25 lignes, ce qui rend le test lent et
    // fragile quand la suite tourne en parallèle. Le filtrage, lui, est le même.
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} enablePagination={false} />);
    const search = screen.getByRole("searchbox", { name: "Rechercher dans le tableau" });

    await user.click(search);
    await user.paste("electro");
    await waitFor(() =>
      expect(firstCells().length).toBe(FACTURES.filter((f) => f.client === "Électro Sud").length),
    );
    expect(bodyRows().length).toBeGreaterThan(0);

    // Deux mots, deux colonnes : client et statut formaté.
    await user.clear(search);
    await user.paste("atlas retard");
    const expected = FACTURES.filter((f) => f.client === "Atlas Négoce" && f.statut === "retard").length;
    await waitFor(() => expect(bodyRows()).toHaveLength(expected));
    await waitFor(() => expect(screen.getByText(`${expected} résultats`)).toBeInTheDocument());

    await user.keyboard("{Escape}");
    expect(search).toHaveValue("");
    await waitFor(() => expect(bodyRows()).toHaveLength(25));
  });

  it("filtres à facettes : compteurs, sélection multiple, puce « Statut · 2 », réinitialisation", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} enablePagination={false} />);
    const chip = screen.getByRole("button", { name: "Filtre : Statut" });
    await user.click(chip);

    const list = await screen.findByRole("listbox");
    const payee = within(list).getByRole("option", { name: /Payée/ });
    expect(payee).toHaveTextContent(String(FACTURES.filter((f) => f.statut === "payee").length));
    await user.click(payee);
    expect(payee).toHaveAttribute("aria-checked", "true");
    expect(bodyRows()).toHaveLength(9);
    expect(chip).toHaveTextContent("Statut · Payée");

    await user.click(within(list).getByRole("option", { name: /En retard/ }));
    expect(chip).toHaveTextContent("Statut · 2");
    expect(chip).toHaveAccessibleName(/Statut · 2 sélectionnés/);
    expect(bodyRows()).toHaveLength(17);

    // Les compteurs des autres facettes tiennent compte de ce filtre.
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Filtre : Client" }));
    const atlas = within(await screen.findByRole("listbox")).getByRole("option", { name: /Atlas Négoce/ });
    const expectedAtlas = FACTURES.filter((f) => f.client === "Atlas Négoce" && f.statut !== "attente").length;
    expect(atlas).toHaveTextContent(String(expectedAtlas));
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: /Réinitialiser/ }));
    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByRole("button", { name: "Filtre : Statut" })).not.toHaveTextContent("·");
  });

  it("pagination : plage, page suivante, lignes par page", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} />);
    expect(screen.getByText("1–10 sur 25")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Page suivante" }));
    expect(screen.getByText("11–20 sur 25")).toBeInTheDocument();
    expect(firstCells()[0]).toBe("F-2026-011");
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    expect(bodyRows()).toHaveLength(5);

    const pageSize = screen.getByRole("combobox", { name: "Lignes par page" });
    pageSize.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "50" }));
    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText("1–25 sur 25")).toBeInTheDocument();
  });

  it("sélection : tout sélectionner (tri-état), plage Maj+clic, barre d'actions groupées", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        data={FACTURES}
        getRowId={getRowId}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        bulkActions={({ rows, clear }) => (
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              onDelete(rows.map((r) => r.id));
              clear();
            }}
          >
            Supprimer
          </Button>
        )}
      />,
    );
    const all = screen.getByRole("checkbox", { name: "Tout sélectionner" });
    await user.click(screen.getByRole("checkbox", { name: "Sélectionner F-2026-002" }));
    expect(all).toHaveAttribute("data-state", "indeterminate");
    expect(selectionBar()).toHaveTextContent("1 sélectionnée");
    expect(bodyRows()[1]).toHaveAttribute("data-state", "selected");

    // Maj+clic : de F-002 à F-005.
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("checkbox", { name: "Sélectionner F-2026-005" }));
    await user.keyboard("{/Shift}");
    expect(selectionBar()).toHaveTextContent("4 sélectionnées");
    expect(screen.getByRole("checkbox", { name: "Sélectionner F-2026-003" })).toHaveAttribute("data-state", "checked");

    await user.click(all);
    expect(all).toHaveAttribute("data-state", "checked");
    expect(selectionBar()).toHaveTextContent("10 sélectionnées");
    await user.click(screen.getByRole("button", { name: "Sélectionner les 25 lignes" }));
    expect(selectionBar()).toHaveTextContent("25 sélectionnées");

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onDelete).toHaveBeenCalledWith(FACTURES.map((f) => f.id));
    expect(screen.queryByRole("group", { name: "Actions sur la sélection" })).not.toBeInTheDocument();
    expect(all).toHaveAttribute("data-state", "unchecked");
  });

  it("« Tout désélectionner » et Échap vident la sélection, le focus revient à la case d'en-tête", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} enableRowSelection />);
    await user.click(screen.getByRole("checkbox", { name: "Tout sélectionner" }));
    await user.click(screen.getByRole("button", { name: "Tout désélectionner" }));
    expect(screen.queryByRole("group", { name: "Actions sur la sélection" })).not.toBeInTheDocument();
    expect(screen.getByText("Sélection vidée")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Tout sélectionner" })).toHaveFocus());

    await user.click(screen.getByRole("checkbox", { name: "Sélectionner la ligne 1" }));
    screen.getByRole("button", { name: "Tout désélectionner" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("group", { name: "Actions sur la sélection" })).not.toBeInTheDocument();
  });

  it("visibilité des colonnes : menu « Colonnes », compteur, « Tout afficher »", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} />);
    await user.click(screen.getByRole("button", { name: "Colonnes" }));
    const montant = screen.getByRole("menuitemcheckbox", { name: "Montant" });
    expect(montant).toHaveAttribute("aria-checked", "true");
    await user.click(montant);
    // Le menu reste ouvert pour enchaîner.
    expect(screen.getByRole("menuitemcheckbox", { name: "Montant" })).toHaveAttribute("aria-checked", "false");
    // Menu modal ouvert : le reste de la page est masqué aux technologies d'assistance.
    const hiddenTable = () => within(screen.getByRole("table", { hidden: true }));
    expect(hiddenTable().queryByRole("columnheader", { name: /Montant/, hidden: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Tout afficher" }));
    expect(hiddenTable().getByRole("columnheader", { name: /^Montant/, hidden: true })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Colonnes" })).toBeInTheDocument();
  });

  it("densité : segmented control posé sur la table", async () => {
    const user = userEvent.setup();
    const onDensityChange = vi.fn();
    const { container } = render(
      <DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} onDensityChange={onDensityChange} />,
    );
    await user.click(screen.getByRole("radio", { name: "Compacte" }));
    expect(onDensityChange).toHaveBeenCalledWith("compact");
    expect(container.querySelector(".ui-table-container")).toHaveAttribute("data-density", "compact");
  });

  it("états : vide, aucun résultat avec « Effacer les filtres », chargement et rechargement", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DataTable columns={COLUMNS} data={[]} />);
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();

    rerender(<DataTable columns={COLUMNS} data={[]} loading />);
    expect(table()).toHaveAttribute("aria-busy", "true");
    expect(table().querySelectorAll(".ui-data-table__skeleton-row")).toHaveLength(10);

    rerender(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} loading />);
    expect(screen.getByRole("progressbar", { name: "Chargement…" })).toBeInTheDocument();
    expect(table().closest(".ui-data-table__view")).toHaveAttribute("data-state", "reloading");
    expect(bodyRows()).toHaveLength(10);

    rerender(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} />);
    await user.type(screen.getByRole("searchbox"), "introuvable");
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Effacer les filtres" }));
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("mode serveur : callbacks avec la nouvelle valeur, retour en page 1 au tri", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    const onSortingChange = vi.fn();
    const onGlobalFilterChange = vi.fn();
    const onColumnFiltersChange = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        data={FACTURES.slice(0, 10)}
        getRowId={getRowId}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={95}
        searchDebounce={0}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onGlobalFilterChange={onGlobalFilterChange}
        onColumnFiltersChange={onColumnFiltersChange}
      />,
    );
    expect(screen.getByText("1–10 sur 95")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 10" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Page suivante" }));
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 });
    expect(screen.getByText("11–20 sur 95")).toBeInTheDocument();

    await user.click(sortButton("Montant"));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: "montant", desc: false }]);
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 10 });
    // Les données ne sont pas triées localement : c'est le serveur qui renvoie la page.
    expect(firstCells()[0]).toBe("F-2026-001");

    await user.type(screen.getByRole("searchbox"), "ab");
    expect(onGlobalFilterChange).toHaveBeenLastCalledWith("ab");
    expect(bodyRows()).toHaveLength(10);

    await user.click(screen.getByRole("button", { name: "Filtre : Statut" }));
    const option = within(await screen.findByRole("listbox")).getByRole("option", { name: /Payée/ });
    // Pas de compteur calculé sur une page partielle.
    expect(option.querySelector(".ui-data-table-facet__count")).toBeNull();
    await user.click(option);
    expect(onColumnFiltersChange).toHaveBeenLastCalledWith([{ id: "statut", value: ["payee"] }]);
  });

  it("état contrôlé : la table suit `state`", () => {
    const { rerender } = render(
      <DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} state={{ sorting: [{ id: "montant", desc: true }] }} />,
    );
    expect(header("Montant")).toHaveAttribute("aria-sort", "descending");
    rerender(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} state={{ sorting: [] }} />);
    expect(header("Montant")).toHaveAttribute("aria-sort", "none");
  });

  it("clavier : ligne focalisable, flèches, Entrée et Espace ; les contrôles de la ligne ne l'ouvrent pas", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={[
          ...COLUMNS,
          actionsColumn<Facture>((row) => <MenuItem onSelect={() => undefined}>Ouvrir {row.original.numero}</MenuItem>),
        ]}
        data={FACTURES}
        getRowId={getRowId}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        onRowClick={(row) => onRowClick(row.original.numero)}
      />,
    );
    const rows = bodyRows();
    expect(rows[0]).toHaveAttribute("tabindex", "0");
    expect(rows[1]).toHaveAttribute("tabindex", "-1");

    rows[0].focus();
    await user.keyboard("{ArrowDown}");
    expect(bodyRows()[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(bodyRows()[9]).toHaveFocus();
    await user.keyboard("{Home}{Enter}");
    expect(onRowClick).toHaveBeenLastCalledWith("F-2026-001");

    await user.keyboard(" ");
    expect(bodyRows()[0]).toHaveAttribute("data-state", "selected");

    await user.click(within(bodyRows()[2]).getAllByRole("cell")[1]);
    expect(onRowClick).toHaveBeenLastCalledWith("F-2026-003");
    expect(onRowClick).toHaveBeenCalledTimes(2);

    // Case et menu « ⋯ » : pas de clic de ligne, y compris depuis le menu en portail.
    await user.click(screen.getByRole("checkbox", { name: "Sélectionner F-2026-004" }));
    await user.click(screen.getByRole("button", { name: "Actions pour F-2026-005" }));
    await user.click(screen.getByRole("menuitem", { name: "Ouvrir F-2026-005" }));
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("persistance : tri et densité relus depuis localStorage ; stockage corrompu ignoré", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} persistKey="factures" />);
    await user.click(sortButton("Montant"));
    await user.click(screen.getByRole("radio", { name: "Confortable" }));
    unmount();
    const saved = JSON.parse(window.localStorage.getItem("acme-ui:data-table:factures") ?? "{}");
    expect(saved).toMatchObject({ sorting: [{ id: "montant", desc: false }], density: "comfortable", pageSize: 10 });

    const { container, unmount: unmount2 } = render(
      <DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} persistKey="factures" />,
    );
    expect(header("Montant")).toHaveAttribute("aria-sort", "ascending");
    expect(container.querySelector(".ui-table-container")).toHaveAttribute("data-density", "comfortable");
    unmount2();

    window.localStorage.setItem("acme-ui:data-table:factures", "{pas du json");
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} persistKey="factures" />);
    expect(header("Montant")).toHaveAttribute("aria-sort", "none");
  });

  it("accès à l'instance : onTableReady et tableRef", () => {
    const onTableReady = vi.fn();
    const ref = React.createRef<DataTableInstance<Facture>>();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={getRowId} onTableReady={onTableReady} tableRef={ref} />);
    expect(onTableReady).toHaveBeenCalledOnce();
    expect(ref.current).toBe(onTableReady.mock.calls[0][0]);
    act(() => ref.current!.setPageIndex(2));
    expect(screen.getByText("21–25 sur 25")).toBeInTheDocument();
  });

  it("virtualisation : seules les lignes visibles sont rendues", () => {
    // jsdom ne calcule pas la mise en page : la zone défilante mesure 400 px.
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400);
    const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(800);
    onTestFinished(() => {
      height.mockRestore();
      width.mockRestore();
    });
    const many = Array.from({ length: 10_000 }, (_, i) => ({ id: String(i), nom: `Ligne ${i + 1}`, valeur: i }));
    const h = createColumnHelper<(typeof many)[number]>();
    render(
      <DataTable
        columns={[h.accessor("nom", { header: "Nom" }), h.accessor("valeur", { header: "Valeur", meta: { numeric: true } })] as ColumnDef<(typeof many)[number], any>[]}
        data={many}
        getRowId={(r) => r.id}
        virtualized
        height={400}
      />,
    );
    expect(table()).toHaveAttribute("aria-rowcount", "10001");
    const rendered = table().querySelectorAll("tbody [data-row-index]");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(60);
    expect(rendered[0]).toHaveAttribute("aria-rowindex", "2");
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });

  it("sans violation d'accessibilité (sélection, facettes, actions, pagination)", async () => {
    const { container } = render(
      <DataTable
        aria-label="Factures"
        columns={[...COLUMNS, actionsColumn<Facture>(() => <MenuItem>Ouvrir</MenuItem>)]}
        data={FACTURES}
        getRowId={getRowId}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        enableExport
        onRowClick={() => undefined}
        initialState={{ rowSelection: { f1: true } }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sans violation d'accessibilité à l'état vide et en chargement", async () => {
    const { container, rerender } = render(<DataTable aria-label="Factures" columns={COLUMNS} data={[]} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<DataTable aria-label="Factures" columns={COLUMNS} data={[]} loading />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DataTable — saisie différée", () => {
  it("applique la recherche après le délai en filtrage serveur", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const onGlobalFilterChange = vi.fn();
      render(
        <DataTable columns={COLUMNS} data={FACTURES} manualFiltering onGlobalFilterChange={onGlobalFilterChange} />,
      );
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "atlas" } });
      expect(onGlobalFilterChange).not.toHaveBeenCalled();
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      expect(onGlobalFilterChange).toHaveBeenCalledWith("atlas");
    } finally {
      vi.useRealTimers();
    }
  });
});
