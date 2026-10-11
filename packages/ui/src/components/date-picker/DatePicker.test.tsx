import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { DatePicker, DateRangePicker, formatDate, formatDateRange } from "./DatePicker";

describe("DatePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 10, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formate les dates en français", () => {
    expect(formatDate(new Date(2026, 9, 10))).toBe("10 oct. 2026");
    expect(formatDateRange({ from: new Date(2026, 9, 10), to: undefined })).toBe("10 oct. 2026 – …");
    expect(formatDateRange({ from: new Date(2026, 9, 10), to: new Date(2026, 9, 14) })).toMatch(/10.+14 oct\. 2026/);
  });

  it("annonce son libellé et sa valeur, et reçoit l'erreur du Field", () => {
    render(
      <Field label="Échéance" error="Date obligatoire">
        <DatePicker defaultValue={new Date(2026, 9, 10)} />
      </Field>,
    );
    const trigger = screen.getByRole("button", { name: "Échéance 10 oct. 2026" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Date obligatoire");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("hors Field : « Choisir une date » et le texte d'indication", () => {
    const { rerender } = render(<DatePicker />);
    expect(screen.getByRole("button", { name: "Choisir une date" })).toHaveAttribute("data-placeholder");
    rerender(<DatePicker value={new Date(2026, 9, 10)} />);
    expect(screen.getByRole("button", { name: "Choisir une date 10 oct. 2026" })).not.toHaveAttribute("data-placeholder");
  });

  it("s'ouvre au clavier, choisit un jour aux flèches, se ferme et rend le focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Field label="Échéance">
        <DatePicker onValueChange={onValueChange} />
      </Field>,
    );
    const trigger = screen.getByRole("button", { name: /Échéance/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: "Choisir une date" })).toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName(/^Aujourd'hui, samedi 10 octobre 2026/));

    await user.keyboard("{ArrowRight}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 11));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent("11 oct. 2026");
  });

  it("Échap ferme sans changer la valeur", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("respecte minDate / maxDate", async () => {
    const user = userEvent.setup();
    render(<DatePicker minDate={new Date(2026, 9, 5)} maxDate={new Date(2026, 9, 20)} />);
    await user.click(screen.getByRole("button"));
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: /dimanche 4 octobre 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /mercredi 21 octobre 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /lundi 5 octobre 2026/ })).toBeEnabled();
  });

  it("clearable : « Effacer la date » vide la valeur", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker clearable defaultValue={new Date(2026, 9, 10)} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: "Effacer la date" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent("Choisir une date");
  });

  it("« Aujourd'hui » choisit la date du jour et ferme ; désactivé hors bornes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { unmount } = render(<DatePicker onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /Choisir une date/ }));
    await user.click(await screen.findByRole("button", { name: "Aujourd'hui" }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 10));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    unmount();

    render(<DatePicker minDate={new Date(2026, 10, 1)} />);
    await user.click(screen.getByRole("button", { name: /Choisir une date/ }));
    expect(await screen.findByRole("button", { name: "Aujourd'hui" })).toBeDisabled();
  });

  it("désactivé par le Field", () => {
    render(
      <Field label="Échéance" disabled>
        <DatePicker />
      </Field>,
    );
    expect(screen.getByRole("button", { name: /Échéance/ })).toBeDisabled();
  });

  it("sans violation d'accessibilité, ouvert ou fermé", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Échéance" hint="Format : 10 oct. 2026">
        <DatePicker clearable defaultValue={new Date(2026, 9, 10)} />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: /Échéance/ }));
    expect(await axe(await screen.findByRole("dialog"))).toHaveNoViolations();
  });
});

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 10, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("deux mois ; début puis fin, et la fin ferme le panneau", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Field label="Période">
        <DateRangePicker onValueChange={onValueChange} presets={false} />
      </Field>,
    );
    const trigger = screen.getByRole("button", { name: /Période/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: "Choisir une période" });
    expect(dialog.querySelectorAll(".ui-calendar__month")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /lundi 12 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 12), to: undefined });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Du 12 oct. 2026 — choisissez la date de fin")).toHaveAttribute("role", "status");
    await user.click(screen.getByRole("button", { name: /jeudi 15 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveTextContent(/12.+15 oct\. 2026/);
  });

  it("à la réouverture, le premier clic démarre une nouvelle période ; un clic avant le début le déplace", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        presets={false}
        defaultValue={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Choisir une période/ }));
    await user.click(screen.getByRole("button", { name: /mardi 20 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 20), to: undefined });
    await user.click(screen.getByRole("button", { name: /vendredi 16 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 16), to: undefined });
    await user.click(screen.getByRole("button", { name: /jeudi 22 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 16), to: new Date(2026, 9, 22) });
  });

  it("périodes prédéfinies : appliquées en un clic, marquées, désactivées hors bornes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateRangePicker onValueChange={onValueChange} minDate={new Date(2026, 9, 1)} />);
    await user.click(screen.getByRole("button", { name: /Choisir une période/ }));
    const presets = screen.getByRole("group", { name: "Périodes" });
    expect(within(presets).getByRole("button", { name: "30 derniers jours" })).toBeDisabled();
    await user.click(within(presets).getByRole("button", { name: "7 derniers jours" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 4), to: new Date(2026, 9, 10) });
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: /4.+10 oct\. 2026/ }));
    expect(within(screen.getByRole("group", { name: "Périodes" })).getByRole("button", { name: "7 derniers jours" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Field label="Période">
        <DateRangePicker defaultValue={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) }} />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
