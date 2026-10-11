import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button/Button";
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "./Menu";

describe("Menu", () => {
  it("s'ouvre, déclenche une action et se referme", async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    const onArchive = vi.fn();
    render(
      <Menu>
        <MenuTrigger asChild><Button variant="outline">Actions</Button></MenuTrigger>
        <MenuContent>
          <MenuLabel>Facture</MenuLabel>
          <MenuItem onSelect={onDuplicate} shortcut="⌘D">Dupliquer</MenuItem>
          <MenuItem disabled>Exporter</MenuItem>
          <MenuCheckboxItem checked onCheckedChange={onArchive}>Archivée</MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem variant="danger">Supprimer</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Exporter" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Archivée" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitem", { name: "Supprimer" })).toHaveAttribute("data-variant", "danger");

    await user.click(screen.getByRole("menuitem", { name: /Dupliquer/ }));
    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
