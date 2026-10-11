import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./Sheet";

function Demo({ side }: { side?: "right" | "bottom" }) {
  return (
    <Sheet>
      <SheetTrigger>Détails</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Budget 2027.xlsx</SheetTitle>
          <SheetDescription>Modifié par vous</SheetDescription>
        </SheetHeader>
        <SheetBody>Propriétaire : moi</SheetBody>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("s'ouvre en modale nommée et se ferme par la croix", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Détails" }));
    const dialog = screen.getByRole("dialog", { name: "Budget 2027.xlsx" });
    expect(dialog).toHaveAttribute("data-side", "right");
    expect(dialog.querySelector(".ui-sheet__handle")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("la feuille du bas affiche sa poignée", async () => {
    const user = userEvent.setup();
    render(<Demo side="bottom" />);
    await user.click(screen.getByRole("button", { name: "Détails" }));
    expect(screen.getByRole("dialog").querySelector(".ui-sheet__handle")).not.toBeNull();
  });

  it("sans violation d'accessibilité", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Détails" }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
