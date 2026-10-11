import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

function Demo({ arrow }: { arrow?: boolean }) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger href="#ines">@ines</HoverCardTrigger>
      <HoverCardContent arrow={arrow}>
        <p>Inès Benali, responsable financière</p>
      </HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("s'ouvre au survol du déclencheur et se ferme quand le pointeur s'en va", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.hover(screen.getByRole("link", { name: "@ines" }));
    const card = await screen.findByText("Inès Benali, responsable financière");
    expect(card.closest("[data-slot=hover-card-content]")).toHaveClass("ui-popup", "ui-hover-card");
    await user.unhover(screen.getByRole("link", { name: "@ines" }));
    await waitFor(() => expect(screen.queryByText("Inès Benali, responsable financière")).toBeNull());
  });

  it("s'ouvre au focus clavier et se ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(screen.getByRole("link", { name: "@ines" })).toHaveFocus();
    expect(await screen.findByText("Inès Benali, responsable financière")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Inès Benali, responsable financière")).toBeNull());
    // Le focus reste sur le déclencheur : la carte ne le capture jamais.
    expect(screen.getByRole("link", { name: "@ines" })).toHaveFocus();
  });

  it("applique les délais par défaut (500 ms) avant d'ouvrir", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <HoverCard>
        <HoverCardTrigger href="#ines">@ines</HoverCardTrigger>
        <HoverCardContent>Aperçu</HoverCardContent>
      </HoverCard>,
    );
    await user.hover(screen.getByRole("link", { name: "@ines" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText("Aperçu")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await waitFor(() => expect(screen.getByText("Aperçu")).toBeInTheDocument());
    vi.useRealTimers();
  });

  it("affiche la flèche sur demande", async () => {
    const user = userEvent.setup();
    render(<Demo arrow />);
    await user.hover(screen.getByRole("link", { name: "@ines" }));
    const card = await screen.findByText("Inès Benali, responsable financière");
    expect(card.closest("[data-slot=hover-card-content]")?.querySelector(".ui-hover-card__arrow")).not.toBeNull();
  });

  it("sans violation d'accessibilité, ouverte", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo arrow />);
    await user.hover(screen.getByRole("link", { name: "@ines" }));
    const card = await screen.findByText("Inès Benali, responsable financière");
    expect(await axe(container)).toHaveNoViolations();
    expect(await axe(card.closest("[data-slot=hover-card-content]") as HTMLElement)).toHaveNoViolations();
  });
});
