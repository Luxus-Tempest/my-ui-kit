import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { DateTimePicker, TimePicker, parseTime } from "./TimePicker";

describe("parseTime", () => {
  it.each([
    ["14:30", "14:30"],
    ["14h30", "14:30"],
    ["14 h 30", "14:30"],
    ["14.30", "14:30"],
    ["1430", "14:30"],
    ["930", "09:30"],
    ["9", "09:00"],
    ["14h", "14:00"],
    ["9h5", "09:05"],
    ["0:00", "00:00"],
    ["23:59", "23:59"],
  ])("« %s » → %s", (input, expected) => {
    expect(parseTime(input)).toBe(expected);
  });

  it.each(["", "abc", "24:00", "12:60", "14:30:00", "12345", "h30"])("« %s » est refusé", (input) => {
    expect(parseTime(input)).toBeNull();
  });
});

describe("TimePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 10, 10, 7));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("combobox « Heure » hors Field ; le clic ouvre la liste par pas de 15 minutes", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="14:30" />);
    const input = screen.getByRole("combobox", { name: "Heure" });
    expect(input).toHaveValue("14:30");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    const list = await screen.findByRole("listbox", { name: "Heures proposées" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", list.id);
    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(96);
    expect(options[0]).toHaveTextContent("00:00");
    expect(options[95]).toHaveTextContent("23:45");
    expect(within(list).getByRole("option", { name: "14:30" })).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveFocus();
  });

  it.each([
    ["1430", "14:30"],
    ["14h30", "14:30"],
    ["9h5", "09:05"],
  ])("saisie « %s » normalisée en %s en quittant le champ", async (typed, expected) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard(typed);
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(expected);
    expect(input).toHaveValue(expected);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("une saisie illisible est abandonnée : retour à la dernière heure valide", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.clear(input);
    await user.keyboard("25:00{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("09:00");
  });

  it("vider le champ efface l'heure", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await user.clear(screen.getByRole("combobox"));
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("au clavier : ↓ ouvre sur l'heure la plus proche, ↓ / ↑ parcourent, Entrée choisit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.tab();
    await user.keyboard("{ArrowDown}");
    const list = await screen.findByRole("listbox");
    // Sans valeur : l'heure la plus proche de maintenant (10:07 → 10:00).
    const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "");
    expect(active()).toHaveTextContent("10:00");
    expect(active()).toHaveAttribute("data-highlighted");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(active()).toHaveTextContent("10:15");
    await user.keyboard("{PageDown}");
    expect(active()).toHaveTextContent("11:15");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("11:15");
    expect(input).toHaveValue("11:15");
    expect(list).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("la saisie cale la liste sur l'entrée la plus proche, Entrée garde l'heure tapée", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("14:37");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}");
    expect(document.getElementById(input.getAttribute("aria-activedescendant") ?? "")).toHaveTextContent("14:30");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(input).toHaveValue("14:37");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("14:37");
  });

  it("Échap ferme la liste sans rien changer, puis annule la saisie", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker defaultValue="08:00" onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(input).toHaveFocus();
    await user.keyboard("{Backspace}9");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("08:00");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("un clic sur une heure la choisit, ferme la liste et garde le focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker step={30} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "16:30" }));
    expect(onValueChange).toHaveBeenCalledWith("16:30");
    expect(input).toHaveValue("16:30");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input).toHaveFocus();
  });

  it("minTime / maxTime / step bornent la liste et la saisie", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimePicker minTime="09:00" maxTime="18:00" step={30} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    const options = within(await screen.findByRole("listbox")).getAllByRole("option");
    expect(options).toHaveLength(19);
    expect(options[0]).toHaveTextContent("09:00");
    expect(options[18]).toHaveTextContent("18:00");
    await user.keyboard("7h{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("contrôlé, et envoyé sous son nom dans un formulaire", async () => {
    const user = userEvent.setup();
    let data: FormData | undefined;
    function Controlled() {
      const [time, setTime] = React.useState("9:30");
      return (
        <form
          aria-label="Rendez-vous"
          onSubmit={(event) => {
            event.preventDefault();
            data = new FormData(event.currentTarget);
          }}
        >
          <TimePicker name="debut" value={time} onValueChange={setTime} />
          <output>{time}</output>
          <button type="submit">Envoyer</button>
        </form>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("09:30");
    await user.clear(input);
    await user.keyboard("1015");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));
    expect(screen.getByRole("status")).toHaveTextContent("10:15");
    expect(data?.get("debut")).toBe("10:15");
  });

  it("dans un Field : libellé, erreur, obligatoire ; désactivé", () => {
    const { rerender } = render(
      <Field label="Début" error="Heure obligatoire" required>
        <TimePicker />
      </Field>,
    );
    const input = screen.getByRole("combobox", { name: /Début/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Heure obligatoire");
    rerender(
      <Field label="Début" disabled>
        <TimePicker />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Début" })).toBeDisabled();
  });

  it("sans violation d'accessibilité, liste fermée ou ouverte", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Début" hint="Format 24 h, par exemple 14:30">
        <TimePicker defaultValue="14:30" />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}");
    expect(await axe(container)).toHaveNoViolations();
    expect(await axe(screen.getByRole("listbox"))).toHaveNoViolations();
  });
});

describe("DateTimePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 10, 10, 7));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dans un Field : un groupe nommé, deux contrôles nommés « libellé + partie »", () => {
    render(
      <Field label="Rendez-vous" error="Choisissez un créneau.">
        <DateTimePicker defaultValue={new Date(2026, 9, 12, 9, 15)} />
      </Field>,
    );
    expect(screen.getByRole("group", { name: "Rendez-vous" })).toBeInTheDocument();
    const date = screen.getByRole("button", { name: "Rendez-vous Date 12 oct. 2026" });
    const time = screen.getByRole("combobox", { name: "Rendez-vous Heure" });
    expect(time).toHaveValue("09:15");
    for (const control of [date, time]) {
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toHaveAccessibleDescription("Choisissez un créneau.");
    }
  });

  it("l'heure saisie avant la date est gardée, la valeur part avec la date", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateTimePicker onValueChange={onValueChange} />);
    const time = screen.getByRole("combobox", { name: "Heure" });
    await user.click(time);
    await user.keyboard("1430");
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(time).toHaveValue("14:30");

    await user.click(screen.getByRole("button", { name: /^Date/ }));
    await user.click(await screen.findByRole("button", { name: /lundi 12 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 12, 14, 30));
  });

  it("une date sans heure prend defaultTime ; changer l'heure garde le jour", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateTimePicker defaultTime="09:00" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /^Date/ }));
    await user.click(await screen.findByRole("button", { name: /mardi 13 octobre 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 13, 9, 0));
    const time = screen.getByRole("combobox", { name: "Heure" });
    expect(time).toHaveValue("09:00");
    await user.click(time);
    await user.click(screen.getByRole("option", { name: "17:45" }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 13, 17, 45));
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Field label="Rendez-vous" hint="Heure de Casablanca">
        <DateTimePicker defaultValue={new Date(2026, 9, 12, 9, 15)} />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
