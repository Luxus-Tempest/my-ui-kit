import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";

// jsdom ne dessine pas : une fausse instance ECharts enregistre les appels.
const instances: FakeChart[] = [];
class FakeChart {
  options: Record<string, any>[] = [];
  themes: unknown[] = [];
  actions: Record<string, unknown>[] = [];
  disposed = false;
  setTheme(theme: unknown) { this.themes.push(theme); }
  setOption(option: Record<string, any>) { this.options.push(option); }
  get last() { return this.options[this.options.length - 1]; }
  resize() {}
  dispose() { this.disposed = true; }
  on() {}
  off() {}
  dispatchAction(action: Record<string, unknown>) { this.actions.push(action); }
}
vi.mock("./echarts", () => ({
  echarts: {
    init: (_el: HTMLElement, theme: unknown) => {
      const c = new FakeChart();
      c.themes.push(theme);
      instances.push(c);
      return c;
    },
  },
  ensureChartModules: () => {},
  registerChartModules: () => {},
}));

const { Chart } = await import("./Chart");
const { BarChart, DonutChart, LineChart } = await import("./charts");

const DATA = [
  { mois: "Janv.", ca: 1200, charges: 800 },
  { mois: "Févr.", ca: 1500, charges: 900 },
  { mois: "Mars", ca: 1100, charges: 950 },
];
const SERIES = [
  { key: "ca" as const, label: "Chiffre d'affaires" },
  { key: "charges" as const, label: "Charges" },
];

const lastChart = () => instances[instances.length - 1];
// La création attend la lecture des jetons : sous la charge de la suite complète, laisser du temps.
const until = (assertion: () => void) => waitFor(assertion, { timeout: 4000 });

beforeEach(() => {
  instances.length = 0;
});

describe("Chart", () => {
  it("applique le thème des jetons puis l'option, et se détruit au démontage", async () => {
    const { unmount } = render(<Chart aria-label="Ventes" option={{ series: [{ type: "line", data: [1, 2] }] }} />);
    await until(() => expect(lastChart()?.options.length).toBeGreaterThan(0));
    const chart = lastChart();
    expect(chart.themes).toHaveLength(1);
    expect((chart.themes[0] as { color: string[] }).color).toHaveLength(8);
    expect(chart.last.series).toEqual([{ type: "line", data: [1, 2] }]);
    unmount();
    expect(chart.disposed).toBe(true);
  });

  it("une option fonction reçoit les jetons", async () => {
    const option = vi.fn((t: { fg: string }) => ({ textStyle: { color: t.fg } }));
    render(<Chart aria-label="Ventes" option={option} />);
    await until(() => expect(option).toHaveBeenCalled());
    expect(lastChart().last.textStyle.color).toBeTruthy();
  });
});

