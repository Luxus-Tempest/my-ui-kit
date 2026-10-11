import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { MenuItem } from "../menu/Menu";
import { actionsColumn, dataTableFormatters } from "./columns";
import { createColumnHelper, DataTable, type ColumnDef, type ColumnPinningState } from "./DataTable";

interface Facture {
  id: string;
  numero: string;
  client: string;
  ville: string;
  montant: number;
}

const FACTURES: Facture[] = Array.from({ length: 6 }, (_, i) => ({
  id: `f${i + 1}`,
  numero: `F-2026-00${i + 1}`,
  client: ["Atlas Négoce", "Café Zellige", "Électro Sud"][i % 3],
  ville: ["Casablanca", "Marrakech", "Agadir"][i % 3],
  montant: 1000 + i * 250,
}));

const col = createColumnHelper<Facture>();
const columns = (pinNumero = false): ColumnDef<Facture, any>[] => [
  col.accessor("numero", { header: "Numéro", meta: { pin: pinNumero ? "start" : undefined, width: 120 } }),
  col.accessor("client", { header: "Client", meta: { width: 200 } }),
  col.accessor("ville", { header: "Ville" }),
  col.accessor("montant", { header: "Montant", meta: { numeric: true, format: dataTableFormatters.currency("MAD") } }),
  actionsColumn<Facture>((row) => <MenuItem>Ouvrir {row.original.numero}</MenuItem>),
];

const getRowId = (f: Facture) => f.id;
const table = () => screen.getByRole("table");
const headerIds = () => within(table()).getAllByRole("columnheader").map((th) => th.getAttribute("data-column-id"));
const head = (id: string) => table().querySelector<HTMLElement>(`th[data-column-id="${id}"]`)!;
const firstRowCell = (id: string) => table().querySelector<HTMLElement>(`tbody tr td[data-column-id="${id}"]`)!;
const offset = (element: HTMLElement) => element.style.getPropertyValue("--_pin-offset");

afterEach(() => window.localStorage.clear());

