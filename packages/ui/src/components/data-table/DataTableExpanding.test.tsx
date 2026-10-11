import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { onTestFinished } from "vitest";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { createColumnHelper, DataTable, type ColumnDef, type ExpandedState } from "./DataTable";

/* ── Panneau de détail ─────────────────────────────────────────────── */

interface Facture {
  id: string;
  numero: string;
  client: string;
  montant: number;
}

const FACTURES: Facture[] = Array.from({ length: 12 }, (_, i) => ({
  id: `f${i + 1}`,
  numero: `F-2026-0${String(i + 1).padStart(2, "0")}`,
  client: ["Atlas Négoce", "Café Zellige", "Électro Sud"][i % 3],
  montant: 1000 + i * 100,
}));

const col = createColumnHelper<Facture>();
const COLUMNS: ColumnDef<Facture, any>[] = [
  col.accessor("numero", { header: "Numéro" }),
  col.accessor("client", { header: "Client" }),
  col.accessor("montant", { header: "Montant", meta: { numeric: true } }),
];

const table = () => screen.getByRole("table");
const bodyRows = () => Array.from(table().querySelectorAll<HTMLTableRowElement>("tbody > tr"));
const detail = (row: { original: Facture }) => <p>Lignes de {row.original.numero}</p>;

