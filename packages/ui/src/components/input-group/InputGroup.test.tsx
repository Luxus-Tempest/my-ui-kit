import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "./InputGroup";

describe("InputGroup", () => {
  it("un clic sur le complément place le curseur dans le champ", async () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Site" />
        <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
      </InputGroup>,
    );
    await userEvent.setup().click(screen.getByText("https://"));
    expect(screen.getByRole("textbox", { name: "Site" })).toHaveFocus();
  });

  it("le bouton intégré reste un bouton, sans voler le focus du champ au clic du complément", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Montant" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Convertir</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Convertir" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Convertir" })).toHaveClass("ui-button--ghost", "ui-button--size-sm");
  });

  it("dans un Field, le champ reçoit libellé et erreur", () => {
    render(
      <Field label="Montant HT" error="Montant requis">
        <InputGroup>
          <InputGroupInput />
          <InputGroupAddon align="inline-end"><InputGroupText>MAD</InputGroupText></InputGroupAddon>
        </InputGroup>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Montant HT" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/Montant requis/);
    expect(input).toHaveAttribute("data-slot", "input-group-control");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <InputGroup>
          <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
          <InputGroupInput aria-label="Adresse" />
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea aria-label="Message" />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 / 280</InputGroupText>
            <InputGroupButton variant="default">Envoyer</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
