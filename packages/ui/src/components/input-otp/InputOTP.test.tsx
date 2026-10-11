import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type InputOTPProps,
} from "./InputOTP";

function Code(props: Partial<InputOTPProps>) {
  return (
    <InputOTP maxLength={6} {...(props as object)}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

const slots = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-slot='input-otp-slot']"));

// input-otp pose `pointer-events: none` sur le conteneur : on donne le focus au champ directement.
const setup = () => userEvent.setup({ pointerEventsCheck: 0 });

// input-otp relit la sélection par minuteries (0, 10 et 50 ms) : on les laisse s'écouler dans act().
const settle = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 80)));
const focus = async (element: HTMLElement) => {
  act(() => element.focus());
  await settle();
};

describe("InputOTP", () => {
  // input-otp sonde la position des badges de gestionnaires de mots de passe ; jsdom n'a pas cette API.
  beforeAll(() => {
    document.elementFromPoint ??= () => null;
  });
  afterEach(settle);

  it("hors Field : « Code de vérification », chiffres seulement, code à usage unique", () => {
    render(<Code />);
    const input = screen.getByRole("textbox", { name: "Code de vérification" });
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "6");
    expect(input).toHaveAttribute("pattern", "^\\d+$");
  });

  it("au clavier : remplit les cases une à une, ignore les lettres, Retour arrière efface", async () => {
    const user = setup();
    const onValueChange = vi.fn();
    const { container } = render(<Code onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    await focus(input);
    expect(slots(container)[0]).toHaveAttribute("data-active");
    expect(slots(container)[0].querySelector(".ui-input-otp__caret")).not.toBeNull();

    await user.keyboard("12a3");
    await settle();
    expect(input).toHaveValue("123");
    expect(onValueChange).toHaveBeenLastCalledWith("123");
    expect(slots(container).map((s) => s.textContent)).toEqual(["1", "2", "3", "", "", ""]);
    expect(slots(container)[2]).toHaveAttribute("data-filled");
    expect(slots(container)[3]).toHaveAttribute("data-active");

    await user.keyboard("{Backspace}");
    await settle();
    expect(input).toHaveValue("12");
  });

  it("colle un code entier et appelle onComplete", async () => {
    const user = setup();
    const onComplete = vi.fn();
    const { container } = render(<Code onComplete={onComplete} />);
    await focus(screen.getByRole("textbox"));
    await user.paste("482913");
    await settle();
    expect(screen.getByRole("textbox")).toHaveValue("482913");
    expect(slots(container).map((s) => s.textContent).join("")).toBe("482913");
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("482913"));
  });

  it("un collage hors motif est refusé", async () => {
    const user = setup();
    render(<Code />);
    await focus(screen.getByRole("textbox"));
    await user.paste("AB-12");
    await settle();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("motif alphanumérique : clavier complet", async () => {
    const user = setup();
    render(<Code pattern={REGEXP_ONLY_DIGITS_AND_CHARS} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputmode", "text");
    await focus(input);
    await user.keyboard("a1B2");
    await settle();
    expect(input).toHaveValue("a1B2");
  });

  it("contrôlé", async () => {
    const user = setup();
    function Controlled() {
      const [value, setValue] = React.useState("12");
      return (
        <>
          <Code value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("12");
    await focus(input);
    await user.keyboard("{End}34");
    await settle();
    expect(screen.getByRole("status")).toHaveTextContent("1234");
  });

  it("dans un Field : libellé, aide et erreur, cases marquées invalides", () => {
    const { container } = render(
      <Field label="Code reçu par SMS" error="Code incorrect, réessayez." required>
        <Code />
      </Field>,
    );
    const input = screen.getByLabelText(/Code reçu par SMS/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Code incorrect, réessayez.");
    expect(slots(container).every((s) => s.hasAttribute("data-invalid"))).toBe(true);
  });

  it("désactivé par le Field", () => {
    const { container } = render(
      <Field label="Code" disabled>
        <Code />
      </Field>,
    );
    expect(screen.getByLabelText("Code")).toBeDisabled();
    expect(slots(container)[0]).toHaveAttribute("data-disabled");
  });

  it("les cases et le séparateur sont masqués aux lecteurs d'écran", () => {
    const { container } = render(<Code placeholder="000000" />);
    expect(slots(container)[0]).toHaveAttribute("aria-hidden", "true");
    expect(slots(container)[0]).toHaveTextContent("0");
    expect(container.querySelector("[data-slot='input-otp-separator']")).toHaveAttribute("aria-hidden", "true");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Field label="Code de connexion" hint="6 chiffres, valable 10 minutes">
        <Code defaultValue="12" />
      </Field>,
    );
    await settle();
    let results: Awaited<ReturnType<typeof axe>> | undefined;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();
  });
});
