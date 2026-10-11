import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Calendar, type DateRange } from "./Calendar";

describe("Calendar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 10, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("est en français, commence le lundi et marque aujourd'hui", () => {
    const { container } = render(<Calendar />);
    expect(screen.getByText("Octobre 2026")).toHaveClass("ui-calendar__caption-label");
    const weekdays = container.querySelectorAll(".ui-calendar__weekday");
    expect(weekdays[0]).toHaveAttribute("aria-label", "lundi");
    expect(weekdays[6]).toHaveAttribute("aria-label", "dimanche");
    expect(screen.getByRole("button", { name: "Aller au mois précédent" })).toHaveClass("ui-button", "ui-button--ghost");
    expect(screen.getByRole("button", { name: "Aller au mois suivant" })).toBeInTheDocument();
    const today = container.querySelector(".ui-calendar__day--today");
    expect(today).toHaveAttribute("data-day", "2026-10-10");
    // Les classes de react-day-picker ne sont pas utilisées.
    expect(container.querySelector("[class*='rdp-']")).toBeNull();
  });

  it("transmet la ref à la racine", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Calendar ref={ref} />);
    expect(ref.current).toHaveClass("ui-calendar");
  });

  it("navigue au clavier et sélectionne avec Entrée", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);
    await user.tab(); // mois précédent
    await user.tab(); // mois suivant
    await user.tab(); // grille : aujourd'hui
    expect(document.activeElement).toHaveAccessibleName(/^Aujourd'hui, samedi 10 octobre 2026/);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAccessibleName(/dimanche 11 octobre 2026/);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2026, 9, 18));
  });

  it("change de mois avec les boutons de navigation", async () => {
    const user = userEvent.setup();
    render(<Calendar />);
    await user.click(screen.getByRole("button", { name: "Aller au mois suivant" }));
    expect(screen.getByText("Novembre 2026")).toBeInTheDocument();
  });

  it("peint la plage : début, milieu et fin", () => {
    const range: DateRange = { from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) };
    const { container } = render(<Calendar mode="range" selected={range} />);
    expect(container.querySelector("[data-day='2026-10-12']")).toHaveClass("ui-calendar__day--range-start");
    expect(container.querySelector("[data-day='2026-10-13']")).toHaveClass("ui-calendar__day--range-middle");
    expect(container.querySelector("[data-day='2026-10-15']")).toHaveClass("ui-calendar__day--range-end");
  });

  it("désactive les jours hors bornes", () => {
    render(<Calendar mode="single" disabled={{ before: new Date(2026, 9, 5) }} />);
    expect(screen.getByRole("button", { name: /samedi 3 octobre 2026/ })).toBeDisabled();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Calendar mode="range" selected={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
