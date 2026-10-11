import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button/Button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "./Popover";
import { Tooltip } from "../tooltip/Tooltip";

describe("Popover & Tooltip", () => {
  it("le popover s'ouvre au clic et se ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild><Button variant="outline">Filtres</Button></PopoverTrigger>
        <PopoverContent aria-label="Filtres">
          <PopoverTitle>Filtrer les factures</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filtres" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Filtrer les factures")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Filtrer les factures")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("l'infobulle apparaît au focus clavier et décrit le bouton", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Dupliquer la facture" shortcut="⌘D" delayDuration={0}>
        <Button size="icon" aria-label="Dupliquer"><svg /></Button>
      </Tooltip>,
    );
    await user.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Dupliquer la facture");
    expect(screen.getByRole("button", { name: "Dupliquer" })).toHaveAccessibleDescription(/Dupliquer la facture/);
  });
});
