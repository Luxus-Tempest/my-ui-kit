import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("une pastille nommée « Valeur » par défaut, bornes exposées", () => {
    render(<Slider defaultValue={[40]} />);
    const thumb = screen.getByRole("slider", { name: "Valeur" });
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "100");
    expect(thumb).toHaveClass("ui-slider__thumb");
  });

  it("clavier : flèches (pas), Pg. suiv. / Pg. préc. (pas × 10), Origine / Fin", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[50]} step={1} aria-label="Volume" onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    await user.tab();
    expect(thumb).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
    await user.keyboard("{PageUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "59");
    await user.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    expect(onValueChange).toHaveBeenLastCalledWith([100]);
  });

  it("plage : deux pastilles « Minimum » / « Maximum », libellés surchargeables", async () => {
    const { rerender } = render(<Slider defaultValue={[20, 80]} />);
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuenow", "20");
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "80");
    rerender(<Slider key="b" defaultValue={[20, 80]} thumbLabels={["Prix plancher", "Prix plafond"]} />);
    expect(screen.getByRole("slider", { name: "Prix plancher" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Prix plafond" })).toBeInTheDocument();
  });

  it("contrôlé", async () => {
    function Demo() {
      const [v, setV] = React.useState([10]);
      return <Slider value={v} onValueChange={setV} step={5} aria-label="Remise" />;
    }
    render(<Demo />);
    const thumb = screen.getByRole("slider", { name: "Remise" });
    thumb.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "15");
  });

  it("dans un Field : libellé, aide, erreur et désactivé repris par les pastilles", () => {
    render(
      <Field label="Prix" hint="En dirhams" error="Plage trop large">
        <Slider defaultValue={[100, 900]} max={1000} />
      </Field>,
    );
    const min = screen.getByRole("slider", { name: "Prix Minimum" });
    const max = screen.getByRole("slider", { name: "Prix Maximum" });
    expect(min).toHaveAccessibleDescription("Plage trop large");
    expect(min).toHaveAttribute("aria-invalid", "true");
    expect(max).toHaveAttribute("aria-invalid", "true");
    expect(min.closest(".ui-slider")).toHaveAttribute("data-invalid");
  });

  it("dans un Field, une seule pastille prend le nom du champ", () => {
    render(
      <Field label="Luminosité" disabled>
        <Slider defaultValue={[30]} />
      </Field>,
    );
    const thumb = screen.getByRole("slider", { name: "Luminosité" });
    expect(thumb).not.toHaveAttribute("tabindex");
    expect(thumb.closest(".ui-slider")).toHaveAttribute("data-disabled");
  });

  it("graduations sous la piste, formatées en fr-FR", () => {
    const { container } = render(<Slider aria-label="Montant" defaultValue={[0]} max={2000} marks={[0, 1000, 2000]} />);
    const marks = container.querySelectorAll(".ui-slider__mark");
    expect(marks).toHaveLength(3);
    expect(marks[1]?.textContent).toMatch(/^1\s000$/);
    expect(container.querySelector(".ui-slider__marks")).toHaveAttribute("aria-hidden", "true");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Slider aria-label="Volume" defaultValue={[50]} marks={[0, 50, 100]} />
        <Field label="Prix" hint="En dirhams">
          <Slider defaultValue={[20, 80]} />
        </Field>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
