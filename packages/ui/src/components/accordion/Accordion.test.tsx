import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";

function Faq(props: { variant?: "inset" | "plain"; type?: "single" | "multiple" }) {
  const items = [
    ["stockage", "Espace de stockage", "15 Go inclus avec chaque compte."],
    ["partage", "Partage", "Invitez par adresse e-mail ou par lien."],
    ["hors-ligne", "Accès hors ligne", "Les fichiers marqués restent disponibles."],
  ] as const;
  const content = items.map(([value, title, body]) => (
    <AccordionItem key={value} value={value}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>{body}</AccordionContent>
    </AccordionItem>
  ));
  return props.type === "multiple" ? (
    <Accordion type="multiple" variant={props.variant} data-testid="acc">{content}</Accordion>
  ) : (
    <Accordion type="single" collapsible variant={props.variant} data-testid="acc">{content}</Accordion>
  );
}

describe("Accordion", () => {
  it("variante inset par défaut, transmise par data-variant ; titres en h3", () => {
    render(<Faq />);
    expect(screen.getByTestId("acc")).toHaveAttribute("data-variant", "inset");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("variante plain", () => {
    render(<Faq variant="plain" />);
    expect(screen.getByTestId("acc")).toHaveAttribute("data-variant", "plain");
  });

  it("single : ouvrir un élément referme l'autre ; aria-expanded suit l'état", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const stockage = screen.getByRole("button", { name: "Espace de stockage" });
    const partage = screen.getByRole("button", { name: "Partage" });
    expect(stockage).toHaveAttribute("aria-expanded", "false");
    await user.click(stockage);
    expect(stockage).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Espace de stockage" })).toHaveTextContent("15 Go inclus");
    await user.click(partage);
    expect(stockage).toHaveAttribute("aria-expanded", "false");
    expect(partage).toHaveAttribute("aria-expanded", "true");
  });

  it("multiple : plusieurs panneaux ouverts à la fois", async () => {
    const user = userEvent.setup();
    render(<Faq type="multiple" />);
    await user.click(screen.getByRole("button", { name: "Espace de stockage" }));
    await user.click(screen.getByRole("button", { name: "Partage" }));
    expect(screen.getByRole("button", { name: "Espace de stockage" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Partage" })).toHaveAttribute("aria-expanded", "true");
  });

  it("clavier : Tab, flèches, Début / Fin, Entrée et Espace", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const [a, b, c] = screen.getAllByRole("button");
    await user.tab();
    expect(a).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(b).toHaveFocus();
    await user.keyboard("{End}");
    expect(c).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(a).toHaveFocus();
    await user.keyboard("{Home}");
    expect(a).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(a).toHaveAttribute("aria-expanded", "false");
  });

  it("niveau de titre surchargeable et élément désactivé", () => {
    render(
      <Accordion type="single">
        <AccordionItem value="a" disabled>
          <AccordionTrigger headingLevel={2}>Corbeille</AccordionTrigger>
          <AccordionContent>Vide</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Corbeille" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Corbeille" })).toBeDisabled();
  });

  it("sans violation d'accessibilité (ouvert)", async () => {
    const { container } = render(
      <Accordion type="single" defaultValue="a" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Espace de stockage</AccordionTrigger>
          <AccordionContent>15 Go inclus.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Partage</AccordionTrigger>
          <AccordionContent>Par lien.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
