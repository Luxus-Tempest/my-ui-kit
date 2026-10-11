import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, type TableSortDirection } from "./Table";

const ROWS = [
  { name: "Budget 2027.xlsx", size: 284 },
  { name: "Contrat cadre.pdf", size: 1200 },
];

function Sortable() {
  const [sort, setSort] = React.useState<TableSortDirection>("asc");
  const rows = [...ROWS].sort((a, b) => (sort === "asc" ? a.size - b.size : b.size - a.size));
  return (
    <Table>
      <TableCaption>Fichiers récents</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead numeric sort={sort} onSort={() => setSort(sort === "asc" ? "desc" : "asc")}>Taille</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name} selected={r.size === 284}>
            <TableCell>{r.name}</TableCell>
            <TableCell numeric>{r.size}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("variante, densité et en-tête collant sur le conteneur", () => {
    const { container } = render(
      <Table variant="card" density="compact" stickyHeader>
        <TableBody><TableRow><TableCell>A</TableCell></TableRow></TableBody>
      </Table>,
    );
    const box = container.querySelector(".ui-table-container")!;
    expect(box).toHaveAttribute("data-variant", "card");
    expect(box).toHaveAttribute("data-density", "compact");
    expect(box).toHaveAttribute("data-sticky", "true");
  });

  it("signale le contenu caché de chaque côté au défilement horizontal, et transmet containerRef", () => {
    const containerRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Table containerRef={containerRef}>
        <TableBody><TableRow><TableCell>A</TableCell></TableRow></TableBody>
      </Table>,
    );
    const box = container.querySelector<HTMLDivElement>(".ui-table-container")!;
    expect(containerRef.current).toBe(box);
    // Tout tient : aucun signal.
    expect(box).not.toHaveAttribute("data-overflow-start");
    expect(box).not.toHaveAttribute("data-overflow-end");

    Object.defineProperty(box, "scrollWidth", { configurable: true, value: 900 });
    Object.defineProperty(box, "clientWidth", { configurable: true, value: 300 });
    const scrollTo = (x: number) => {
      box.scrollLeft = x;
      fireEvent.scroll(box);
    };
    scrollTo(0);
    expect(box).not.toHaveAttribute("data-overflow-start");
    expect(box).toHaveAttribute("data-overflow-end");
    scrollTo(300);
    expect(box).toHaveAttribute("data-overflow-start");
    expect(box).toHaveAttribute("data-overflow-end");
    scrollTo(600);
    expect(box).toHaveAttribute("data-overflow-start");
    expect(box).not.toHaveAttribute("data-overflow-end");
    // RTL : scrollLeft négatif, même lecture depuis le bord de départ.
    scrollTo(-600);
    expect(box).toHaveAttribute("data-overflow-start");
    expect(box).not.toHaveAttribute("data-overflow-end");
  });

  it("colonne triable : bouton, aria-sort et inversion au clic", async () => {
    render(<Sortable />);
    const header = screen.getByRole("columnheader", { name: "Taille" });
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Budget 2027.xlsx");
    await userEvent.setup().click(screen.getByRole("button", { name: "Taille" }));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Contrat cadre.pdf");
  });

  it("colonne non triable : pas d'aria-sort ; ligne retenue marquée", () => {
    render(<Sortable />);
    expect(screen.getByRole("columnheader", { name: "Nom" })).not.toHaveAttribute("aria-sort");
    expect(screen.getByRole("row", { name: /Budget/ })).toHaveAttribute("data-state", "selected");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Sortable />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
