import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("rend un bouton ghost non enfoncé par défaut", () => {
    render(<Toggle>Détails</Toggle>);
    const btn = screen.getByRole("button", { name: "Détails" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");
    expect(btn).toHaveAttribute("data-slot", "toggle");
    expect(btn).toHaveClass("ui-button", "ui-button--ghost", "ui-button--size-default", "ui-toggle");
  });

  it("applique la variante et la taille", () => {
    render(<Toggle variant="outline" size="icon-sm" aria-label="Gras"><svg /></Toggle>);
    const btn = screen.getByRole("button", { name: "Gras" });
    expect(btn).toHaveClass("ui-button--outline", "ui-button--size-icon-sm");
    expect(btn).toHaveAttribute("data-variant", "outline");
    expect(btn).toHaveAttribute("data-size", "icon-sm");
  });

  it("bascule au clic, à Espace et à Entrée", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<Toggle aria-label="Gras" onPressedChange={onPressedChange}>G</Toggle>);
    const btn = screen.getByRole("button", { name: "Gras" });
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");
    await user.keyboard(" ");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.keyboard("{Enter}");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("est atteignable au clavier (Tab)", async () => {
    const user = userEvent.setup();
    render(<Toggle>Épingler</Toggle>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Épingler" })).toHaveFocus();
  });

  it("contrôlé : suit la prop pressed", async () => {
    function Demo() {
      const [on, setOn] = React.useState(true);
      return <Toggle pressed={on} onPressedChange={setOn}>Étoile</Toggle>;
    }
    render(<Demo />);
    const btn = screen.getByRole("button", { name: "Étoile" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("désactivé : ne bascule pas", async () => {
    render(<Toggle disabled>Gras</Toggle>);
    const btn = screen.getByRole("button", { name: "Gras" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("transmet la ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Toggle ref={ref}>Ref</Toggle>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Toggle defaultPressed>Détails</Toggle>
        <Toggle variant="outline" size="icon" aria-label="Gras"><svg aria-hidden="true" /></Toggle>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
