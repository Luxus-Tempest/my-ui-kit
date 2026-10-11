import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Button } from "../button/Button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/Menu";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./ButtonGroup";

const Chevron = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 6.25 8 9.75l3.5-3.5" />
  </svg>
);

function SplitButton({ onSave = () => {}, onDraft = () => {} }: { onSave?: () => void; onDraft?: () => void }) {
  return (
    <ButtonGroup aria-label="Enregistrer la facture">
      <Button onClick={onSave}>Enregistrer</Button>
      <Menu>
        <MenuTrigger asChild>
          <Button size="icon" aria-label="Autres façons d'enregistrer">
            <Chevron />
          </Button>
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem onSelect={onDraft}>Enregistrer comme brouillon</MenuItem>
          <MenuItem>Enregistrer et envoyer</MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  );
}

describe("ButtonGroup", () => {
  it("est un groupe nommé, horizontal par défaut", () => {
    render(
      <ButtonGroup aria-label="Navigation">
        <Button variant="outline">Précédent</Button>
        <Button variant="outline">Suivant</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Navigation" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("data-slot", "button-group");
    expect(group).toHaveClass("ui-button-group");
  });

  it("variant et size du groupe s'appliquent aux boutons, qui peuvent les redéfinir", () => {
    render(
      <ButtonGroup aria-label="Vue" variant="outline" size="sm">
        <Button>Jour</Button>
        <Button variant="tonal">Semaine</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("button", { name: "Jour" })).toHaveClass("ui-button--outline", "ui-button--size-sm");
    expect(screen.getByRole("button", { name: "Semaine" })).toHaveClass("ui-button--tonal", "ui-button--size-sm");
  });

  it("vertical : l'orientation est exposée et le séparateur devient horizontal", () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Zoom" className="extra">
        <Button variant="secondary">Agrandir</Button>
        <ButtonGroupSeparator data-testid="sep" />
        <Button variant="secondary">Réduire</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Zoom" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveClass("ui-button-group", "extra");
    const sep = screen.getByTestId("sep");
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    expect(sep).toHaveAttribute("data-slot", "button-group-separator");
  });

  it("le séparateur est vertical dans un groupe horizontal et décoratif par défaut", () => {
    render(
      <ButtonGroup aria-label="Historique">
        <Button variant="ghost">Annuler</Button>
        <ButtonGroupSeparator data-testid="sep" />
        <Button variant="ghost">Rétablir</Button>
      </ButtonGroup>,
    );
    const sep = screen.getByTestId("sep");
    expect(sep).toHaveAttribute("data-orientation", "vertical");
    expect(sep).toHaveAttribute("role", "none");
  });

  it("Tab parcourt les boutons dans l'ordre, Entrée les active", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <ButtonGroup aria-label="Pagination">
        <Button variant="outline">Précédent</Button>
        <Button variant="outline" onClick={onNext}>
          Suivant
        </Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Précédent" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Suivant" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("bouton scindé : l'action principale et le menu s'utilisent au clavier", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDraft = vi.fn();
    render(<SplitButton onSave={onSave} onDraft={onDraft} />);

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onSave).toHaveBeenCalledOnce();

    await user.tab();
    const trigger = screen.getByRole("button", { name: "Autres façons d'enregistrer" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onDraft).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("ButtonGroupText s'aligne sur les segments et accepte asChild", () => {
    render(
      <ButtonGroup aria-label="Quantité">
        <ButtonGroupText asChild>
          <span>Qté</span>
        </ButtonGroupText>
        <Button variant="outline">−</Button>
        <Button variant="outline">+</Button>
      </ButtonGroup>,
    );
    const text = screen.getByText("Qté");
    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveClass("ui-button-group__text");
  });

  it("pleine largeur", () => {
    render(
      <ButtonGroup aria-label="Vue" fullWidth>
        <Button variant="outline">Liste</Button>
        <Button variant="outline">Grille</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-full-width");
  });

  it("sans violation d'accessibilité, menu fermé ou ouvert", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <ButtonGroup aria-label="Mise en forme">
          <Button variant="outline">Gras</Button>
          <Button variant="outline">Italique</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Lien</Button>
        </ButtonGroup>
        <SplitButton />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Autres façons d'enregistrer" }));
    expect(await axe(await screen.findByRole("menu"))).toHaveNoViolations();
  });
});
