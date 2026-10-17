import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { getDataTableAggregate } from "./aggregate";
import { dataTableFormatters } from "./columns";
import { createColumnHelper, DataTable, type ColumnDef, type DataTableInstance } from "./DataTable";

type Statut = "payee" | "retard";
interface Facture {
  id: string;
  numero: string;
  client: string;
  statut: Statut;
  montant: number;
  emission: Date;
}

const FACTURES: Facture[] = Array.from({ length: 25 }, (_, i) => ({
  id: `f${i + 1}`,
  numero: `F-2026-${String(i + 1).padStart(3, "0")}`,
  client: ["Atlas Négoce", "Café Zellige", "Électro Sud", "Groupe Tazi"][i % 4],
  statut: i % 3 === 0 ? "retard" : "payee",
  montant: 1000 + i * 100,
  emission: new Date(2026, 0, 1 + i),
}));

const mad = dataTableFormatters.currency("MAD");
const sum = (rows: Facture[]) => rows.reduce((total, f) => total + f.montant, 0);
// Espaces insécables du formateur : on compare sans elles.
const plain = (text: string | null | undefined) => (text ?? "").replace(/\s/g, " ");

const col = createColumnHelper<Facture>();
const COLUMNS: ColumnDef<Facture, any>[] = [
  col.accessor("numero", { header: "Numéro" }),
  col.accessor("client", { header: "Client" }),
  col.accessor("statut", {
    header: "Statut",
    meta: { filterOptions: [{ value: "payee", label: "Payée" }, { value: "retard", label: "En retard" }] },
  }),
  col.accessor("montant", { header: "Montant", meta: { numeric: true, format: mad, aggregate: "sum" } }),
];

const footer = () => screen.getByRole("table").querySelector("tfoot")!;
const footerCell = (id: string) => footer().querySelector<HTMLElement>(`[data-column-id="${id}"]`)!;

describe("DataTable — ligne de totaux", () => {
  it("somme sur toutes les lignes filtrées, pas seulement la page, formatée par meta.format", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={(f) => f.id} />);
    expect(screen.getByText("1–10 sur 25")).toBeInTheDocument();
    expect(plain(footerCell("montant").textContent)).toBe(plain(mad(sum(FACTURES))));
    expect(footerCell("montant")).toHaveAttribute("data-numeric", "true");

    // Libellé « Total » : en-tête de ligne dans la première colonne sans agrégat.
    const label = within(footer()).getByRole("rowheader", { name: "Total" });
    expect(label).toBe(footerCell("numero"));
    expect(label).toHaveAttribute("scope", "row");

    await user.click(screen.getByRole("button", { name: "Filtre : Statut" }));
    await user.click(within(await screen.findByRole("listbox")).getByRole("option", { name: /En retard/ }));
    await user.keyboard("{Escape}");
    const retard = FACTURES.filter((f) => f.statut === "retard");
    expect(plain(footerCell("montant").textContent)).toBe(plain(mad(sum(retard))));
  });

  it("compte, moyenne, minimum, maximum, fonction et libellé personnalisé", () => {
    const columns: ColumnDef<Facture, any>[] = [
      col.accessor("numero", { header: "Numéro", meta: { aggregate: "count" } }),
      col.accessor("client", {
        header: "Client",
        meta: { aggregate: (values) => `${new Set(values).size} clients` },
      }),
      col.accessor("statut", { header: "Statut", meta: { footerLabel: "Synthèse" } }),
      col.accessor("emission", { header: "Émission", meta: { aggregate: "max", format: dataTableFormatters.date() } }),
      col.accessor("montant", { header: "Moyenne", meta: { numeric: true, aggregate: "avg", format: mad } }),
      col.accessor((f) => f.montant, { id: "min", header: "Minimum", meta: { numeric: true, aggregate: "min" } }),
    ];
    render(<DataTable columns={columns} data={FACTURES} getRowId={(f) => f.id} toolbar={false} />);
    expect(footerCell("numero")).toHaveTextContent("25");
    expect(footerCell("client")).toHaveTextContent("4 clients");
    expect(within(footer()).getByRole("rowheader", { name: "Synthèse" })).toBe(footerCell("statut"));
    expect(within(footer()).queryByText("Total")).not.toBeInTheDocument();
    expect(footerCell("emission")).toHaveTextContent("25 janv. 2026");
    expect(plain(footerCell("montant").textContent)).toBe(plain(mad(sum(FACTURES) / 25)));
    // Sans formateur : rendu français.
    expect(plain(footerCell("min").textContent)).toBe("1 000");
  });

  it("`showFooter` force ou retire la ligne ; pas de pied sans agrégat", () => {
    const sansAgregat = COLUMNS.map((c) => ({ ...c, meta: { ...c.meta, aggregate: undefined } }));
    const { rerender } = render(<DataTable columns={sansAgregat} data={FACTURES} getRowId={(f) => f.id} toolbar={false} />);
    expect(screen.getByRole("table").querySelector("tfoot")).toBeNull();
    rerender(<DataTable columns={COLUMNS} data={FACTURES} getRowId={(f) => f.id} toolbar={false} showFooter={false} />);
    expect(screen.getByRole("table").querySelector("tfoot")).toBeNull();
    rerender(<DataTable columns={sansAgregat} data={FACTURES} getRowId={(f) => f.id} toolbar={false} showFooter />);
    expect(within(footer()).getByRole("rowheader", { name: "Total" })).toBeInTheDocument();
    // Pas de pied sur une table vide.
    rerender(<DataTable columns={COLUMNS} data={[]} toolbar={false} />);
    expect(screen.getByRole("table").querySelector("tfoot")).toBeNull();
  });

  it("mode serveur : rien n'est calculé sur la page, les totaux viennent de `aggregates`", () => {
    const page = FACTURES.slice(0, 10);
    const { rerender } = render(
      <DataTable columns={COLUMNS} data={page} getRowId={(f) => f.id} manualPagination rowCount={95} toolbar={false} />,
    );
    // Une page sur dix : le total local serait faux, la cellule reste vide.
    expect(footerCell("montant")).toBeEmptyDOMElement();

    rerender(
      <DataTable
        columns={COLUMNS}
        data={page}
        getRowId={(f) => f.id}
        manualPagination
        rowCount={95}
        toolbar={false}
        aggregates={{ montant: 1_234_567.8, client: <strong>18 clients</strong> }}
      />,
    );
    expect(plain(footerCell("montant").textContent)).toBe(plain(mad(1_234_567.8)));
    expect(within(footerCell("client")).getByText("18 clients").tagName).toBe("STRONG");
  });

  it("getDataTableAggregate : l'agrégat d'une colonne pour un pied sur mesure", () => {
    let instance: DataTableInstance<Facture> | null = null;
    render(<DataTable columns={COLUMNS} data={FACTURES} getRowId={(f) => f.id} onTableReady={(t) => (instance = t)} />);
    const t = instance!;
    expect(plain(String(getDataTableAggregate(t.getColumn("montant")!, t.getFilteredRowModel().rows)))).toBe(
      plain(mad(sum(FACTURES))),
    );
    expect(getDataTableAggregate(t.getColumn("client")!, t.getFilteredRowModel().rows)).toBeUndefined();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <DataTable aria-label="Factures" columns={COLUMNS} data={FACTURES} getRowId={(f) => f.id} enableRowSelection maxHeight={400} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
