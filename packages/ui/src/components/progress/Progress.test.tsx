import { render, screen } from "@testing-library/react";
import { axe } from "../../../vitest.setup";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("expose sa valeur et son libellé", () => {
    render(<Progress value={42} label="Import des factures" showValue />);
    const bar = screen.getByRole("progressbar", { name: "Import des factures" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42 %")).toBeInTheDocument();
  });

  it("borne la valeur entre 0 et max", () => {
    render(<Progress aria-label="Quota" value={150} max={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("indéterminée sans valeur", () => {
    render(<Progress aria-label="Synchronisation" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("formateur de valeur personnalisé", () => {
    render(<Progress value={3} max={12} label="Étapes" showValue={(v, m) => `${v} / ${m}`} />);
    expect(screen.getByText("3 / 12")).toBeInTheDocument();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Progress value={70} tone="ok" label="Stockage" showValue />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
