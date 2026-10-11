import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";

const html = () => document.documentElement;
const conteneur = (enfant: HTMLElement) => enfant.closest(".ui-root");

function Lecture() {
  const { density } = useTheme();
  return <span data-testid="densite">{density ?? "héritée"}</span>;
}

describe("ThemeProvider : densité", () => {
  afterEach(() => {
    html().removeAttribute("data-ui-density");
  });

  it("portée globale : pose la densité sur le conteneur et sur <html>, la retire au démontage", () => {
    const { unmount } = render(
      <ThemeProvider density="compact">
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    expect(conteneur(screen.getByTestId("x"))).toHaveAttribute("data-ui-density", "compact");
    expect(html()).toHaveAttribute("data-ui-density", "compact");
    unmount();
    expect(html()).not.toHaveAttribute("data-ui-density");
  });

  it("portée globale : restaure au démontage la densité que <html> portait avant", () => {
    html().setAttribute("data-ui-density", "comfortable");
    const { unmount } = render(<ThemeProvider density="compact">x</ThemeProvider>);
    expect(html()).toHaveAttribute("data-ui-density", "compact");
    unmount();
    expect(html()).toHaveAttribute("data-ui-density", "comfortable");
  });

  it("suit un changement de densité, sur le conteneur comme sur <html>", () => {
    const { rerender } = render(
      <ThemeProvider density="compact">
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider density="comfortable">
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    expect(conteneur(screen.getByTestId("x"))).toHaveAttribute("data-ui-density", "comfortable");
    expect(html()).toHaveAttribute("data-ui-density", "comfortable");
    rerender(
      <ThemeProvider>
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    expect(conteneur(screen.getByTestId("x"))).not.toHaveAttribute("data-ui-density");
    expect(html()).not.toHaveAttribute("data-ui-density");
  });

  it("portée locale : seulement sur le conteneur, <html> reste intact", () => {
    html().setAttribute("data-ui-density", "default");
    const { unmount } = render(
      <ThemeProvider scope="local" density="compact">
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    expect(conteneur(screen.getByTestId("x"))).toHaveAttribute("data-ui-density", "compact");
    expect(html()).toHaveAttribute("data-ui-density", "default");
    unmount();
    expect(html()).toHaveAttribute("data-ui-density", "default");
  });

  it("sans densité : rien n'est posé, la densité d'un ancêtre est héritée", () => {
    html().setAttribute("data-ui-density", "compact");
    const { unmount } = render(
      <ThemeProvider>
        <span data-testid="x">x</span>
      </ThemeProvider>,
    );
    expect(conteneur(screen.getByTestId("x"))).not.toHaveAttribute("data-ui-density");
    expect(html()).toHaveAttribute("data-ui-density", "compact");
    unmount();
    expect(html()).toHaveAttribute("data-ui-density", "compact");
  });

  it("useTheme expose la densité posée par le provider", () => {
    render(
      <ThemeProvider density="comfortable">
        <Lecture />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("densite")).toHaveTextContent("comfortable");
  });

  it("thème et densité se posent et se restaurent indépendamment", () => {
    const { unmount } = render(<ThemeProvider defaultMode="dark" density="compact">x</ThemeProvider>);
    expect(html()).toHaveAttribute("data-theme", "dark");
    expect(html()).toHaveAttribute("data-ui-density", "compact");
    unmount();
    expect(html()).not.toHaveAttribute("data-theme");
    expect(html()).not.toHaveAttribute("data-ui-density");
  });
});
