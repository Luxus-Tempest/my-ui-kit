import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle } from "./Card";

describe("Card", () => {
  it("rôle de surface tonal par défaut, variantes et sélection", () => {
    render(
      <>
        <Card data-testid="a" />
        <Card data-testid="b" variant="elevated" size="sm" selected />
      </>,
    );
    expect(screen.getByTestId("a")).toHaveClass("ui-card--filled", "ui-card--size-default");
    expect(screen.getByTestId("a")).not.toHaveAttribute("data-interactive");
    expect(screen.getByTestId("b")).toHaveClass("ui-card--elevated", "ui-card--size-sm");
    expect(screen.getByTestId("b")).toHaveAttribute("data-selected");
  });

  it("asChild : la carte entière devient le lien, interactive", async () => {
    render(
      <Card asChild>
        <a href="#budget">
          <CardTitle>Budget 2027</CardTitle>
        </a>
      </Card>,
    );
    const link = screen.getByRole("link", { name: "Budget 2027" });
    expect(link).toHaveClass("ui-card");
    expect(link).toHaveAttribute("data-interactive", "true");
    await userEvent.setup().tab();
    expect(link).toHaveFocus();
  });

  it("le média accepte un rapport d'aspect", () => {
    render(<CardMedia data-testid="m" aspectRatio="16 / 9" />);
    expect(screen.getByTestId("m").style.aspectRatio).toBe("16 / 9");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Espace de stockage</CardTitle>
          <CardDescription>3,2 Go sur 15 Go</CardDescription>
          <CardAction>
            <button type="button" aria-label="Plus d'actions">⋯</button>
          </CardAction>
        </CardHeader>
        <CardContent>Contenu</CardContent>
        <CardFooter>
          <button type="button">Gérer</button>
        </CardFooter>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
