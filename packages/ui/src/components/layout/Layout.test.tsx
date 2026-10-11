import { render, screen } from "@testing-library/react";
import { axe } from "../../../vitest.setup";
import { Box, Grid, HStack, Stack } from "./Layout";
import { Heading, Kbd, Link, Text, VisuallyHidden } from "../typography/Typography";
import { ThemeProvider } from "../../theme/ThemeProvider";

describe("Mise en page et typographie", () => {
  it("Box rend l'élément demandé avec des valeurs de jetons", () => {
    render(<Box as="section" p={4} bg="panel" border radius="lg" shadow={2} data-testid="b" />);
    const box = screen.getByTestId("b");
    expect(box.tagName).toBe("SECTION");
    expect(box.style.padding).toBe("16px");
    expect(box.style.background).toBe("var(--ui-panel)");
    expect(box.style.borderRadius).toBe("var(--ui-r-lg)");
  });

  it("Stack et Grid posent flex et grid", () => {
    render(
      <>
        <Stack gap={3} data-testid="s" />
        <HStack justify="between" data-testid="h" />
        <Grid columns={3} data-testid="g" />
        <Grid minChildWidth={220} data-testid="g2" />
      </>,
    );
    expect(screen.getByTestId("s").style.gap).toBe("12px");
    expect(screen.getByTestId("h").style.flexDirection).toBe("row");
    expect(screen.getByTestId("h").style.justifyContent).toBe("space-between");
    expect(screen.getByTestId("g").style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(screen.getByTestId("g2").style.gridTemplateColumns).toContain("auto-fill");
  });

  it("Heading sépare niveau et taille", () => {
    render(<Heading level={3} size="xl">Factures</Heading>);
    const h = screen.getByRole("heading", { level: 3, name: "Factures" });
    expect(h).toHaveAttribute("data-size", "xl");
  });

  it("Link externe : nouvel onglet sûr et annoncé", () => {
    render(<Link href="https://dgi.gov.ma" external>Portail DGI</Link>);
    const a = screen.getByRole("link", { name: "Portail DGI (nouvel onglet)" });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("le thème global se pose sur <html> et se retire au démontage", () => {
    const { unmount } = render(<ThemeProvider defaultMode="dark" overrides={{ pri: "#7c3aed" }}>x</ThemeProvider>);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.getPropertyValue("--ui-pri")).toBe("#7c3aed");
    unmount();
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(document.documentElement.style.getPropertyValue("--ui-pri")).toBe("");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Stack>
        <Heading level={1}>Tableau de bord</Heading>
        <Text tone="muted">Appuie sur <Kbd>⌘K</Kbd> pour chercher.</Text>
        <Link href="/aide">Aide<VisuallyHidden> sur la recherche</VisuallyHidden></Link>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("styles de mise en page", () => {
  it("n'émet aucune clé vide qui effacerait gap ou padding", () => {
    render(<><Grid gap={3} data-testid="g" /><Box p={4} data-testid="b" /></>);
    const g = screen.getByTestId("g").getAttribute("style")!;
    expect(g).toContain("gap: 12px");
    expect(g).not.toMatch(/row-gap|column-gap/);
    expect(screen.getByTestId("b").getAttribute("style")).not.toMatch(/padding-inline|padding-block/);
  });
});
