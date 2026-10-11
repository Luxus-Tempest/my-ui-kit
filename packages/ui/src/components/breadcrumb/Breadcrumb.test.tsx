import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

function Chemin(props: { size?: "default" | "lg"; label?: string }) {
  return (
    <Breadcrumb size={props.size} label={props.label}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#drive">Mon Drive</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#projets">Projets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>2026</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("repère de navigation nommé, liste ordonnée, élément courant annoncé", () => {
    render(<Chemin />);
    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    expect(nav).toHaveClass("ui-breadcrumb--size-default");
    expect(within(nav).getByRole("list").tagName).toBe("OL");
    // Les séparateurs sont masqués : seuls les quatre niveaux sont des éléments de liste.
    expect(within(nav).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("2026")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Plus de niveaux")).toHaveClass("ui-sr-only");
  });

  it("libellé et taille surchargeables", () => {
    render(<Chemin size="lg" label="Emplacement" />);
    expect(screen.getByRole("navigation", { name: "Emplacement" })).toHaveClass("ui-breadcrumb--size-lg");
  });

  it("clavier : Tab parcourt les liens parents, pas l'élément courant", async () => {
    const user = userEvent.setup();
    render(<Chemin />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Mon Drive" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Projets" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("asChild : un lien de routeur reçoit le style du niveau", async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/partages" onClick={onClick}>Partagés avec moi</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const link = screen.getByRole("link", { name: "Partagés avec moi" });
    expect(link).toHaveClass("ui-breadcrumb__link");
    link.focus();
    await userEvent.setup().keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Chemin />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
