import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "./Field";
import { Input } from "../input/Input";
import { Checkbox } from "../checkbox/Checkbox";
import { RadioGroup, RadioGroupItem } from "../radio/RadioGroup";
import { Slider } from "../slider/Slider";

describe("Field", () => {
  it("relie libellé, aide et obligatoire au contrôle", () => {
    render(<Field label="ICE" hint="15 chiffres" required><Input /></Field>);
    const input = screen.getByRole("textbox", { name: "ICE" });
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("15 chiffres");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("l'erreur remplace l'aide et invalide le champ", () => {
    render(<Field label="ICE" hint="15 chiffres" error="L'ICE compte 15 chiffres."><Input /></Field>);
    const input = screen.getByRole("textbox", { name: "ICE" });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("L'ICE compte 15 chiffres.");
    expect(screen.queryByText("15 chiffres")).not.toBeInTheDocument();
  });

  it("les props explicites l'emportent sur le Field", () => {
    render(<Field label="Code" disabled><Input id="mon-id" disabled={false} /></Field>);
    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toHaveAttribute("id", "mon-id");
    expect(input).toBeEnabled();
  });

  it("horizontal : la case se coche en cliquant son libellé", async () => {
    render(<Field label="Assujetti à la TVA" orientation="horizontal"><Checkbox /></Field>);
    await userEvent.click(screen.getByText("Assujetti à la TVA"));
    expect(screen.getByRole("checkbox", { name: "Assujetti à la TVA" })).toBeChecked();
  });

  it("un groupe radio est nommé par le libellé du Field", () => {
    render(
      <Field label="Mode de paiement">
        <RadioGroup defaultValue="virement">
          <RadioGroupItem value="virement">Virement</RadioGroupItem>
          <RadioGroupItem value="cheque">Chèque</RadioGroupItem>
        </RadioGroup>
      </Field>,
    );
    expect(screen.getByRole("radiogroup", { name: "Mode de paiement" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Virement" })).toBeChecked();
  });

  it("un clic sur le libellé donne le focus à un contrôle non étiquetable", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field label="Mode de paiement">
          <RadioGroup defaultValue="cheque">
            <RadioGroupItem value="virement">Virement</RadioGroupItem>
            <RadioGroupItem value="cheque">Chèque</RadioGroupItem>
          </RadioGroup>
        </Field>
        <Field label="Remise">
          <Slider defaultValue={[10]} />
        </Field>
      </>,
    );
    await user.click(screen.getByText("Mode de paiement"));
    expect(screen.getByRole("radio", { name: "Chèque" })).toHaveFocus();
    await user.click(screen.getByText("Remise"));
    expect(screen.getByRole("slider", { name: "Remise" })).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Field label="Raison sociale" required hint="Telle qu'au registre"><Input /></Field>
        <Field label="Email" error="Adresse incomplète"><Input type="email" /></Field>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
