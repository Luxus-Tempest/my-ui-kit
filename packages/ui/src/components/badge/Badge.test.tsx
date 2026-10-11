import { render, screen } from "@testing-library/react";
import { axe } from "../../../vitest.setup";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("compteur par défaut", () => {
    render(<Badge>12</Badge>);
    expect(screen.getByText("12")).toHaveClass("ui-badge", "ui-badge--count");
  });

  it("pastille d'état avec puce décorative", () => {
    render(<Badge variant="ok" dot>Payée</Badge>);
    const badge = screen.getByText("Payée");
    expect(badge).toHaveClass("ui-badge--ok");
    expect(badge.querySelector(".ui-badge__dot")).toHaveAttribute("aria-hidden", "true");
  });

  it("teinte libre via une variable CSS", () => {
    render(<Badge variant="tinted" tint="#7c3aed">Confidentiel</Badge>);
    expect(screen.getByText("Confidentiel").style.getPropertyValue("--ui-badge-tint")).toBe("#7c3aed");
  });

  it("asChild garde la puce et rend un lien", () => {
    render(<Badge asChild variant="pri" dot><a href="/f">Brouillon</a></Badge>);
    const link = screen.getByRole("link", { name: "Brouillon" });
    expect(link).toHaveClass("ui-badge--pri");
    expect(link.querySelector(".ui-badge__dot")).not.toBeNull();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<><Badge variant="err" dot>En retard</Badge><Badge variant="outline">3</Badge></>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