describe("DataTable — colonnes figées", () => {
  it("fige d'office la sélection au début et les actions à la fin", () => {
    render(<DataTable columns={columns()} data={FACTURES} getRowId={getRowId} enableRowSelection toolbar={false} />);
    expect(headerIds()).toEqual(["select", "numero", "client", "ville", "montant", "actions"]);
    expect(head("select")).toHaveAttribute("data-pin", "start");
    expect(head("select")).toHaveAttribute("data-pin-edge", "true");
    expect(offset(head("select"))).toBe("0px");
    expect(head("actions")).toHaveAttribute("data-pin", "end");
    expect(offset(firstRowCell("actions"))).toBe("0px");
    expect(head("client")).not.toHaveAttribute("data-pin");
    // Les colonnes figées d'office n'ont pas de menu pour les libérer.
    expect(within(head("select")).queryByRole("button", { name: /Options/ })).not.toBeInTheDocument();
  });

  it("`meta.pin` : décalage après les colonnes figées qui précèdent, filet sur la dernière", () => {
    render(<DataTable columns={columns(true)} data={FACTURES} getRowId={getRowId} enableRowSelection toolbar={false} />);
    // Sans mise en page (jsdom), le décalage vient des largeurs théoriques : 56 px pour la case.
    expect(head("numero")).toHaveAttribute("data-pin", "start");
    expect(offset(head("numero"))).toBe("56px");
    expect(offset(firstRowCell("numero"))).toBe("56px");
    expect(head("numero")).toHaveAttribute("data-pin-edge", "true");
    expect(head("select")).not.toHaveAttribute("data-pin-edge");
    expect(table().closest(".ui-data-table__view")).toHaveAttribute("data-pin-start", "true");
    expect(table().closest(".ui-data-table__view")).toHaveAttribute("data-pin-end", "true");
  });

  it("menu de colonne : figer au début, à la fin, libérer ; la colonne change de place", async () => {
    const user = userEvent.setup();
    const onColumnPinningChange = vi.fn();
    render(
      <DataTable
        columns={columns()}
        data={FACTURES}
        getRowId={getRowId}
        enableRowSelection
        toolbar={false}
        onColumnPinningChange={onColumnPinningChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Options de la colonne Ville" }));
    expect(screen.queryByRole("menuitem", { name: "Libérer" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Figer au début" }));
    expect(headerIds()).toEqual(["select", "ville", "numero", "client", "montant", "actions"]);
    expect(head("ville")).toHaveAttribute("data-pin", "start");
    // L'appelant ne reçoit que son choix, sans les colonnes figées d'office.
    expect(onColumnPinningChange).toHaveBeenLastCalledWith({ left: ["ville"], right: [] });

    await user.click(screen.getByRole("button", { name: "Options de la colonne Ville" }));
    expect(screen.getByRole("menuitem", { name: "Figer au début" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("menuitem", { name: "Figer à la fin" }));
    expect(headerIds()).toEqual(["select", "numero", "client", "montant", "ville", "actions"]);
    expect(head("ville")).toHaveAttribute("data-pin", "end");
    // Juste avant les actions (72 px en largeur théorique).
    expect(offset(head("ville"))).toBe("72px");
    expect(onColumnPinningChange).toHaveBeenLastCalledWith({ left: [], right: ["ville"] });

    await user.click(screen.getByRole("button", { name: "Options de la colonne Ville" }));
    await user.click(screen.getByRole("menuitem", { name: "Libérer" }));
    expect(headerIds()).toEqual(["select", "numero", "client", "ville", "montant", "actions"]);
    expect(head("ville")).not.toHaveAttribute("data-pin");
    expect(onColumnPinningChange).toHaveBeenLastCalledWith({ left: [], right: [] });
  });

  it("état contrôlé `columnPinning` et `enableColumnPinning={false}`", () => {
    const pinning: ColumnPinningState = { left: ["client"], right: [] };
    const { rerender } = render(
      <DataTable columns={columns()} data={FACTURES} getRowId={getRowId} toolbar={false} state={{ columnPinning: pinning }} />,
    );
    expect(headerIds()[0]).toBe("client");
    expect(head("client")).toHaveAttribute("data-pin", "start");

    rerender(<DataTable columns={columns(true)} data={FACTURES} getRowId={getRowId} toolbar={false} enableColumnPinning={false} />);
    // Plus d'entrées « Figer » ni de `meta.pin` ; les actions restent figées.
    expect(head("numero")).not.toHaveAttribute("data-pin");
    expect(head("actions")).toHaveAttribute("data-pin", "end");
  });

  it("mémorise les colonnes figées avec persistKey", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <DataTable columns={columns()} data={FACTURES} getRowId={getRowId} toolbar={false} persistKey="figees" />,
    );
    await user.click(screen.getByRole("button", { name: "Options de la colonne Client" }));
    await user.click(screen.getByRole("menuitem", { name: "Figer au début" }));
    unmount();
    expect(JSON.parse(window.localStorage.getItem("acme-ui:data-table:figees") ?? "{}")).toMatchObject({
      columnPinning: { left: ["client"], right: [] },
    });
    render(<DataTable columns={columns()} data={FACTURES} getRowId={getRowId} toolbar={false} persistKey="figees" />);
    expect(head("client")).toHaveAttribute("data-pin", "start");
  });

  it("la Table signale le défilement horizontal sur lequel s'appuient les colonnes figées", () => {
    const { container } = render(<DataTable columns={columns(true)} data={FACTURES} getRowId={getRowId} toolbar={false} />);
    const box = container.querySelector<HTMLDivElement>(".ui-table-container")!;
    Object.defineProperty(box, "scrollWidth", { configurable: true, value: 1400 });
    Object.defineProperty(box, "clientWidth", { configurable: true, value: 600 });
    box.scrollLeft = 200;
    fireEvent.scroll(box);
    expect(box).toHaveAttribute("data-overflow-start");
    expect(box).toHaveAttribute("data-overflow-end");
  });

  it("sans violation d'accessibilité, colonnes figées au début et à la fin", async () => {
    const { container } = render(
      <DataTable
        aria-label="Factures"
        columns={columns(true)}
        data={FACTURES}
        getRowId={getRowId}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        initialState={{ columnPinning: { left: ["numero"], right: ["montant"] } }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