describe("LineChart", () => {
  it("légende cliquable : masquer une série ne repeint pas les autres", async () => {
    render(<LineChart title="Résultat mensuel" data={DATA} x="mois" series={SERIES} />);
    await until(() => expect(lastChart()?.last?.series).toHaveLength(2));
    const colorOf = (id: string) => lastChart().last.series.find((s: { id: string }) => s.id === id)?.color;
    const chargesColor = colorOf("charges");

    await userEvent.setup().click(screen.getByRole("button", { name: "Chiffre d'affaires" }));
    await until(() => expect(lastChart().last.series).toHaveLength(1));
    expect(colorOf("charges")).toBe(chargesColor);
    expect(screen.getByRole("button", { name: "Chiffre d'affaires" })).toHaveAttribute("aria-pressed", "false");
    // La dernière série visible ne peut pas être masquée.
    expect(screen.getByRole("button", { name: "Charges" })).toBeDisabled();
  });

  it("une seule série : pas de légende ; étiquette de fin = valeur", async () => {
    render(<LineChart title="CA" data={DATA} x="mois" series={[SERIES[0]]} />);
    await until(() => expect(lastChart()?.last?.series).toHaveLength(1));
    expect(screen.queryByRole("list", { name: /Légende/ })).toBeNull();
    const end = lastChart().last.series[0].endLabel;
    expect(end.show).toBe(true);
    expect(end.formatter({ value: 1100 })).toBe("1 100");
  });

  it("infobulle : libellés insérés en texte, jamais en HTML", async () => {
    render(<LineChart title="CA" data={DATA} x="mois" series={[{ key: "ca", label: "<img src=x onerror=alert(1)>" }]} />);
    await until(() => expect(lastChart()?.last?.tooltip).toBeDefined());
    const el: HTMLElement = lastChart().last.tooltip.formatter([
      { seriesName: "<img src=x onerror=alert(1)>", value: 1500, color: "#2a78d6", dataIndex: 1 },
    ]);
    expect(el.querySelector("img")).toBeNull();
    expect(el.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(el.querySelector(".ui-chart-tip__header")).toHaveTextContent("Févr.");
  });

  it("clavier : les flèches promènent l'infobulle, Échap la ferme", async () => {
    const user = userEvent.setup();
    render(<LineChart title="Résultat mensuel" data={DATA} x="mois" series={SERIES} />);
    const plot = screen.getByRole("img", { name: /Résultat mensuel/ });
    await until(() => expect(lastChart()?.options.length).toBeGreaterThan(0));
    plot.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{End}{Escape}");
    expect(lastChart().actions).toEqual([
      { type: "showTip", seriesIndex: 0, dataIndex: 0 },
      { type: "showTip", seriesIndex: 0, dataIndex: 1 },
      { type: "showTip", seriesIndex: 0, dataIndex: 2 },
      { type: "hideTip" },
    ]);
  });

  it("vue tableau : toujours lue par les lecteurs d'écran, affichable", () => {
    const { rerender } = render(<LineChart title="Résultat mensuel" data={DATA} x="mois" xLabel="Mois" series={SERIES} />);
    const table = screen.getByRole("table", { name: "Résultat mensuel" });
    expect(table.closest(".ui-sr-only")).not.toBeNull();
    expect(screen.getByRole("cell", { name: "1 500" })).toBeInTheDocument();
    rerender(<LineChart title="Résultat mensuel" data={DATA} x="mois" xLabel="Mois" series={SERIES} view="table" />);
    expect(screen.getByRole("table", { name: "Résultat mensuel" }).closest(".ui-sr-only")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe("BarChart", () => {
  it("barres de 24 px au plus, bout arrondi côté donnée", async () => {
    render(<BarChart title="Ventes" data={DATA} x="mois" series={SERIES} />);
    await until(() => expect(lastChart()?.last?.series).toHaveLength(2));
    for (const s of lastChart().last.series) {
      expect(s.barMaxWidth).toBe(24);
      expect(s.itemStyle.borderRadius).toEqual([4, 4, 0, 0]);
      expect(s.itemStyle.borderWidth).toBe(0);
    }
  });

  it("empilées : seul le segment du haut est arrondi, écart de fond entre segments", async () => {
    render(<BarChart title="Ventes" data={DATA} x="mois" series={SERIES} stacked horizontal />);
    await until(() => expect(lastChart()?.last?.series).toHaveLength(2));
    const [bottom, top] = lastChart().last.series;
    expect(bottom.itemStyle.borderRadius).toBe(0);
    expect(top.itemStyle.borderRadius).toEqual([0, 4, 4, 0]);
    expect(bottom.itemStyle.borderWidth).toBe(1);
    expect(bottom.itemStyle.borderColor).toBeTruthy();
  });
});

describe("DonutChart", () => {
  it("au-delà de six parts, la fin se regroupe dans « Autres »", async () => {
    const data = ["A", "B", "C", "D", "E", "F", "G", "H"].map((label, i) => ({ label, value: 10 + i }));
    render(<DonutChart title="Répartition" data={data} />);
    await until(() => expect(lastChart()?.last?.series?.[0].data).toHaveLength(6));
    const names = lastChart().last.series[0].data.map((d: { name: string }) => d.name);
    expect(names).toEqual(["A", "B", "C", "D", "E", "Autres"]);
    expect(lastChart().last.series[0].data[5].value).toBe(15 + 16 + 17);
    expect(screen.getByRole("button", { name: "Autres" })).toBeInTheDocument();
  });
});

describe("accessibilité", () => {
  it("sans violation (courbes, barres, anneau)", async () => {
    const { container } = render(
      <>
        <LineChart title="Résultat mensuel" data={DATA} x="mois" series={SERIES} />
        <BarChart title="Ventes" data={DATA} x="mois" series={SERIES} />
        <DonutChart title="Répartition" data={[{ label: "Produits", value: 60 }, { label: "Services", value: 40 }]} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
