import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizableOrientation } from "./Resizable";

// Sous Node, Vitest résout la condition d'export « node » de react-resizable-panels :
// la version serveur, sans effets de mise en page ni ARIA. On teste la version navigateur.
vi.mock("react-resizable-panels", async () => {
  const { createRequire } = await import("node:module");
  const { dirname, join } = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const pkg = createRequire(import.meta.url).resolve("react-resizable-panels/package.json");
  const browserBuild = join(dirname(pkg), "dist", "react-resizable-panels.browser.development.js");
  return import(/* @vite-ignore */ pathToFileURL(browserBuild).href);
});

function Demo({
  orientation,
  withHandle,
  handleRef,
}: {
  orientation?: ResizableOrientation;
  withHandle?: boolean;
  handleRef?: React.Ref<HTMLElement>;
}) {
  return (
    <div style={{ width: 600, height: 400 }}>
      <ResizablePanelGroup orientation={orientation}>
        <ResizablePanel defaultSize={30} minSize={20}>Dossiers</ResizablePanel>
        <ResizableHandle ref={handleRef} withHandle={withHandle} aria-label="Largeur des dossiers" />
        <ResizablePanel defaultSize={70}>Fichiers</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

describe("Resizable", () => {
  it("expose un séparateur nommé, focalisable, avec sa valeur", () => {
    render(<Demo />);
    const separator = screen.getByRole("separator", { name: "Largeur des dossiers" });
    expect(separator).toHaveAttribute("tabindex", "0");
    expect(separator).toHaveAttribute("aria-valuenow", "30");
    expect(separator).toHaveAttribute("aria-valuemin", "20");
    expect(separator).toHaveAttribute("data-panel-group-direction", "horizontal");
  });

  it("se redimensionne aux flèches, à Début et à Fin, sans passer sous le minimum", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    const separator = screen.getByRole("separator");
    expect(separator).toHaveFocus();
    expect(separator).toHaveAttribute("data-resize-handle-active", "keyboard");
    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "40");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(separator).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{ArrowLeft}");
    expect(separator).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{End}");
    expect(separator).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{Home}");
    expect(separator).toHaveAttribute("aria-valuenow", "20");
  });

  it("en vertical, ce sont les flèches haut et bas qui agissent", async () => {
    const user = userEvent.setup();
    render(<Demo orientation="vertical" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("data-panel-group-direction", "vertical");
    act(() => separator.focus());
    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "30");
    await user.keyboard("{ArrowDown}");
    expect(separator).toHaveAttribute("aria-valuenow", "40");
  });

  it("`withHandle` ajoute la pilule décorative ; la ref donne l'élément du séparateur", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Demo withHandle handleRef={ref} />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("data-with-handle", "true");
    expect(separator.querySelector(".ui-resizable__grip")).toHaveAttribute("aria-hidden", "true");
    expect(ref.current).toBe(separator);
  });

  it("libellé par défaut en français", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByRole("separator", { name: "Redimensionner les panneaux" })).toBeInTheDocument();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Demo withHandle />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
