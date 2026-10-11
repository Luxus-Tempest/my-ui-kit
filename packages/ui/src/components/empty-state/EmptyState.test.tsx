import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { EmptyState } from "./EmptyState";

const Icon = () => <svg viewBox="0 0 16 16" />;

describe("EmptyState", () => {
  it("titre en h3 par défaut, description, icône décorative", () => {
    render(<EmptyState data-testid="e" icon={<Icon />} title="Aucun fichier" description="Déposez des fichiers ici." />);
    expect(screen.getByRole("heading", { level: 3, name: "Aucun fichier" })).toBeInTheDocument();
    expect(screen.getByText("Déposez des fichiers ici.").tagName).toBe("P");
    const root = screen.getByTestId("e");
    expect(root).toHaveClass("ui-empty-state--plain", "ui-empty-state--size-default");
    expect(root.querySelector(".ui-empty-state__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("niveau de titre, taille et variante surchargeables", () => {
    render(<EmptyState data-testid="e" title="Aucun résultat" titleAs="h2" size="sm" variant="card" />);
    expect(screen.getByRole("heading", { level: 2, name: "Aucun résultat" })).toBeInTheDocument();
    expect(screen.getByTestId("e")).toHaveClass("ui-empty-state--card", "ui-empty-state--size-sm");
    expect(screen.getByTestId("e").querySelector(".ui-empty-state__icon")).toBeNull();
  });

  it("clavier : les actions sont atteignables et activables", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(
      <EmptyState
        title="Aucun fichier"
        actions={
          <>
            <button type="button" onClick={onImport}>Importer</button>
            <button type="button">Créer un dossier</button>
          </>
        }
      />,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Importer" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onImport).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole("button", { name: "Créer un dossier" })).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <EmptyState
        icon={<Icon />}
        title="Aucun résultat"
        description="Essayez un autre mot-clé."
        actions={<button type="button">Effacer la recherche</button>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