describe("DataTable — panneau de détail", () => {
  it("chevron : aria-expanded, libellé, aria-controls vers une ligne pleine largeur", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        data={FACTURES}
        getRowId={(f) => f.id}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        renderSubComponent={detail}
        toolbar={false}
      />,
    );
    // Colonne de dépliage ajoutée juste après la case de sélection.
    const ids = within(table()).getAllByRole("columnheader").map((th) => th.getAttribute("data-column-id"));
    expect(ids).toEqual(["select", "expand", "numero", "client", "montant"]);
    const expandHead = table().querySelector('th[data-column-id="expand"]')!;
    expect(expandHead).toHaveAttribute("data-pin", "start");
    expect(within(expandHead as HTMLElement).getByRole("button", { name: "Tout déplier" })).toHaveAttribute("aria-expanded", "false");

    const button = screen.getByRole("button", { name: "Afficher le détail de F-2026-001" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-controls");
    expect(bodyRows()).toHaveLength(10);

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Masquer le détail de F-2026-001");
    const detailRow = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(detailRow.tagName).toBe("TR");
    expect(detailRow).toHaveTextContent("Lignes de F-2026-001");
    expect(within(detailRow).getByRole("cell")).toHaveAttribute("colspan", "5");
    // La ligne de détail suit sa ligne, sans compter dans la pagination ni dans la navigation.
    expect(bodyRows()[1]).toBe(detailRow);
    expect(bodyRows()).toHaveLength(11);
    expect(detailRow).not.toHaveAttribute("data-row-index");
    expect(bodyRows()[0]).toHaveAttribute("data-expanded", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Lignes de F-2026-001")).not.toBeInTheDocument();
  });

  it("`getRowCanExpand` restreint les lignes dépliables ; « Tout déplier » ouvre les autres", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        data={FACTURES}
        getRowId={(f) => f.id}
        getRowLabel={(f) => f.numero}
        getRowCanExpand={(row) => row.index % 2 === 0}
        renderSubComponent={detail}
        toolbar={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Afficher le détail de F-2026-002" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tout déplier" }));
    expect(screen.getByRole("button", { name: "Tout replier" })).toHaveAttribute("aria-expanded", "true");
    // Page de 10 lignes : 5 dépliables, 5 panneaux.
    expect(screen.getAllByText(/^Lignes de/)).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Tout replier" }));
    expect(screen.queryByText(/^Lignes de/)).not.toBeInTheDocument();
  });

  it("clavier sur une ligne cliquable : flèche droite déplie, flèche gauche replie (inversé en RTL)", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={COLUMNS}
        data={FACTURES}
        getRowId={(f) => f.id}
        renderSubComponent={detail}
        onRowClick={() => undefined}
        toolbar={false}
      />,
    );
    const first = bodyRows()[0];
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Lignes de F-2026-001")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByText("Lignes de F-2026-001")).not.toBeInTheDocument();

    first.style.direction = "rtl";
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Lignes de F-2026-001")).toBeInTheDocument();
    // La flèche bas saute la ligne de détail.
    await user.keyboard("{ArrowDown}");
    expect(bodyRows()[2]).toHaveFocus();
  });

  it("état `expanded` contrôlé et rappel avec la nouvelle valeur", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    function Controlee() {
      const [expanded, setExpanded] = React.useState<ExpandedState>({ f2: true });
      return (
        <DataTable
          columns={COLUMNS}
          data={FACTURES}
          getRowId={(f) => f.id}
          getRowLabel={(f) => f.numero}
          renderSubComponent={detail}
          toolbar={false}
          state={{ expanded }}
          onExpandedChange={(next) => {
            onExpandedChange(next);
            setExpanded(next);
          }}
        />
      );
    }
    render(<Controlee />);
    expect(screen.getByText("Lignes de F-2026-002")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Afficher le détail de F-2026-003" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith({ f2: true, f3: true });
  });

  it("virtualisé : le panneau suit sa ligne et compte dans aria-rowcount", () => {
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400);
    const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(800);
    onTestFinished(() => {
      height.mockRestore();
      width.mockRestore();
    });
    const many = Array.from({ length: 2000 }, (_, i) => ({ id: `m${i}`, numero: `M-${i + 1}`, client: "Atlas", montant: i }));
    render(
      <DataTable
        columns={COLUMNS}
        data={many}
        getRowId={(f) => f.id}
        getRowLabel={(f) => f.numero}
        renderSubComponent={detail}
        initialState={{ expanded: { m0: true } }}
        virtualized
        height={400}
        toolbar={false}
      />,
    );
    // 2 000 lignes + 1 panneau + 1 ligne d'en-tête.
    expect(table()).toHaveAttribute("aria-rowcount", "2002");
    const panel = screen.getByText("Lignes de M-1").closest("tr")!;
    expect(panel).toHaveAttribute("aria-rowindex", "3");
    expect(panel.previousElementSibling).toHaveAttribute("aria-rowindex", "2");
    expect(panel.nextElementSibling).toHaveAttribute("aria-rowindex", "4");
    expect(table().querySelectorAll("tbody [data-row-index]").length).toBeLessThan(60);
  });

  it("sans violation d'accessibilité, panneau ouvert", async () => {
    const { container } = render(
      <DataTable
        aria-label="Factures"
        columns={COLUMNS}
        data={FACTURES}
        getRowId={(f) => f.id}
        getRowLabel={(f) => f.numero}
        enableRowSelection
        renderSubComponent={detail}
        initialState={{ expanded: { f1: true } }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

/* ── Données hiérarchiques ─────────────────────────────────────────── */

interface Compte {
  code: string;
  intitule: string;
  solde: number;
  sousComptes?: Compte[];
}

const BALANCE: Compte[] = [
  {
    code: "6",
    intitule: "Charges",
    solde: 900,
    sousComptes: [
      { code: "61", intitule: "Exploitation", solde: 700, sousComptes: [{ code: "611", intitule: "Achats", solde: 700 }] },
      { code: "63", intitule: "Financières", solde: 200 },
    ],
  },
  { code: "7", intitule: "Produits", solde: 1500, sousComptes: [{ code: "71", intitule: "Ventes", solde: 1500 }] },
  { code: "8", intitule: "Résultats", solde: 50 },
];

const cpt = createColumnHelper<Compte>();
const COMPTES: ColumnDef<Compte, any>[] = [
  cpt.accessor("code", { header: "Compte" }),
  cpt.accessor("intitule", { header: "Intitulé" }),
  cpt.accessor("solde", { header: "Solde", meta: { numeric: true } }),
];

const codes = () => bodyRows().map((tr) => tr.querySelector('[data-column-id="code"]')?.textContent);

describe("DataTable — données hiérarchiques", () => {
  const renderBalance = (props: Partial<React.ComponentProps<typeof DataTable<Compte>>> = {}) =>
    render(
      <DataTable
        aria-label="Balance"
        columns={COMPTES}
        data={BALANCE}
        getRowId={(c) => c.code}
        getRowLabel={(c) => c.intitule}
        getSubRows={(c) => c.sousComptes}
        toolbar={false}
        {...props}
      />,
    );

  it("lignes enfants sous leur parent, en retrait dans la première colonne de données", async () => {
    const user = userEvent.setup();
    renderBalance();
    expect(codes()).toEqual(["6", "7", "8"]);
    // Pas de chevron pour une ligne sans enfants.
    expect(screen.queryByRole("button", { name: "Afficher le détail de Résultats" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Afficher le détail de Charges" }));
    expect(codes()).toEqual(["6", "61", "63", "7", "8"]);
    const child = bodyRows()[1];
    expect(child).toHaveAttribute("data-depth", "1");
    const cell = child.querySelector<HTMLElement>('[data-column-id="code"]')!;
    expect(cell).toHaveAttribute("data-indent", "true");
    expect(cell.style.getPropertyValue("--_depth")).toBe("1");
    // Le parent n'est pas en retrait ; la colonne du chevron non plus.
    expect(bodyRows()[0].querySelector('[data-column-id="code"]')).not.toHaveAttribute("data-indent");

    await user.click(screen.getByRole("button", { name: "Afficher le détail de Exploitation" }));
    expect(codes()).toEqual(["6", "61", "611", "63", "7", "8"]);
    expect(bodyRows()[2].querySelector<HTMLElement>('[data-column-id="code"]')!.style.getPropertyValue("--_depth")).toBe("2");
  });

  it("tri dans chaque niveau ; les enfants restent sur la page de leur parent", async () => {
    const user = userEvent.setup();
    renderBalance({ initialState: { expanded: true, pagination: { pageIndex: 0, pageSize: 2 } } });
    // Deux parents par page, avec tous leurs enfants.
    expect(codes()).toEqual(["6", "61", "611", "63", "7", "71"]);
    expect(screen.getByText("1–2 sur 3")).toBeInTheDocument();

    await user.click(within(table()).getByRole("button", { name: "Solde" }));
    await user.click(screen.getByRole("button", { name: "Page 1" }));
    expect(codes()).toEqual(["8", "6", "63", "61", "611"]);
  });

  it("la recherche garde les parents des lignes trouvées", async () => {
    const user = userEvent.setup();
    renderBalance({ toolbar: true, initialState: { expanded: true } });
    await user.click(screen.getByRole("searchbox"));
    await user.paste("achats");
    expect(codes()).toEqual(["6", "61", "611"]);
  });

  it("sans violation d'accessibilité, arborescence dépliée", async () => {
    const { container } = renderBalance({ initialState: { expanded: true } });
    expect(await axe(container)).toHaveNoViolations();
  });
});
