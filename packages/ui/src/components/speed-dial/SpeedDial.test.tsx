import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { SpeedDial, SpeedDialAction, type SpeedDialProps } from "./SpeedDial";

const Icon = () => <svg />;

function Demo({
  onDocument = () => {},
  ...props
}: Partial<SpeedDialProps> & { onDocument?: () => void }) {
  return (
    <>
      <SpeedDial label="Créer" {...props}>
        <SpeedDialAction icon={<Icon />} label="Document" onClick={onDocument} />
        <SpeedDialAction icon={<Icon />} label="Dossier" />
        <SpeedDialAction icon={<Icon />} label="Importer" disabled />
        <SpeedDialAction icon={<Icon />} label="Formulaire" />
      </SpeedDial>
      <button type="button">Après</button>
    </>
  );
}

const fab = () => screen.getByRole("button", { name: "Créer" });

describe("SpeedDial", () => {
  it("bouton de menu : aria-haspopup, aria-expanded, aria-controls", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(fab()).toHaveAttribute("aria-haspopup", "menu");
    expect(fab()).toHaveAttribute("aria-expanded", "false");
    // Fermé, le menu est masqué aux technologies d'assistance.
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(fab());
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Créer" });
    expect(fab()).toHaveAttribute("aria-controls", menu.id);
    expect(menu).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(screen.getByRole("menuitem", { name: "Importer" })).toBeDisabled();
    // Ouvert à la souris, le focus reste sur le FAB.
    expect(fab()).toHaveFocus();
  });

  it("libellés visibles en up/down, infobulles en left/right", () => {
    const { rerender, container } = render(<Demo defaultOpen />);
    expect(screen.getByText("Document")).toHaveClass("ui-speed-dial__label");
    rerender(<Demo defaultOpen direction="left" />);
    expect(screen.getByText("Document")).toHaveClass("ui-sr-only");
    expect(screen.getByRole("menu")).toHaveAttribute("aria-orientation", "horizontal");
    expect(container.querySelector(".ui-speed-dial")).toHaveAttribute("data-direction", "left");
  });

  it("clavier : Entrée ouvre et focalise la première action, flèches, Début/Fin", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(fab()).toHaveFocus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Document" })).toHaveFocus());
    // up : flèche haut éloigne du FAB, l'action désactivée est sautée.
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Dossier" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Formulaire" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Document" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Formulaire" })).toHaveFocus();
    // Le sens inverse ramène jusqu'au FAB.
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(fab()).toHaveFocus();
    expect(fab()).toHaveAttribute("aria-expanded", "true");
  });

  it("clavier : la flèche du sens de déploiement ouvre depuis le FAB", async () => {
    const user = userEvent.setup();
    render(<Demo direction="right" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Document" })).toHaveFocus());
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Dossier" })).toHaveFocus();
  });

  it("Échap referme et rend le focus au FAB", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    await user.keyboard(" ");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Document" })).toHaveFocus());
    await user.keyboard("{Escape}");
    expect(fab()).toHaveAttribute("aria-expanded", "false");
    expect(fab()).toHaveFocus();
  });

  it("Tab referme et quitte le composant", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Document" })).toHaveFocus());
    await user.tab();
    expect(fab()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Après" })).toHaveFocus();
  });

  it("choisir une action la déclenche, referme et rend le focus", async () => {
    const user = userEvent.setup();
    const onDocument = vi.fn();
    render(<Demo onDocument={onDocument} />);
    await user.click(fab());
    await user.click(screen.getByRole("menuitem", { name: "Document" }));
    expect(onDocument).toHaveBeenCalledOnce();
    expect(fab()).toHaveAttribute("aria-expanded", "false");
    expect(fab()).toHaveFocus();
  });

  it("un appui à l'extérieur referme", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(fab());
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Après" }));
    expect(fab()).toHaveAttribute("aria-expanded", "false");
  });

  it("openOnHover : s'ouvre au survol de la souris, se referme en sortant", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo openOnHover onOpenChange={onOpenChange} />);
    await user.hover(fab());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    // Passer du FAB aux actions ne referme pas.
    await user.hover(screen.getByRole("menuitem", { name: "Dossier" }));
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    // Un clic après le survol confirme l'ouverture au lieu de refermer.
    await user.click(fab());
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    await user.unhover(fab());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(fab()).toHaveAttribute("aria-expanded", "false");
  });

  it("contrôlé : open + onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo open onOpenChange={onOpenChange} />);
    expect(fab()).toHaveAttribute("aria-expanded", "true");
    await user.click(fab());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(fab()).toHaveAttribute("aria-expanded", "true");
  });

  it("FAB étendu : le libellé visible le nomme ; icône d'ouverture", () => {
    render(
      <SpeedDial label="Nouveau" extended icon={<svg data-testid="ferme" />} openIcon={<svg data-testid="ouvert" />}>
        <SpeedDialAction icon={<Icon />} label="Document" />
      </SpeedDial>,
    );
    const button = screen.getByRole("button", { name: "Nouveau" });
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveClass("ui-fab--extended");
    expect(screen.getByTestId("ouvert")).toBeInTheDocument();
  });

  it("asChild : une action peut être un lien", async () => {
    const user = userEvent.setup();
    render(
      <SpeedDial label="Créer" defaultOpen>
        <SpeedDialAction asChild icon={<Icon />} label="Modèles">
          <a href="#modeles" />
        </SpeedDialAction>
      </SpeedDial>,
    );
    const link = screen.getByRole("menuitem", { name: "Modèles" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "#modeles");
    await user.click(link);
    expect(fab()).toHaveAttribute("aria-expanded", "false");
  });

  it("cascade : rang de chaque action dans l'ordre du DOM, même via un composant", () => {
    const Actions = () => (
      <>
        <SpeedDialAction icon={<Icon />} label="Un" />
        <SpeedDialAction icon={<Icon />} label="Deux" />
      </>
    );
    render(
      <SpeedDial label="Créer" defaultOpen>
        <Actions />
        <SpeedDialAction icon={<Icon />} label="Trois" />
      </SpeedDial>,
    );
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.style.getPropertyValue("--_i"))).toEqual(["0", "1", "2"]);
    expect(screen.getByRole("menu").style.getPropertyValue("--_n")).toBe("3");
  });

  it("sans violation d'accessibilité, fermé et ouvert", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(fab());
    expect(await axe(container)).toHaveNoViolations();
  });
});
