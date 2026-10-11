import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Sparkline } from "./Sparkline";
import { Stat, StatGroup } from "./Stat";

const TREND = [120, 118, 124, 131, 127, 135, 138, 134, 141, 139, 144, 148];

describe("Stat", () => {
  it("nomme la tuile par son libellé ; compacte en fr-FR et garde la valeur exacte", () => {
    render(
      <Stat
        label="Chiffre d'affaires"
        value={128400}
        format={{ style: "currency", currency: "MAD", maximumFractionDigits: 0 }}
      />,
    );
    const tile = screen.getByRole("group", { name: "Chiffre d'affaires" });
    const value = tile.querySelector(".ui-stat__value")!;
    expect(value.querySelector("[aria-hidden]")!.textContent!.replace(/\s/g, " ")).toBe("128,4 k MAD");
    expect(value).toHaveAttribute("title", expect.stringMatching(/^128\s400\sMAD$/));
    expect(within(tile).getByText(/^128\s400\sMAD$/)).toHaveClass("ui-sr-only");
    // Devise en retrait du nombre.
    expect(value.querySelector(".ui-stat__affix")).toHaveTextContent("MAD");
  });

  it("ne compacte pas sous 10 000, ni sur demande ; signe moins typographique", () => {
    render(
      <>
        <Stat label="Factures émises" value={1284} />
        <Stat label="Solde" value={-4200000} compact={false} />
        <Stat label="Disponibilité" value="99,98 %" />
      </>,
    );
    expect(screen.getByRole("group", { name: "Factures émises" }).querySelector(".ui-stat__value")!.textContent).toBe("1\u202f284");
    expect(screen.getByRole("group", { name: "Solde" }).querySelector(".ui-stat__value")!.textContent).toBe("\u22124\u202f200\u202f000");
    expect(screen.getByRole("group", { name: "Disponibilité" })).toHaveTextContent("99,98 %");
  });

  it("variation : sens × positiveIsGood, flèche et texte, jamais la couleur seule", () => {
    render(
      <>
        <Stat label="Revenus" value={4200} delta={0.124} deltaLabel="vs mois dernier" />
        <Stat label="Dépenses" value={3100} delta={-0.031} deltaLabel="vs mois dernier" positiveIsGood={false} />
        <Stat label="Retards" value={12} delta={3} deltaFormat={{ style: "decimal" }} positiveIsGood={false} />
        <Stat label="Clients" value={86} delta={0} />
      </>,
    );
    const chip = (name: string) => screen.getByRole("group", { name }).querySelector(".ui-stat__delta-chip")!;

    expect(chip("Revenus")).toHaveAttribute("data-tone", "ok");
    expect(chip("Revenus")).toHaveAttribute("data-direction", "up");
    expect(chip("Revenus").querySelector("svg")).not.toBeNull();
    expect(chip("Revenus").querySelector("[aria-hidden='true']:not(svg)")!.textContent).toBe("+12,4\u00a0%");
    expect(within(chip("Revenus") as HTMLElement).getByText("Hausse de 12,4 %, favorable")).toHaveClass("ui-sr-only");
    expect(screen.getByRole("group", { name: "Revenus" })).toHaveTextContent("vs mois dernier");

    // Une baisse des dépenses est une bonne nouvelle.
    expect(chip("Dépenses")).toHaveAttribute("data-tone", "ok");
    expect(chip("Dépenses")).toHaveTextContent("\u22123,1 %");
    expect(chip("Dépenses")).toHaveTextContent("Baisse de 3,1 %, favorable");

    expect(chip("Retards")).toHaveAttribute("data-tone", "err");
    expect(chip("Retards")).toHaveTextContent("+3");
    expect(chip("Retards")).toHaveTextContent("Hausse de 3, défavorable");

    expect(chip("Clients")).toHaveAttribute("data-tone", "neu");
    expect(chip("Clients")).toHaveTextContent("Stable");
  });

  it("tendance : sparkline masquée, remplacée par une phrase ; tuile héros", () => {
    render(<Stat label="Visites" value={148} trend={TREND} size="hero" />);
    const tile = screen.getByRole("group", { name: "Visites" });
    expect(tile).toHaveAttribute("data-size", "hero");
    expect(tile.querySelector("svg.ui-sparkline__svg")).toHaveAttribute("aria-hidden", "true");
    expect(within(tile).getByText("Tendance : de 120 à 148 sur 12 mois")).toHaveClass("ui-sr-only");
  });

  it("clavier : la tuile et sa tendance ne sont pas des arrêts de tabulation", async () => {
    const user = userEvent.setup();
    render(
      <StatGroup aria-label="Indicateurs">
        <Stat label="Visites" value={148} trend={TREND} />
        <Stat label="Inscriptions" value={36} delta={0.08}>
          <a href="#rapport">Voir le rapport</a>
        </Stat>
      </StatGroup>,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Voir le rapport" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <StatGroup>
        <Stat label="Chiffre d'affaires" value={128400} delta={0.124} deltaLabel="vs mois dernier" trend={TREND} size="hero" />
        <Stat label="Dépenses" value={38200} delta={-0.05} positiveIsGood={false} variant="outlined" />
        <Stat label="Panier moyen" value={412} trend={<Sparkline data={TREND} variant="bars" period="semaines" />} variant="plain" />
      </StatGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Sparkline", () => {
  it("ligne : trait, lavis, segment courant et point final détouré", () => {
    const { container } = render(<Sparkline data={[3, 5, 4, 8]} width={100} height={30} color="var(--ui-c3)" period="jours" />);
    const root = container.querySelector(".ui-sparkline")!;
    expect(root).toHaveStyle({ width: "100px", height: "30px" });
    expect(root.getAttribute("style")).toContain("--ui-sparkline-color: var(--ui-c3)");
    const svg = root.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "0 0 100 30");
    expect(svg.querySelector(".ui-sparkline__line")).not.toBeNull();
    expect(svg.querySelector(".ui-sparkline__area")).not.toBeNull();
    expect(svg.querySelector(".ui-sparkline__current")).not.toBeNull();
    expect(svg.querySelector(".ui-sparkline__dot")).toHaveAttribute("r", "4");
    expect(svg.querySelector(".ui-sparkline__ring")).toHaveAttribute("r", "6");
    expect(screen.getByText("Tendance : de 3 à 8 sur 4 jours")).toBeInTheDocument();
  });

  it("courbe lissée : segments de Bézier monotones", () => {
    const { container } = render(<Sparkline data={[1, 3, 2, 5]} curve="smooth" width={90} />);
    expect(container.querySelector(".ui-sparkline__line")!.getAttribute("d")).toMatch(/^M[\d.]+ [\d.]+C/);
  });

  it("barres : une par valeur, la dernière en accent, depuis zéro", () => {
    const { container } = render(<Sparkline data={[4, -2, 6]} variant="bars" width={60} label="Solde hebdomadaire en hausse" />);
    const bars = container.querySelectorAll(".ui-sparkline__bar");
    expect(bars).toHaveLength(3);
    expect(bars[2]).toHaveAttribute("data-current", "true");
    expect(bars[0]).not.toHaveAttribute("data-current");
    expect(screen.getByText("Solde hebdomadaire en hausse")).toBeInTheDocument();
  });

  it("série vide ou constante : pas d'erreur", () => {
    const { container } = render(
      <>
        <Sparkline data={[]} />
        <Sparkline data={[5, 5, 5]} />
      </>,
    );
    expect(screen.getByText("Tendance : aucune donnée")).toBeInTheDocument();
    expect(container.querySelectorAll(".ui-sparkline__dot")).toHaveLength(1);
  });
});
