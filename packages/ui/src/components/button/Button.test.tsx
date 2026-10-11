import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Button } from "./Button";

describe("Button", () => {
  it("rend un <button type=button> primaire par défaut", () => {
    render(<Button>Enregistrer</Button>);
    const btn = screen.getByRole("button", { name: "Enregistrer" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-slot", "button");
    expect(btn).toHaveClass("ui-button", "ui-button--default", "ui-button--size-default");
  });

  it("applique le rôle et la taille", () => {
    render(<Button variant="outline" size="lg">Exporter</Button>);
    expect(screen.getByRole("button")).toHaveClass("ui-button--outline", "ui-button--size-lg");
  });

  it("propose les rôles tonal et surélevé", () => {
    render(
      <>
        <Button variant="tonal">Importer</Button>
        <Button variant="elevated" size="lg">Nouveau</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Importer" })).toHaveClass("ui-button--tonal");
    expect(screen.getByRole("button", { name: "Nouveau" })).toHaveClass("ui-button--elevated", "ui-button--size-lg");
  });

  it("appelle onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>OK</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("en chargement : reste focusable, garde son nom et ignore les clics", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Enregistrer</Button>);
    const btn = screen.getByRole("button", { name: "Enregistrer" });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("aria-busy", "true");
    btn.focus();
    expect(btn).toHaveFocus();
    await userEvent.click(btn);
    await userEvent.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("désactivé : disabled natif", () => {
    render(<Button disabled>OK</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("bascule : expose aria-pressed", async () => {
    function Toggle() {
      const [on, setOn] = React.useState(false);
      return <Button variant="outline" aria-pressed={on} onClick={() => setOn(!on)}>Gras</Button>;
    }
    render(<Toggle />);
    const btn = screen.getByRole("button", { name: "Gras" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("asChild rend un lien ; désactivé, il bloque la navigation", async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.defaultPrevented);
    render(
      <div onClick={onClick}>
        <Button asChild disabled><a href="/docs">Docs</a></Button>
      </div>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveClass("ui-button");
    expect(link).not.toHaveAttribute("type");
    expect(link).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("avertit en dev si un bouton icône n'a pas de nom", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon"><svg /></Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockClear();
    render(<Button size="icon" aria-label="Ajouter"><svg /></Button>);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("transmet la ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("n'a pas de violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Button>Primaire</Button>
        <Button variant="ghost" size="icon" aria-label="Paramètres"><svg /></Button>
        <Button loading>Chargement</Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
