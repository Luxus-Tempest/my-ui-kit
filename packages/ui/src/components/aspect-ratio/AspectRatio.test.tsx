import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { AspectRatio } from "./AspectRatio";

describe("AspectRatio", () => {
  it("16 / 9 par défaut, cadrage couvrant", () => {
    render(<AspectRatio data-testid="cadre" />);
    const frame = screen.getByTestId("cadre");
    expect(frame).toHaveClass("ui-aspect-ratio");
    expect(frame.style.aspectRatio).toBe(String(16 / 9));
    expect(frame).toHaveAttribute("data-fit", "cover");
  });

  it("accepte un nombre ou une chaîne CSS ; une valeur invalide revient à 16 / 9", () => {
    const { rerender } = render(<AspectRatio data-testid="cadre" ratio={1} fit="contain" />);
    expect(screen.getByTestId("cadre").style.aspectRatio).toBe("1");
    expect(screen.getByTestId("cadre")).toHaveAttribute("data-fit", "contain");
    rerender(<AspectRatio data-testid="cadre" ratio="4 / 3" />);
    expect(screen.getByTestId("cadre").style.aspectRatio).toBe("4 / 3");
    rerender(<AspectRatio data-testid="cadre" ratio={0} />);
    expect(screen.getByTestId("cadre").style.aspectRatio).toBe(String(16 / 9));
  });

  it("fusionne className et style (rayon)", () => {
    render(<AspectRatio data-testid="cadre" className="vignette" style={{ borderRadius: "var(--ui-r-lg)" }} />);
    const frame = screen.getByTestId("cadre");
    expect(frame).toHaveClass("ui-aspect-ratio", "vignette");
    expect(frame.style.borderRadius).toBe("var(--ui-r-lg)");
  });

  it("asChild : un lien garde ses proportions et reste atteignable au clavier", async () => {
    render(
      <AspectRatio asChild ratio={1}>
        <a href="#album">Album</a>
      </AspectRatio>,
    );
    const link = screen.getByRole("link", { name: "Album" });
    expect(link).toHaveClass("ui-aspect-ratio");
    expect(link.style.aspectRatio).toBe("1");
    await userEvent.setup().tab();
    expect(link).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <AspectRatio ratio={4 / 3}>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Façade du siège" />
      </AspectRatio>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
