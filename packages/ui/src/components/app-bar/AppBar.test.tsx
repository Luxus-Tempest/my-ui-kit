import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { AppBar, AppBarActions, AppBarLeading, AppBarTitle, type AppBarProps } from "./AppBar";

/* IntersectionObserver n'existe pas dans jsdom : on garde la main sur ses rappels. */
type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const observers: { callback: Callback; targets: Element[]; disconnected: boolean }[] = [];
class IntersectionObserverStub {
  private record: (typeof observers)[number];
  constructor(callback: Callback) {
    this.record = { callback, targets: [], disconnected: false };
    observers.push(this.record);
  }
  observe(target: Element) {
    this.record.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    this.record.disconnected = true;
  }
  takeRecords() {
    return [];
  }
}

const original = globalThis.IntersectionObserver;
beforeEach(() => {
  observers.length = 0;
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  globalThis.IntersectionObserver = original;
});

function Bar(props: AppBarProps) {
  return (
    <AppBar {...props}>
      <AppBarLeading>
        <button type="button" aria-label="Menu principal">≡</button>
      </AppBarLeading>
      <AppBarTitle>Mon Drive</AppBarTitle>
      <AppBarActions>
        <button type="button" aria-label="Aide">?</button>
        <button type="button" aria-label="Paramètres">⚙</button>
      </AppBarActions>
    </AppBar>
  );
}

const header = () => document.querySelector<HTMLElement>(".ui-app-bar")!;

describe("AppBar", () => {
  it("en-tête avec titre de niveau 1 et réglages par défaut", () => {
    render(<Bar />);
    expect(screen.getByRole("heading", { level: 1, name: "Mon Drive" })).toHaveClass("ui-app-bar__title");
    const bar = header();
    expect(bar.tagName).toBe("HEADER");
    expect(bar).toHaveAttribute("data-variant", "plain");
    expect(bar).toHaveAttribute("data-position", "sticky");
    expect(bar).toHaveAttribute("data-density", "default");
    expect(bar).toHaveAttribute("data-title-align", "start");
    expect(bar).not.toHaveAttribute("data-scrolled");
  });

  it("variantes, densité, titre centré ; titre asChild", () => {
    render(
      <AppBar variant="material" density="compact" titleAlign="center" position="static">
        <AppBarTitle asChild>
          <a href="#accueil">Nuage</a>
        </AppBarTitle>
      </AppBar>,
    );
    const bar = header();
    expect(bar).toHaveAttribute("data-variant", "material");
    expect(bar).toHaveAttribute("data-density", "compact");
    expect(bar).toHaveAttribute("data-title-align", "center");
    expect(bar).toHaveAttribute("data-position", "static");
    expect(screen.getByRole("link", { name: "Nuage" })).toHaveClass("ui-app-bar__title");
  });

  it("filet d'élévation : la sentinelle observée pilote data-scrolled", () => {
    render(<Bar variant="material" />);
    const sentinel = document.querySelector(".ui-app-bar__sentinel")!;
    expect(sentinel).toHaveAttribute("aria-hidden", "true");
    expect(observers).toHaveLength(1);
    expect(observers[0].targets).toEqual([sentinel]);

    act(() => observers[0].callback([{ isIntersecting: false, boundingClientRect: { top: -4 } as DOMRectReadOnly, rootBounds: { bottom: 800 } as DOMRectReadOnly }]));
    expect(header()).toHaveAttribute("data-scrolled", "true");
    act(() => observers[0].callback([{ isIntersecting: true, boundingClientRect: { top: 0 } as DOMRectReadOnly, rootBounds: { bottom: 800 } as DOMRectReadOnly }]));
    expect(header()).not.toHaveAttribute("data-scrolled");
    // Sentinelle sous l'écran (barre plus bas dans la page) : rien ne défile dessous.
    act(() => observers[0].callback([{ isIntersecting: false, boundingClientRect: { top: 900 } as DOMRectReadOnly, rootBounds: { bottom: 800 } as DOMRectReadOnly }]));
    expect(header()).not.toHaveAttribute("data-scrolled");
  });

  it("elevateOnScroll={false} : ni sentinelle ni observateur", () => {
    const { unmount } = render(<Bar elevateOnScroll={false} />);
    expect(document.querySelector(".ui-app-bar__sentinel")).toBeNull();
    expect(observers).toHaveLength(0);
    unmount();
  });

  it("scrollTarget : écoute le défilement du conteneur (ref ou élément)", () => {
    function WithContainer() {
      const ref = React.useRef<HTMLDivElement>(null);
      return (
        <div ref={ref} data-testid="scroller" style={{ overflow: "auto" }}>
          <Bar scrollTarget={ref} />
          <p>Contenu</p>
        </div>
      );
    }
    render(<WithContainer />);
    expect(document.querySelector(".ui-app-bar__sentinel")).toBeNull();
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTop = 24;
    fireEvent.scroll(scroller);
    expect(header()).toHaveAttribute("data-scrolled", "true");
    scroller.scrollTop = 0;
    fireEvent.scroll(scroller);
    expect(header()).not.toHaveAttribute("data-scrolled");
  });

  it("se démonte proprement (observateur déconnecté)", () => {
    const { unmount } = render(<Bar />);
    unmount();
    expect(observers[0].disconnected).toBe(true);
  });

  it("clavier : Tab va du menu aux actions, dans l'ordre", async () => {
    const user = userEvent.setup();
    render(<Bar />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Menu principal" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Aide" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Paramètres" })).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Bar variant="material" />
        <main>
          <p>Contenu</p>
        </main>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
