import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { List, ListItem, ListItemIcon, ListSection } from "./List";

describe("List", () => {
  it("une section nomme sa liste ; les lignes portent leurs parties", () => {
    render(
      <ListSection title="Synchronisation" footer="Les fichiers restent sur cet appareil.">
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c1)" />} description="Toutes les heures" trailing="Activée" chevron>
            Sauvegarde
          </ListItem>
        </List>
      </ListSection>,
    );
    const region = screen.getByRole("region", { name: "Synchronisation" });
    const item = within(region).getByRole("listitem");
    expect(item).toHaveTextContent("Sauvegarde");
    expect(item).toHaveTextContent("Toutes les heures");
    expect(item).toHaveTextContent("Activée");
    expect(item.querySelector(".ui-list-item__chevron")).not.toBeNull();
    expect(region).toHaveTextContent("Les fichiers restent sur cet appareil.");
  });

  it("asChild : l'enfant devient la ligne et garde son libellé", async () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem asChild selected chevron>
          <button type="button" onClick={onClick}>Compte</button>
        </ListItem>
      </List>,
    );
    const button = screen.getByRole("button", { name: "Compte" });
    expect(button).toHaveClass("ui-list-item__row");
    expect(button).toHaveAttribute("data-interactive", "true");
    expect(button).toHaveAttribute("aria-current", "true");
    expect(button.closest("li")).not.toBeNull();
    await userEvent.setup().click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <ListSection title="Partage">
        <List>
          <ListItem>Accès des collaborateurs</ListItem>
          <ListItem asChild chevron>
            <a href="#dossiers">Dossiers partagés</a>
          </ListItem>
        </List>
      </ListSection>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
