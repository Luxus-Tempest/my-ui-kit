import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Pagination, getPaginationRange } from "./Pagination";

describe("getPaginationRange", () => {
  it("affiche toutes les pages quand elles tiennent", () => {
    expect(getPaginationRange(1, 1)).toEqual([1]);
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("ellipse de fin seulement, près du début", () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10]);
    expect(getPaginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10]);
  });

  it("deux ellipses au milieu", () => {
    expect(getPaginationRange(5, 10)).toEqual([1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 10]);
    expect(getPaginationRange(6, 12, 2, 1)).toEqual([1, "start-ellipsis", 4, 5, 6, 7, 8, "end-ellipsis", 12]);
  });

  it("ellipse de début seulement, près de la fin", () => {
    expect(getPaginationRange(10, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10]);
    expect(getPaginationRange(7, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10]);
  });

  it("une ellipse ne remplace jamais une seule page", () => {
    // Entre 1 et 3, seule la page 2 manquerait : elle est affichée.
    expect(getPaginationRange(4, 9)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 9]);
  });

  it("bornes plus larges et cas limites", () => {
    expect(getPaginationRange(10, 20, 1, 2)).toEqual([1, 2, "start-ellipsis", 9, 10, 11, "end-ellipsis", 19, 20]);
    expect(getPaginationRange(0, 0)).toEqual([]);
    expect(getPaginationRange(99, 10)).toEqual([1, "start-ellipsis", 6, 7, 8, 9, 10]);
  });

  it("nombre d'entrées constant d'une page à l'autre", () => {
    const lengths = Array.from({ length: 30 }, (_, i) => getPaginationRange(i + 1, 30).length);
    expect(new Set(lengths)).toEqual(new Set([7]));
  });
});

function Controlled(props: { initial?: number; pageCount?: number; variant?: "pages" | "compact"; onChange?: (p: number) => void }) {
  const [page, setPage] = React.useState(props.initial ?? 1);
  return (
    <Pagination
      page={page}
      pageCount={props.pageCount ?? 12}
      variant={props.variant}
      onPageChange={(p) => {
        setPage(p);
        props.onChange?.(p);
      }}
    />
  );
}

describe("Pagination", () => {
  it("repère nommé, page courante annoncée, ellipses masquées", () => {
    render(<Controlled initial={5} />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("button", { name: "Page 4" })).not.toHaveAttribute("aria-current");
    expect(nav.querySelectorAll('[aria-hidden="true"].ui-pagination__ellipsis')).toHaveLength(2);
  });

  it("première page : « Page précédente » est désactivée mais reste focusable", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const prev = screen.getByRole("button", { name: "Page précédente" });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    await userEvent.setup().click(prev);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clavier : Tab puis Entrée / Espace changent de page ; le focus reste sur la flèche", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial={11} onChange={onChange} />);
    const next = screen.getByRole("button", { name: "Page suivante" });
    next.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(12);
    expect(screen.getByRole("button", { name: "Page 12" })).toHaveAttribute("aria-current", "page");
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute("aria-disabled", "true");

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Page 12" })).toHaveFocus();
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Page 10" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("non contrôlé : defaultPage et clic sur une pastille", async () => {
    const onPageChange = vi.fn();
    render(<Pagination defaultPage={2} pageCount={5} onPageChange={onPageChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });

  it("variante compacte et libellés surchargés", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        variant="compact"
        page={3}
        pageCount={12}
        onPageChange={onPageChange}
        labels={{ nav: "Résultats", previous: "Précédent", next: "Suivant", status: (p, n) => `${p} / ${n}` }}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Résultats" });
    expect(nav).toHaveClass("ui-pagination--compact");
    expect(nav).toHaveTextContent("3 / 12");
    await userEvent.setup().click(screen.getByRole("button", { name: "Précédent" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("libellé de page par défaut « Page 3 sur 12 » en compact", () => {
    render(<Pagination variant="compact" page={3} pageCount={12} />);
    expect(screen.getByText("Page 3 sur 12")).toBeInTheDocument();
  });

  it("désactivée : aucun changement", async () => {
    const onPageChange = vi.fn();
    render(<Pagination disabled page={2} pageCount={5} onPageChange={onPageChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("sans violation d'accessibilité (deux variantes)", async () => {
    const { container } = render(
      <>
        <Pagination page={5} pageCount={10} />
        <Pagination variant="compact" page={3} pageCount={12} labels={{ nav: "Pagination compacte" }} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
