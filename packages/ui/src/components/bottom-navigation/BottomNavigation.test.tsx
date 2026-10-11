import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { BottomNavigation, BottomNavigationItem, type BottomNavigationProps } from "./BottomNavigation";

const Icon = () => <svg aria-hidden="true" />;

function Tabs(props: Omit<BottomNavigationProps, "children">) {
  return (
    <BottomNavigation {...props}>
      <BottomNavigationItem value="accueil" icon={<Icon />} label="Accueil" />
      <BottomNavigationItem value="fichiers" icon={<Icon />} label="Fichiers" />
      <BottomNavigationItem value="partages" icon={<Icon />} label="Partagés" badge={3} />
      <BottomNavigationItem value="activite" icon={<Icon />} label="Activité" badge={120} />
    </BottomNavigation>
  );
}

describe("BottomNavigation", () => {
  it("repère de navigation nommé, liste d'entrées, entrée active annoncée", () => {
    render(<Tabs defaultValue="accueil" />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(nav).toHaveAttribute("data-position", "fixed");
    expect(within(nav).getAllByRole("listitem")).toHaveLength(4);
    const accueil = screen.getByRole("button", { name: "Accueil" });
    expect(accueil).toHaveAttribute("aria-current", "page");
    expect(accueil).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("button", { name: "Fichiers" })).not.toHaveAttribute("aria-current");
  });

  it("badges : compteur lu avec le libellé, plafonné à 99+", () => {
    render(<Tabs />);
    const partages = screen.getByRole("button", { name: /^Partagés\s?, 3 nouveaux$/ });
    expect(partages.querySelector(".ui-bottom-nav__badge")).toHaveTextContent("3");
    const activite = screen.getByRole("button", { name: /^Activité\s?, plus de 99 nouveaux$/ });
    expect(activite.querySelector(".ui-bottom-nav__badge")).toHaveTextContent("99+");
  });

  it("badge point, badge élément et libellé de badge personnalisé", () => {
    render(
      <BottomNavigation>
        <BottomNavigationItem icon={<Icon />} label="Messages" badge />
        <BottomNavigationItem icon={<Icon />} label="Profil" badge={<span>Pro</span>} />
        <BottomNavigationItem icon={<Icon />} label="Alertes" badge={2} badgeLabel="2 alertes" />
        <BottomNavigationItem icon={<Icon />} label="Vide" badge={0} />
      </BottomNavigation>,
    );
    expect(screen.getByRole("button", { name: /^Messages\s?, Nouveau$/ }).querySelector("[data-dot]")).not.toBeNull();
    expect(screen.getByRole("button", { name: /^Profil\s?, Pro$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Alertes\s?, 2 alertes$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vide" }).querySelector(".ui-bottom-nav__badge")).toBeNull();
  });

  it("clavier : Tab parcourt les entrées, Entrée et Espace les activent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs defaultValue="accueil" onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Accueil" })).toHaveFocus();
    await user.tab();
    const fichiers = screen.getByRole("button", { name: "Fichiers" });
    expect(fichiers).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("fichiers");
    expect(fichiers).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Accueil" })).not.toHaveAttribute("aria-current");

    await user.tab();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("partages");
  });

  it("contrôlé : l'entrée active suit la prop value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState("fichiers");
      return (
        <>
          <Tabs value={value} onValueChange={setValue} position="static" />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-position", "static");
    await user.click(screen.getByRole("button", { name: /Activité/ }));
    expect(screen.getByRole("status")).toHaveTextContent("activite");
    expect(screen.getByRole("button", { name: /Activité/ })).toHaveAttribute("aria-current", "page");
  });

  it("asChild : liens de routeur, état actif explicite, libellé tiré de l'enfant", () => {
    render(
      <BottomNavigation label="Onglets">
        <BottomNavigationItem asChild isActive icon={<Icon />}>
          <a href="#accueil">Accueil</a>
        </BottomNavigationItem>
        <BottomNavigationItem asChild icon={<Icon />} label="Recherche">
          <a href="#recherche" />
        </BottomNavigationItem>
        <BottomNavigationItem asChild disabled icon={<Icon />}>
          <a href="#hors-ligne">Hors ligne</a>
        </BottomNavigationItem>
      </BottomNavigation>,
    );
    expect(screen.getByRole("navigation", { name: "Onglets" })).toBeInTheDocument();
    const accueil = screen.getByRole("link", { name: "Accueil" });
    expect(accueil).toHaveClass("ui-bottom-nav__button");
    expect(accueil).toHaveAttribute("aria-current", "page");
    expect(accueil).toHaveAttribute("href", "#accueil");
    expect(screen.getByRole("link", { name: "Recherche" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Hors ligne" })).toHaveAttribute("aria-disabled", "true");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <main>
          <p>Contenu</p>
        </main>
        <Tabs defaultValue="fichiers" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
