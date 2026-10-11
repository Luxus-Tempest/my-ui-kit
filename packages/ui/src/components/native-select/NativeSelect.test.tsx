import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./NativeSelect";

const Countries = (props: React.ComponentProps<typeof NativeSelect>) => (
  <NativeSelect {...props}>
    <NativeSelectOption value="ma">Maroc</NativeSelectOption>
    <NativeSelectOption value="fr">France</NativeSelectOption>
    <NativeSelectOption value="sn" disabled>
      Sénégal
    </NativeSelectOption>
  </NativeSelect>
);

describe("NativeSelect", () => {
  it("rend un vrai <select> au gabarit du Select", () => {
    const ref = React.createRef<HTMLSelectElement>();
    const { container } = render(<Countries aria-label="Pays" ref={ref} className="extra" containerClassName="wrap" />);
    const select = screen.getByRole("combobox", { name: "Pays" });
    expect(select.tagName).toBe("SELECT");
    expect(ref.current).toBe(select);
    expect(select).toHaveClass("ui-native-select__control", "extra");
    expect(select).toHaveAttribute("data-density", "default");
    expect(container.firstElementChild).toHaveClass("ui-native-select", "wrap");
    expect(container.querySelector(".ui-native-select__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("au clavier : Tab donne le focus, le choix déclenche onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Countries aria-label="Pays" onChange={(event) => onChange(event.target.value)} />);
    await user.tab();
    const select = screen.getByRole("combobox", { name: "Pays" });
    expect(select).toHaveFocus();
    await user.selectOptions(select, "fr");
    expect(onChange).toHaveBeenCalledWith("fr");
    expect(select).toHaveValue("fr");
    expect(screen.getByRole("option", { name: "Sénégal" })).toBeDisabled();
  });

  it("indication : option vide choisie d'office et non sélectionnable", () => {
    render(<Countries aria-label="Pays" placeholder="Choisir un pays" />);
    const select = screen.getByRole("combobox", { name: "Pays" });
    expect(select).toHaveValue("");
    const placeholder = screen.getByRole("option", { name: "Choisir un pays" });
    expect(placeholder).toBeDisabled();
    expect((placeholder as HTMLOptionElement).selected).toBe(true);
  });

  it("l'indication ne remplace pas une valeur fournie", () => {
    render(<Countries aria-label="Pays" placeholder="Choisir un pays" defaultValue="fr" />);
    expect(screen.getByRole("combobox")).toHaveValue("fr");
  });

  it("groupes d'options", () => {
    render(
      <NativeSelect aria-label="Journal" defaultValue="bq">
        <NativeSelectOptGroup label="Journaux">
          <NativeSelectOption value="ach">Achats</NativeSelectOption>
          <NativeSelectOption value="bq">Banque</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );
    expect(screen.getByRole("group", { name: "Journaux" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("bq");
  });

  it("densité sm", () => {
    const { container } = render(<Countries aria-label="Pays" density="sm" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-density", "sm");
    expect(container.firstElementChild).toHaveAttribute("data-density", "sm");
  });

  it("dans un Field : libellé, aide, erreur, obligatoire", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Pays" hint="Pays de facturation" error="Choisissez un pays." required>
        <Countries placeholder="Choisir" />
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: /Pays/ });
    expect(select).toBeRequired();
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Choisissez un pays.");
    expect(select).toBeInvalid();
    await user.click(screen.getByText("Pays"));
    expect(select).toHaveFocus();
  });

  it("désactivé par le Field", () => {
    render(
      <Field label="Pays" disabled>
        <Countries />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Pays" })).toBeDisabled();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <div>
        <Field label="Pays" hint="Pays de facturation">
          <Countries placeholder="Choisir un pays" />
        </Field>
        <Field label="Devise" error="Devise obligatoire">
          <Countries density="sm" />
        </Field>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
