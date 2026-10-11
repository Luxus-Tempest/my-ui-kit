import { render, screen } from "@testing-library/react";
import { Separator } from "./Separator";
import { Skeleton } from "../skeleton/Skeleton";

describe("Separator & Skeleton", () => {
  it("le séparateur est décoratif par défaut, sémantique sur demande", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("role", "none");
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("le squelette est masqué des lecteurs d'écran", () => {
    const { container } = render(<Skeleton circle style={{ width: 32, height: 32 }} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveAttribute("data-circle", "true");
  });
});
