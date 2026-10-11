import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { NumberInput, parseNumber } from "./NumberInput";

/** Intl fr-FR groupe avec une espace fine insécable : on la normalise pour comparer. */
const norm = (s: string) => s.replace(/[  ]/g, " ");

describe("parseNumber", () => {
  it("lit les écritures françaises et internationales", () => {
    expect(parseNumber("1 234,5")).toBe(1234.5);
    expect(parseNumber("1 234,5")).toBe(1234.5);
    expect(parseNumber("1234.5")).toBe(1234.5);
    expect(parseNumber("1.234,5")).toBe(1234.5);
    expect(parseNumber("1,234.5")).toBe(1234.5);
    expect(parseNumber("−12,5")).toBe(-12.5);
    expect(parseNumber("1 234,50 MAD")).toBe(1234.5);
    expect(parseNumber("12 %", { style: "percent" })).toBe(0.12);
    expect(parseNumber("")).toBeNull();
    expect(Number.isNaN(parseNumber("abc"))).toBe(true);
  });
});

describe("NumberInput", () => {
  it("spinbutton formaté en fr-FR avec bornes", () => {
    render(<NumberInput aria-label="Quantité" defaultValue={1234.5} min={0} max={10000} />);
    const input = screen.getByRole("spinbutton", { name: "Quantité" });
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(norm((input as HTMLInputElement).value)).toBe("1 234,5");
    expect(input).toHaveAttribute("aria-valuenow", "1234.5");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "10000");
  });

  it("clavier : ↑ ↓ (pas), Pg. préc. / Pg. suiv. (pas × 10), Origine / Fin", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="Remise" defaultValue={5} min={0} max={100} step={0.5} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("spinbutton", { name: "Remise" });
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-valuenow", "5.5");
    expect(input).toHaveValue("5,5");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveAttribute("aria-valuenow", "4.5");
    await user.keyboard("{PageUp}");
    expect(input).toHaveAttribute("aria-valuenow", "9.5");
    await user.keyboard("{PageDown}{PageDown}{PageDown}");
    expect(input).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(input).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-valuenow", "0");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("saisie tolérante, bornée et reformatée à la sortie du champ", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Montant" max={5000} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Montant" });
    // Publiée pendant la frappe dès qu'elle est lisible, sans reformater le texte saisi.
    await user.type(input, "1 234,5");
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    expect((input as HTMLInputElement).value).toBe("1 234,5");
    await user.tab();
    expect(norm((input as HTMLInputElement).value)).toBe("1 234,5");
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);

    // Hors bornes pendant la frappe : rien n'est publié ; bornée à la validation.
    await user.clear(input);
    onValueChange.mockClear();
    await user.type(input, "9999");
    expect(onValueChange.mock.calls.flat()).not.toContain(9999);
    await user.keyboard("{Enter}");
    expect(norm((input as HTMLInputElement).value)).toBe("5 000");
    expect(onValueChange).toHaveBeenLastCalledWith(5000);

    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("saisie illisible : revient à la dernière valeur", async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Poids" defaultValue={12} />);
    const input = screen.getByRole("spinbutton", { name: "Poids" });
    await user.clear(input);
    await user.type(input, "abc");
    await user.tab();
    expect(input).toHaveValue("12");
  });

  it("boutons − / + : nommés, bornés, libellés surchargeables", async () => {
    const user = userEvent.setup();
    render(
      <NumberInput aria-label="Places" defaultValue={1} min={0} max={2} decrementLabel="Moins" incrementLabel="Plus" />,
    );
    const input = screen.getByRole("spinbutton", { name: "Places" });
    const plus = screen.getByRole("button", { name: "Plus" });
    const moins = screen.getByRole("button", { name: "Moins" });
    expect(plus).toHaveAttribute("tabindex", "-1");
    await user.click(plus);
    expect(input).toHaveAttribute("aria-valuenow", "2");
    expect(plus).toBeDisabled();
    await user.click(moins);
    await user.click(moins);
    expect(input).toHaveAttribute("aria-valuenow", "0");
    expect(moins).toBeDisabled();
  });

  it("contrôlé, avec devise et unité", async () => {
    function Demo() {
      const [v, setV] = React.useState<number | null>(10);
      return (
        <>
          <NumberInput aria-label="Prix" value={v} onValueChange={setV} formatOptions={{ minimumFractionDigits: 2 }} unit="MAD" />
          <output>{String(v)}</output>
        </>
      );
    }
    render(<Demo />);
    const input = screen.getByRole("spinbutton", { name: "Prix" });
    expect(input).toHaveValue("10,00");
    expect(input).toHaveAttribute("aria-valuetext", "10,00 MAD");
    await userEvent.click(screen.getByRole("button", { name: "Augmenter" }));
    expect(screen.getByRole("status")).toHaveTextContent("11");
    expect(input).toHaveValue("11,00");
  });

  it("formatOptions devise : style currency", () => {
    render(<NumberInput aria-label="Total" defaultValue={1500} formatOptions={{ style: "currency", currency: "EUR" }} />);
    expect(norm((screen.getByRole("spinbutton") as HTMLInputElement).value)).toBe("1 500,00 €");
  });

  it("dans un Field : libellé, aide, erreur, désactivé", () => {
    render(
      <Field label="Quantité" hint="Entre 1 et 99" error="Stock insuffisant" disabled>
        <NumberInput defaultValue={3} />
      </Field>,
    );
    const input = screen.getByRole("spinbutton", { name: "Quantité" });
    expect(input).toHaveAccessibleDescription("Stock insuffisant");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: "Augmenter" })).toBeDisabled();
    expect(input.closest(".ui-number-input")).toHaveAttribute("data-invalid");
  });

  it("name : soumet la valeur brute", () => {
    const { container } = render(<NumberInput aria-label="Prix" name="prix" defaultValue={1234.5} />);
    expect(container.querySelector('input[type="hidden"][name="prix"]')).toHaveValue("1234.5");
    expect(screen.getByRole("spinbutton")).not.toHaveAttribute("name");
  });

  it("transmet la ref à l'input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<NumberInput ref={ref} aria-label="Ref" density="sm" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.closest(".ui-number-input")).toHaveAttribute("data-density", "sm");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <NumberInput aria-label="Quantité" defaultValue={2} min={0} max={10} />
        <Field label="Prix" hint="Hors taxes">
          <NumberInput defaultValue={1200} unit="MAD" />
        </Field>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
