import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  Step,
  StepContent,
  StepDescription,
  StepIndicator,
  StepTitle,
  Stepper,
  type StepperProps,
  useStepper,
} from "./Stepper";

const STEPS = ["Compte", "Profil", "Paiement", "Confirmation"];

function Demo(props: StepperProps & { errorAt?: number; disabledAt?: number }) {
  const { errorAt, disabledAt, ...stepperProps } = props;
  return (
    <Stepper {...stepperProps}>
      {STEPS.map((title, index) => (
        <Step key={title} error={index === errorAt} disabled={index === disabledAt}>
          <StepTitle>{title}</StepTitle>
          {index === 1 && <StepDescription>Facultatif</StepDescription>}
          <StepContent>Contenu {title}</StepContent>
        </Step>
      ))}
    </Stepper>
  );
}

describe("Stepper", () => {
  it("liste ordonnée : statuts dérivés de activeStep, aria-current sur l'étape en cours", () => {
    render(<Demo activeStep={2} />);
    const list = screen.getByRole("list", { name: "Étapes" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("data-status"))).toEqual([
      "complete",
      "complete",
      "current",
      "upcoming",
    ]);
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    // Les étapes terminées sont annoncées, le numéro visible est remplacé par la coche.
    expect(items[0]).toHaveTextContent("Étape 1 sur 4, terminée");
    expect(within(items[3]).getByText("4")).toBeInTheDocument();
  });

  it("connecteur ajouté d'office, sauf après la dernière étape", () => {
    const { container } = render(<Demo activeStep={0} />);
    expect(container.querySelectorAll(".ui-step__separator")).toHaveLength(3);
    const last = container.querySelectorAll(".ui-step")[3];
    expect(last.querySelector(".ui-step__separator")).toBeNull();
  });

  it("une étape en erreur est marquée et annoncée", () => {
    render(<Demo activeStep={2} errorAt={1} />);
    const step = screen.getAllByRole("listitem")[1];
    expect(step).toHaveAttribute("data-error");
    expect(step).toHaveTextContent("Étape 2 sur 4, terminée, en erreur");
  });

  it("libellés lus par les lecteurs d'écran surchargeables", () => {
    render(
      <Stepper activeStep={1} aria-label="Commande" labels={{ step: (p, n) => `Step ${p} of ${n}`, complete: "done" }}>
        <Step><StepTitle>A</StepTitle></Step>
        <Step><StepTitle>B</StepTitle></Step>
      </Stepper>,
    );
    expect(screen.getByRole("list", { name: "Commande" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Step 1 of 2, done");
  });

  it("indicateur personnalisé : l'icône remplace le numéro", () => {
    render(
      <Stepper activeStep={0}>
        <Step>
          <StepIndicator data-testid="indicateur"><svg data-testid="icone" /></StepIndicator>
          <StepTitle>Compte</StepTitle>
        </Step>
      </Stepper>,
    );
    expect(screen.getByTestId("icone")).toBeInTheDocument();
    expect(screen.getByTestId("indicateur")).not.toHaveTextContent(/^1/);
  });

  it("vertical : seul le contenu de l'étape active est rendu", () => {
    render(<Demo activeStep={1} orientation="vertical" />);
    expect(screen.getByRole("list")).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getByText("Contenu Profil")).toBeInTheDocument();
    expect(screen.queryByText("Contenu Compte")).not.toBeInTheDocument();
  });

  it("horizontal : le contenu n'est pas rendu dans la liste", () => {
    render(<Demo activeStep={1} />);
    expect(screen.queryByText("Contenu Profil")).not.toBeInTheDocument();
  });

  it("linéaire : aucune étape n'est un bouton", () => {
    render(<Demo activeStep={1} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("non linéaire : étapes en boutons, clavier (Tab, Entrée, Espace)", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<Demo activeStep={0} nonLinear onStepChange={onStepChange} disabledAt={3} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveAttribute("aria-current", "step");
    expect(buttons[0]).toHaveAccessibleName(/Étape 1 sur 4 : Compte/);
    expect(buttons[3]).toBeDisabled();

    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.tab();
    expect(buttons[1]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    await user.tab();
    await user.keyboard(" ");
    expect(onStepChange).toHaveBeenLastCalledWith(2);
    // L'étape désactivée est sautée.
    await user.tab();
    expect(buttons[3]).not.toHaveFocus();
  });

  it("completed force l'état terminé hors de l'ordre", () => {
    render(
      <Stepper activeStep={0} nonLinear>
        <Step><StepTitle>A</StepTitle></Step>
        <Step><StepTitle>B</StepTitle></Step>
        <Step completed><StepTitle>C</StepTitle></Step>
      </Stepper>,
    );
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("data-status", "complete");
  });

  it("sans violation d'accessibilité (linéaire, non linéaire, vertical)", async () => {
    const { container, rerender } = render(<Demo activeStep={1} errorAt={2} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Demo activeStep={1} nonLinear onStepChange={() => {}} disabledAt={3} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Demo activeStep={1} orientation="vertical" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("useStepper", () => {
  it("next, prev, goTo, reset et bornes", () => {
    const { result } = renderHook(() => useStepper({ count: 3 }));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirst).toBe(true);

    act(() => result.current.prev());
    expect(result.current.activeStep).toBe(0);

    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.activeStep).toBe(2);
    expect(result.current.isLast).toBe(true);
    expect(result.current.isComplete).toBe(false);

    // Depuis la dernière : « tout terminé », pas au-delà.
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.activeStep).toBe(3);
    expect(result.current.isComplete).toBe(true);

    act(() => result.current.goTo(-4));
    expect(result.current.activeStep).toBe(0);
    act(() => result.current.goTo(1));
    expect(result.current.activeStep).toBe(1);
    act(() => result.current.reset());
    expect(result.current.activeStep).toBe(0);
  });

  it("pilote un Stepper avec des boutons Précédent / Suivant", async () => {
    const user = userEvent.setup();
    function Wizard() {
      const stepper = useStepper({ count: 3, initialStep: 1 });
      return (
        <>
          <Stepper activeStep={stepper.activeStep}>
            <Step><StepTitle>A</StepTitle></Step>
            <Step><StepTitle>B</StepTitle></Step>
            <Step><StepTitle>C</StepTitle></Step>
          </Stepper>
          <button type="button" onClick={stepper.prev} disabled={stepper.isFirst}>Précédent</button>
          <button type="button" onClick={stepper.next}>{stepper.isLast ? "Terminer" : "Suivant"}</button>
        </>
      );
    }
    render(<Wizard />);
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Terminer" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Terminer" }));
    expect(screen.getAllByRole("listitem").every((item) => item.dataset.status === "complete")).toBe(true);
  });
});
