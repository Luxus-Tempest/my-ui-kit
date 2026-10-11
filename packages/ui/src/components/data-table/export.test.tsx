import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actionsColumn, dataTableFormatters, selectColumn } from "./columns";
import { createColumnHelper, DataTable, type ColumnDef } from "./DataTable";
import { exportCsv, toCsv } from "./export";
import { useDataTable } from "./useDataTable";

interface Ligne {
  id: string;
  numero: string;
  client: string;
  montant: number;
  emission: Date | null;
  payee: boolean;
  interne: string;
}

const LIGNES: Ligne[] = [
  { id: "a", numero: "F-001", client: "Atlas Négoce", montant: 1250.5, emission: new Date(2026, 9, 9), payee: true, interne: "x" },
  { id: "b", numero: "F-002", client: 'Dupont "Le Grand"; SARL', montant: -12.5, emission: null, payee: false, interne: "y" },
  { id: "c", numero: "F-003", client: "=SOMME(A1)", montant: 300, emission: new Date(2026, 9, 1, 14, 30), payee: true, interne: "z" },
  { id: "d", numero: "F-004", client: "Café Zellige", montant: 80, emission: new Date(2026, 8, 30), payee: false, interne: "w" },
];

const col = createColumnHelper<Ligne>();
const COLUMNS = [
  selectColumn<Ligne>(),
  col.accessor("numero", { header: "Numéro" }),
  col.accessor("client", { header: "Client" }),
  col.accessor("montant", { header: "Montant", meta: { numeric: true, format: dataTableFormatters.currency("MAD") } }),
  col.accessor("emission", { header: "Émission" }),
  col.accessor("payee", { header: "Payée", meta: { exportValue: (row) => (row.payee ? "payée" : "à payer") } }),
  col.accessor("interne", { header: "Interne", meta: { exportable: false } }),
  actionsColumn<Ligne>(() => null),
] as ColumnDef<Ligne, any>[];

const useTable = (options: Partial<Parameters<typeof useDataTable<Ligne>>[0]> = {}) =>
  renderHook(() => useDataTable<Ligne>({ data: LIGNES, columns: COLUMNS, getRowId: (l) => l.id, ...options })).result;

describe("toCsv", () => {
  it("vue filtrée et triée, « ; » et virgule décimale, colonnes utilitaires exclues, champs échappés", () => {
    const result = useTable({ initialState: { sorting: [{ id: "montant", desc: true }], globalFilter: "a" } });
    expect(toCsv(result.current).split("\r\n")).toEqual([
      "Numéro;Client;Montant;Émission;Payée",
      "F-001;Atlas Négoce;1250,5;2026-10-09;payée",
      "F-003;'=SOMME(A1);300;2026-10-01 14:30;payée",
      "F-004;Café Zellige;80;2026-09-30;à payer",
      'F-002;"Dupont ""Le Grand""; SARL";-12,5;;à payer',
    ]);
  });

  it("colonnes masquées exclues ; options de format, de lignes et de colonnes", () => {
    const result = useTable({
      initialState: { columnVisibility: { emission: false }, rowSelection: { b: true, d: true } },
    });
    expect(toCsv(result.current).split("\r\n")[0]).toBe("Numéro;Client;Montant;Payée");

    const selected = toCsv(result.current, {
      rows: "selected",
      columns: ["numero", "montant"],
      delimiter: ",",
      decimalSeparator: ".",
      formatted: true,
      headers: false,
    });
    expect(selected.split("\r\n")).toHaveLength(2);
    expect(selected.split("\r\n")[0]).toMatch(/^F-002,"?-12[.,]50\s?MAD"?$/);
  });

  it("booléens sans exportValue : « Oui » / « Non »", () => {
    const columns = [col.accessor("numero", { header: "Numéro" }), col.accessor("payee", { header: "Payée" })] as ColumnDef<Ligne, any>[];
    const result = renderHook(() => useDataTable<Ligne>({ data: LIGNES.slice(0, 2), columns })).result;
    expect(toCsv(result.current)).toBe("Numéro;Payée\r\nF-001;Oui\r\nF-002;Non");
  });
});

describe("exportCsv", () => {
  it("télécharge un fichier UTF-8 avec BOM, depuis le helper et depuis le bouton « Exporter »", async () => {
    const createObjectURL = vi.fn((_blob: Blob) => "blob:csv");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toMatch(/\.csv$/);
    });

    const result = useTable();
    exportCsv(result.current, "factures");
    expect(click).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0];
    // jsdom n'a pas Blob.text() : lecture en octets pour voir le BOM.
    const bytes = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob);
    });
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes.slice(3));
    expect(text.split("\r\n")[0]).toBe("Numéro;Client;Montant;Émission;Payée");

    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={LIGNES} enableExport exportFilename="releve" />);
    await user.click(screen.getByRole("button", { name: "Exporter" }));
    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });
});
