import { render, screen } from "@testing-library/react";
import { axe } from "../../../vitest.setup";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, getInitials } from "./Avatar";

describe("Avatar", () => {
  it("tire les initiales du nom", () => {
    expect(getInitials("Fatima Zahra El Idrissi")).toBe("FI");
    expect(getInitials("  youssef ")).toBe("Y");
    expect(getInitials("")).toBe("");
    render(<Avatar><AvatarFallback name="Karim Benali" /></Avatar>);
    expect(screen.getByText("KB")).toBeInTheDocument();
  });

  it("la pastille d'état est annoncée seulement si elle a un libellé", () => {
    render(
      <>
        <Avatar><AvatarFallback>A</AvatarFallback><AvatarBadge tone="ok" label="En ligne" /></Avatar>
        <Avatar><AvatarFallback>B</AvatarFallback><AvatarBadge tone="neu" /></Avatar>
      </>,
    );
    expect(screen.getByRole("img", { name: "En ligne" })).toHaveAttribute("data-tone", "ok");
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("le groupe transmet sa taille à ses avatars et au compteur", () => {
    render(
      <AvatarGroup size="sm">
        <Avatar data-testid="a"><AvatarFallback>A</AvatarFallback></Avatar>
        <Avatar data-testid="b" size="lg"><AvatarFallback>B</AvatarFallback></Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    );
    expect(screen.getByTestId("a")).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("b")).toHaveAttribute("data-size", "lg");
    expect(screen.getByText("+3")).toHaveAttribute("data-size", "sm");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Avatar><AvatarFallback name="Sara Alami" /></Avatar>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
