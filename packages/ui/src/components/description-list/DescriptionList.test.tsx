import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "./DescriptionList";

function Details(props: { layout?: "horizontal" | "vertical" | "grid"; variant?: "plain" | "inset"; onCopied?: (v: string) => void }) {
  return (
    <DescriptionList aria-label="Détails du fichier" {...props}>
      <DescriptionItem>
        <DescriptionTerm>Type</DescriptionTerm>
        <DescriptionDetails>Feuille de calcul</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Identifiant</DescriptionTerm>
        <DescriptionDetails copyable onCopied={props.onCopied}>
          1aB9-xK42
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem span="full">
        <DescriptionTerm>Lien</DescriptionTerm>
        <DescriptionDetails copyable copyValue="https://drive.exemple.ma/f/1aB9-xK42">
          drive.exemple.ma/f/1aB9…
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

describe("DescriptionList", () => {
  it("sémantique native dl / dt / dd et attributs de mise en page", () => {
    const { container } = render(<Details layout="grid" variant="inset" />);
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveAttribute("data-layout", "grid");
    expect(dl).toHaveAttribute("data-variant", "inset");
    expect(dl.querySelectorAll(":scope > div > dt")).toHaveLength(3);
    expect(dl.querySelectorAll(":scope > div > dd")).toHaveLength(3);
    expect(screen.getByText("Lien").closest("div")).toHaveStyle({ gridColumn: "1 / -1" });
  });

  it("clavier : le bouton se nomme avec le libellé, Entrée copie, retour « Copié »", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onCopied = vi.fn();
    render(<Details onCopied={onCopied} />);

    await user.tab();
    const button = screen.getByRole("button", { name: "Copier Identifiant" });
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(await navigator.clipboard.readText()).toBe("1aB9-xK42");
    expect(onCopied).toHaveBeenCalledWith("1aB9-xK42");
    expect(button).toHaveAttribute("data-state", "copied");
    expect(button).toHaveAccessibleName("Copié Identifiant");
    expect(within(button.closest("dd")!).getByRole("status")).toHaveTextContent("Copié");

    // Le retour s'efface au bout de deux secondes.
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(button).toHaveAttribute("data-state", "idle");
    vi.useRealTimers();

    // `copyValue` : le texte copié peut différer du texte affiché.
    const realUser = userEvent.setup();
    await realUser.tab();
    expect(screen.getByRole("button", { name: "Copier Lien" })).toHaveFocus();
    await realUser.keyboard(" ");
    expect(await navigator.clipboard.readText()).toBe("https://drive.exemple.ma/f/1aB9-xK42");
  });

  it("sans violation d'accessibilité, dans les trois mises en page", async () => {
    const { container } = render(
      <>
        <Details />
        <Details layout="vertical" variant="inset" />
        <Details layout="grid" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
