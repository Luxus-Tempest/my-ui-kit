import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { Rating } from "./Rating";

const stars = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>(".ui-rating__star"));
const fills = (container: HTMLElement) => stars(container).map((s) => s.dataset.fill);

describe("Rating", () => {
  it("groupe de boutons radio nommé, une option par étoile", () => {
    const { container } = render(<Rating defaultValue={3} />);
    const group = screen.getByRole("radiogroup", { name: "Note" });
    expect(group).toHaveAttribute("data-size", "default");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAccessibleName("1 étoile sur 5");
    expect(radios[2]).toHaveAccessibleName("3 étoiles sur 5");
    expect(radios[2]).toBeChecked();
    expect(fills(container)).toEqual(["full", "full", "full", "empty", "empty"]);
  });

  it("au clic : note, puis un second clic l'efface (sauf allowClear={false})", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Rating onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "4 étoiles sur 5" }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole("radio", { name: "4 étoiles sur 5" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "4 étoiles sur 5" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("radio", { name: "4 étoiles sur 5" })).not.toBeChecked();

    onValueChange.mockClear();
    rerender(<Rating onValueChange={onValueChange} allowClear={false} defaultValue={2} key="sans-effacement" />);
    await user.click(screen.getByRole("radio", { name: "2 étoiles sur 5" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "2 étoiles sur 5" })).toBeChecked();
  });

  it("au clavier : flèches, Origine / Fin, effacement ; une seule tabulation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Rating defaultValue={3} onValueChange={onValueChange} />
        <button type="button">Après</button>
      </>,
    );
    await user.tab();
    const radio = (n: number) => screen.getByRole("radio", { name: new RegExp(`^${n} étoiles? sur 5$`) });
    expect(radio(3)).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(radio(4)).toBeChecked();
    expect(radio(4)).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowRight}");
    expect(radio(5)).toBeChecked();
    expect(radio(5)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(radio(1)).toBeChecked();
    await user.keyboard("{End}");
    expect(radio(5)).toBeChecked();
    await user.keyboard("{ArrowDown}{ArrowLeft}");
    expect(radio(3)).toBeChecked();
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([4, 5, 1, 5, 4, 3]);

    await user.keyboard("{Delete}");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    await user.keyboard("{ArrowRight}");
    expect(radio(1)).toBeChecked();
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith(null);

    await user.tab();
    expect(screen.getByRole("button", { name: "Après" })).toHaveFocus();
  });

  it("Espace sur la note choisie ne l'efface pas", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={2} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "2 étoiles sur 5" })).toBeChecked();
  });

  it("demi-étoiles : deux options par étoile, libellés décimaux", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Rating precision={0.5} defaultValue={3} onValueChange={onValueChange} />);
    expect(screen.getAllByRole("radio")).toHaveLength(10);
    expect(screen.getAllByRole("radio")[0]).toHaveAccessibleName("0,5 étoile sur 5");
    expect(screen.getAllByRole("radio")[2]).toHaveAccessibleName("1,5 étoile sur 5");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(3.5);
    expect(screen.getByRole("radio", { name: "3,5 étoiles sur 5" })).toBeChecked();
    expect(fills(container)).toEqual(["full", "full", "full", "partial", "empty"]);
    expect(stars(container)[3].style.getPropertyValue("--_clip")).toBe("50%");
  });

  it("aperçu au survol, sans changer la note", async () => {
    const user = userEvent.setup();
    const onHoverChange = vi.fn();
    const onValueChange = vi.fn();
    const { container } = render(<Rating defaultValue={1} onHoverChange={onHoverChange} onValueChange={onValueChange} />);
    await user.hover(screen.getByRole("radio", { name: "4 étoiles sur 5" }));
    expect(onHoverChange).toHaveBeenLastCalledWith(4);
    expect(fills(container)).toEqual(["full", "full", "full", "full", "empty"]);
    expect(stars(container)[3]).toHaveAttribute("data-hover");
    await user.unhover(screen.getByRole("radiogroup"));
    expect(onHoverChange).toHaveBeenLastCalledWith(null);
    expect(fills(container)).toEqual(["full", "empty", "empty", "empty", "empty"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("max et getLabelText personnalisés", () => {
    render(<Rating max={10} getLabelText={(v, max) => `${v} / ${max}`} aria-label="Satisfaction" />);
    expect(screen.getByRole("radiogroup", { name: "Satisfaction" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(10);
    expect(screen.getAllByRole("radio")[6]).toHaveAccessibleName("7 / 10");
  });

  it("lecture seule : une image nommée par la note, fraction exacte", () => {
    const { container } = render(<Rating readOnly value={4.3} />);
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("img", { name: "4,3 étoiles sur 5" })).toHaveAttribute("data-readonly");
    expect(fills(container)).toEqual(["full", "full", "full", "full", "partial"]);
    expect(stars(container)[4].style.getPropertyValue("--_clip")).toBe("70%");
  });

  it("lecture seule dans un Field : libellé puis note", () => {
    render(
      <Field label="Note moyenne">
        <Rating readOnly value={3.5} />
      </Field>,
    );
    expect(screen.getByRole("img", { name: "Note moyenne 3,5 étoiles sur 5" })).toBeInTheDocument();
  });

  it("dans un Field : libellé, erreur, obligatoire ; un clic sur le libellé donne le focus", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Qualité du service" error="Donnez une note." required>
        <Rating defaultValue={2} />
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Qualité du service" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAccessibleDescription("Donnez une note.");
    await user.click(screen.getByText("Qualité du service"));
    expect(screen.getByRole("radio", { name: "2 étoiles sur 5" })).toHaveFocus();
  });

  it("désactivé : aucune option utilisable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Field label="Note" disabled>
        <Rating onValueChange={onValueChange} />
      </Field>,
    );
    expect(screen.getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true);
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("dans un formulaire : la note est envoyée sous son nom", async () => {
    const user = userEvent.setup();
    let data: FormData | undefined;
    render(
      <form
        aria-label="Avis"
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Rating name="note" />
        <button type="submit">Envoyer</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "4 étoiles sur 5" }));
    await user.click(screen.getByRole("button", { name: "Envoyer" }));
    expect(data?.get("note")).toBe("4");
  });

  it("contrôlé", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState<number | null>(2);
      return (
        <>
          <Rating value={value} onValueChange={setValue} />
          <output>{value ?? "aucune"}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "5 étoiles sur 5" }));
    expect(screen.getByRole("status")).toHaveTextContent("5");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <div>
        <Field label="Qualité" hint="De 1 à 5">
          <Rating defaultValue={3} precision={0.5} />
        </Field>
        <Rating readOnly value={4.3} size="sm" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
