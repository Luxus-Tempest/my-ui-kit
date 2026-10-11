import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./NavigationMenu";

function Demo({ viewport }: { viewport?: boolean }) {
  return (
    <NavigationMenu viewport={viewport}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid columns={2}>
              <NavigationMenuLink href="#drive" icon={<svg />} description="Stockez et partagez vos fichiers">
                Drive
              </NavigationMenuLink>
              <NavigationMenuLink href="#docs" description="Rédigez à plusieurs">
                Docs
              </NavigationMenuLink>
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Ressources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid columns={1}>
              <NavigationMenuLink href="#guide">Guide de démarrage</NavigationMenuLink>
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#tarifs" active className={navigationMenuTriggerStyle()}>
            Tarifs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("repère de navigation nommé en français, lien actif annoncé", () => {
    render(<Demo />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(nav).toHaveClass("ui-navigation-menu");
    const active = screen.getByRole("link", { name: "Tarifs" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveAttribute("data-active");
    expect(active).toHaveClass("ui-navigation-menu__trigger", "ui-navigation-menu__link");
    expect(navigationMenuTriggerStyle()).toBe("ui-navigation-menu__trigger");
  });

  it("s'ouvre au clic : panneau dans le viewport, liens riches dans une grille", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    const trigger = screen.getByRole("button", { name: "Produits" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const viewport = container.querySelector(".ui-navigation-menu__viewport");
    expect(viewport).toHaveClass("ui-popup");
    const drive = screen.getByRole("link", { name: /Drive/ });
    expect(viewport).toContainElement(drive);
    expect(drive).toHaveAttribute("data-rich");
    expect(drive).toHaveTextContent("Stockez et partagez vos fichiers");
    expect(drive.closest("li")?.parentElement).toHaveClass("ui-navigation-menu__grid");
  });

  it("clavier : Entrée ouvre, flèche bas entre dans le panneau, Échap referme et rend le focus", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    const trigger = screen.getByRole("button", { name: "Produits" });
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: /Drive/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(trigger).toHaveFocus();
  });

  it("clavier : les flèches passent d'une entrée de la barre à l'autre", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Ressources" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: "Tarifs" })).toHaveFocus();
  });

  it("sans viewport : le panneau prend lui-même le matériau", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo viewport={false} />);
    expect(container.querySelector(".ui-navigation-menu__viewport")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Ressources" }));
    const link = screen.getByRole("link", { name: "Guide de démarrage" });
    expect(link.closest(".ui-navigation-menu__content")).toHaveClass("ui-popup");
  });

  it("asChild : le lien riche se pose dans l'enfant", async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Produits</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink asChild description="Rédigez à plusieurs">
                <a href="#docs" data-router="">Docs</a>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Produits" }));
    const link = screen.getByRole("link", { name: /Docs/ });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveClass("ui-navigation-menu__link");
    expect(link).toHaveTextContent("DocsRédigez à plusieurs");
  });

  it("sans violation d'accessibilité, fermé et ouvert", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Produits" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
