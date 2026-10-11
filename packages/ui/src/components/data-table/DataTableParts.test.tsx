import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { dataTableFormatters } from "./columns";
import { DataTableProvider } from "./context";
import { createColumnHelper, type ColumnDef } from "./DataTable";
import { DataTableColumnHeader, dataTableHeader } from "./DataTableColumnHeader";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableView } from "./DataTableView";
import { useDataTable } from "./useDataTable";

interface Client {
  id: string;
  nom: string;
  ville: string;
  ca: number;
}

const VILLES = ["Casablanca", "Rabat", "Fès"];
const CLIENTS: Client[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i}`,
  nom: `Client ${String.fromCharCode(65 + i)}`,
  ville: VILLES[i % 3],
  ca: (i + 1) * 1000,
}));

const col = createColumnHelper<Client>();
const COLUMNS = [
  col.accessor("nom", {
    header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title="Raison sociale" />,
  }),
  col.accessor("ville", { header: "Ville" }),
  col.accessor("ca", { header: dataTableHeader("Chiffre d'affaires"), meta: { numeric: true, label: "CA" } }),
] as ColumnDef<Client, any>[];

function Composee() {
  const table = useDataTable<Client>({ data: CLIENTS, columns: COLUMNS, getRowId: (c) => c.id, enableRowSelection: true, initialState: { pagination: { pageIndex: 0, pageSize: 5 } } });
  const ville = table.getColumn("ville")!;
  return (
    <DataTableProvider labels={{ searchPlaceholder: "Chercher un client", range: (a, b, total) => `${a} à ${b} (${total})` }}>
      <DataTableToolbar table={table} facets={false} columnVisibility={false}>
        <DataTableFacetedFilter column={ville} title="Ville" options={VILLES.map((v) => ({ value: v, label: v }))} />
      </DataTableToolbar>
      <DataTableView table={table} aria-label="Clients" density="compact" variant="card" />
      <DataTablePagination table={table} pageSizeOptions={[5, 10]} variant="compact" />
    </DataTableProvider>
  );
}

describe("DataTable — briques composées", () => {
  it("useDataTable + barre d'outils + vue + pagination, libellés du DataTableProvider", async () => {
    const user = userEvent.setup();
    render(<Composee />);
    const table = screen.getByRole("table", { name: "Clients" });
    expect(screen.getByPlaceholderText("Chercher un client")).toBeInTheDocument();
    expect(screen.getByText("1 à 5 (12)")).toBeInTheDocument();
    expect(screen.getByText("Page 1 sur 3")).toBeInTheDocument();
    // Colonne de sélection ajoutée d'office.
    expect(within(table).getByRole("checkbox", { name: "Tout sélectionner" })).toBeInTheDocument();

    // En-tête personnalisé : triable, aria-sort posé sur la cellule d'en-tête.
    await user.click(within(table).getByRole("button", { name: "Raison sociale" }));
    expect(within(table).getByRole("columnheader", { name: /^Raison sociale/ })).toHaveAttribute("aria-sort", "ascending");
    expect(within(table).getByRole("columnheader", { name: /^Chiffre d'affaires/ })).toHaveAttribute("data-numeric", "true");

    // Filtre à facettes autonome (options passées en prop).
    await user.click(screen.getByRole("button", { name: "Filtre : Ville" }));
    await user.click(within(await screen.findByRole("listbox")).getByRole("option", { name: /Rabat/ }));
    await user.keyboard("{Escape}");
    expect(within(table).getAllByRole("row")).toHaveLength(1 + 4);
    expect(screen.getByText("1 à 4 (4)")).toBeInTheDocument();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Composee />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("dataTableFormatters", () => {
  it("formate en français et laisse vide ce qui n'est pas une valeur", () => {
    expect(dataTableFormatters.number()(12450.5)).toMatch(/^12\s450,5$/);
    expect(dataTableFormatters.currency("MAD")(1250)).toMatch(/^1\s250,00\sMAD$/);
    expect(dataTableFormatters.percent()(0.125)).toMatch(/^12,5\s%$/);
    expect(dataTableFormatters.date()(new Date(2026, 9, 9))).toBe("9 oct. 2026");
    expect(dataTableFormatters.date()("2026-10-09T12:00:00")).toBe("9 oct. 2026");
    expect(dataTableFormatters.number()(null)).toBe("");
    expect(dataTableFormatters.date()("pas une date")).toBe("");
  });
});
