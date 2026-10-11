import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { MenuItem } from "../menu/Menu";
import { actionsColumn } from "./columns";
import { createColumnHelper, DataTable, type ColumnDef } from "./DataTable";

// jsdom n'a pas PointerEvent : une version minimale suffit pour le glissement de la poignée.
class PointerEventStub extends MouseEvent {
  pointerId: number;
  isPrimary: boolean;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.isPrimary = init.isPrimary ?? true;
    this.pointerType = init.pointerType ?? "mouse";
  }
}
beforeAll(() => {
  if (!window.PointerEvent) (window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventStub;
});

interface Client {
  id: string;
  nom: string;
  ville: string;
  ca: number;
}

const CLIENTS: Client[] = Array.from({ length: 4 }, (_, i) => ({
  id: `c${i}`,
  nom: `Client ${i + 1}`,
  ville: ["Rabat", "Fès", "Tanger", "Oujda"][i],
  ca: (i + 1) * 1000,
}));

const col = createColumnHelper<Client>();
const COLUMNS: ColumnDef<Client, any>[] = [
  col.accessor("nom", { header: "Nom", meta: { width: 200, minWidth: 120, maxWidth: 400 } }),
  col.accessor("ville", { header: "Ville" }),
  col.accessor("ca", { header: "Chiffre d'affaires", meta: { numeric: true, width: 160 } }),
  actionsColumn<Client>(() => <MenuItem>Ouvrir</MenuItem>),
];

const handle = (name: string) => screen.getByRole("separator", { name: `Redimensionner la colonne ${name}` });
const colWidths = () =>
  Array.from(screen.getByRole("table").querySelectorAll("colgroup col")).map((c) => (c as HTMLElement).style.width);

function renderTable(props: Partial<React.ComponentProps<typeof DataTable<Client>>> = {}) {
  return render(
    <DataTable
      aria-label="Clients"
      columns={COLUMNS}
      data={CLIENTS}
      getRowId={(c) => c.id}
      enableColumnResizing
      enableRowSelection
      toolbar={false}
      {...props}
    />,
  );
}

afterEach(() => window.localStorage.clear());

describe("DataTable — colonnes redimensionnables", () => {
  it("mise en page fixe : `<colgroup>` aux largeurs de départ, une poignée par colonne de données", () => {
    renderTable();
    const tableElement = screen.getByRole("table");
    expect(tableElement.closest(".ui-data-table__view")).toHaveAttribute("data-resizable", "true");
    // Sélection 56, nom 200 (meta.width), ville 150 (défaut), CA 160, actions 72.
    expect(colWidths()).toEqual(["56px", "200px", "150px", "160px", "72px"]);
    expect(tableElement.style.width).toBe("638px");
    expect(screen.getAllByRole("separator")).toHaveLength(3);
    const nom = handle("Nom");
    expect(nom).toHaveAttribute("aria-orientation", "vertical");
    expect(nom).toHaveAttribute("aria-valuenow", "200");
    expect(nom).toHaveAttribute("aria-valuemin", "120");
    expect(nom).toHaveAttribute("aria-valuemax", "400");
    expect(nom).toHaveAttribute("aria-valuetext", "200 pixels");
    expect(nom).toHaveAttribute("tabindex", "0");
    // Défauts sans meta.minWidth / maxWidth.
    expect(handle("Ville")).toHaveAttribute("aria-valuemin", "48");
    expect(handle("Ville")).toHaveAttribute("aria-valuemax", "960");
  });

  it("clavier : flèches ± 16, Maj+flèche ± 64, Origine / Fin aux bornes", async () => {
    const user = userEvent.setup();
    const onColumnSizingChange = vi.fn();
    renderTable({ onColumnSizingChange });
    const nom = handle("Nom");
    // Dans l'ordre de tabulation, juste après l'intitulé et le menu de la colonne.
    screen.getByRole("button", { name: "Options de la colonne Nom" }).focus();
    await user.tab();
    expect(nom).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(nom).toHaveAttribute("aria-valuenow", "216");
    expect(colWidths()[1]).toBe("216px");
    expect(onColumnSizingChange).toHaveBeenLastCalledWith({ nom: 216 });

    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(nom).toHaveAttribute("aria-valuenow", "280");
    await user.keyboard("{ArrowLeft}");
    expect(nom).toHaveAttribute("aria-valuenow", "264");
    await user.keyboard("{Home}");
    expect(nom).toHaveAttribute("aria-valuenow", "120");
    await user.keyboard("{ArrowLeft}");
    expect(nom).toHaveAttribute("aria-valuenow", "120");
    await user.keyboard("{End}");
    expect(nom).toHaveAttribute("aria-valuenow", "400");
    expect(screen.getByRole("table").style.width).toBe("838px");
  });

  it("de droite à gauche, la flèche gauche élargit la colonne", async () => {
    const user = userEvent.setup();
    renderTable();
    const ville = handle("Ville");
    ville.style.direction = "rtl";
    ville.focus();
    await user.keyboard("{ArrowLeft}");
    expect(ville).toHaveAttribute("aria-valuenow", "166");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(ville).toHaveAttribute("aria-valuenow", "134");
  });

  it("double-clic : retour à la largeur par défaut", async () => {
    const user = userEvent.setup();
    renderTable({ initialState: { columnSizing: { nom: 320 } } });
    const nom = handle("Nom");
    expect(nom).toHaveAttribute("aria-valuenow", "320");
    await user.dblClick(nom);
    expect(nom).toHaveAttribute("aria-valuenow", "200");
    expect(colWidths()[1]).toBe("200px");
  });

  it("glisser à la souris ou au doigt, dans les bornes, sans trier la colonne", () => {
    renderTable();
    const ca = handle("Chiffre d'affaires");
    fireEvent.pointerDown(ca, { clientX: 500, pointerId: 3, button: 0, isPrimary: true });
    expect(ca).toHaveAttribute("data-resizing", "true");
    fireEvent.pointerMove(ca, { clientX: 540, pointerId: 3 });
    fireEvent.pointerUp(ca, { clientX: 560, pointerId: 3 });
    expect(ca).not.toHaveAttribute("data-resizing");
    expect(ca).toHaveAttribute("aria-valuenow", "220");
    // Rien ne trie : la poignée garde le clic pour elle.
    expect(within(screen.getByRole("table")).getByRole("columnheader", { name: /^Chiffre/ })).toHaveAttribute("aria-sort", "none");

    fireEvent.pointerDown(ca, { clientX: 500, pointerId: 4, button: 0, isPrimary: true });
    fireEvent.pointerUp(ca, { clientX: 0, pointerId: 4 });
    expect(ca).toHaveAttribute("aria-valuenow", "48");
  });

  it("les colonnes utilitaires n'ont pas de poignée ; largeurs mémorisées avec persistKey", async () => {
    const user = userEvent.setup();
    const { unmount } = renderTable({ persistKey: "largeurs" });
    expect(screen.queryByRole("separator", { name: /Actions/ })).not.toBeInTheDocument();
    handle("Ville").focus();
    await user.keyboard("{ArrowRight}");
    unmount();
    expect(JSON.parse(window.localStorage.getItem("acme-ui:data-table:largeurs") ?? "{}")).toMatchObject({
      columnSizing: { ville: 166 },
    });
    renderTable({ persistKey: "largeurs" });
    expect(handle("Ville")).toHaveAttribute("aria-valuenow", "166");
  });

  it("sans `enableColumnResizing`, ni poignée ni mise en page fixe", () => {
    renderTable({ enableColumnResizing: false });
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByRole("table").querySelector("colgroup")).toBeNull();
    expect(screen.getByRole("table").closest(".ui-data-table__view")).not.toHaveAttribute("data-resizable");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = renderTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});
