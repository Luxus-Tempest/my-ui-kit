import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineGroup,
  TimelineIndicator,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "./Timeline";

const Icon = () => <svg viewBox="0 0 16 16" />;

function Feed({ align }: { align?: "left" | "alternate" }) {
  return (
    <Timeline align={align} aria-label="Activité">
      <TimelineGroup label="Aujourd'hui">
        <TimelineItem>
          <TimelineIndicator tone="pri">
            <Icon />
          </TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>
              <strong>Inès</strong> a modifié <a href="#budget">Budget 2027</a>
            </TimelineTitle>
            <TimelineDescription>3 cellules mises à jour dans l'onglet « Charges ».</TimelineDescription>
            <TimelineTime dateTime="2026-10-11T09:12">09:12</TimelineTime>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineIndicator tone="err" label="Échec" />
          <TimelineContent>
            <TimelineTitle>
              La synchronisation de <a href="#photos">Photos</a> a échoué
            </TimelineTitle>
            <TimelineTime dateTime={new Date(2026, 9, 11, 8, 5)} />
          </TimelineContent>
        </TimelineItem>
      </TimelineGroup>
      <TimelineGroup label="Hier">
        <TimelineItem>
          <TimelineIndicator />
          <TimelineContent>
            <TimelineTitle>Karim a partagé un dossier</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </TimelineGroup>
    </Timeline>
  );
}

describe("Timeline", () => {
  it("liste ordonnée, groupes nommés par leur intitulé de date", () => {
    render(<Feed />);
    const timeline = screen.getByRole("list", { name: "Activité" });
    expect(timeline.tagName).toBe("OL");
    expect(timeline).toHaveAttribute("data-align", "left");

    expect(screen.getByRole("heading", { level: 3, name: "Aujourd'hui" })).toBeInTheDocument();
    const today = screen.getByRole("list", { name: "Aujourd'hui" });
    expect(within(today).getAllByRole("listitem")).toHaveLength(2);
    expect(within(screen.getByRole("list", { name: "Hier" })).getAllByRole("listitem")).toHaveLength(1);
  });

  it("horodatage : <time datetime>, texte fourni ou formaté en fr-FR", () => {
    const { container } = render(<Feed />);
    const times = container.querySelectorAll("time");
    expect(times[0]).toHaveAttribute("datetime", "2026-10-11T09:12");
    expect(times[0]).toHaveTextContent("09:12");
    // Sans enfant : heure et minutes formatées, date machine en ISO.
    expect(times[1]).toHaveTextContent("08:05");
    expect(times[1]!.getAttribute("datetime")).toMatch(/^2026-10-1\dT\d\d:05:00\.000Z$/);
  });

  it("indicateur : décoratif par défaut, annoncé avec `label`, point ou pastille", () => {
    const { container } = render(<Feed />);
    const indicators = container.querySelectorAll(".ui-timeline__indicator");
    expect(indicators[0]).toHaveAttribute("aria-hidden", "true");
    expect(indicators[0]).toHaveAttribute("data-shape", "icon");
    expect(indicators[0]).toHaveAttribute("data-tone", "pri");
    expect(screen.getByRole("img", { name: "Échec" })).toHaveAttribute("data-tone", "err");
    expect(indicators[2]).toHaveAttribute("data-shape", "dot");
    expect(indicators[2]).toHaveAttribute("data-tone", "neu");
  });

  it("clavier : seuls les liens du contenu reçoivent le focus, dans l'ordre de lecture", async () => {
    const user = userEvent.setup();
    render(<Feed align="alternate" />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Budget 2027" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Photos" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Feed />
        <Timeline align="alternate" aria-label="Jalons">
          <TimelineItem>
            <TimelineIndicator tone="ok" variant="solid" label="Validé">
              <Icon />
            </TimelineIndicator>
            <TimelineContent>
              <TimelineTitle>Budget validé</TimelineTitle>
              <TimelineTime dateTime="2026-10-03">3 oct.</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
