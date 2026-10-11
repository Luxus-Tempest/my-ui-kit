import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@radix-ui/react-direction";
import { axe } from "../../../vitest.setup";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
  type CarouselProps,
} from "./Carousel";

/*
 * jsdom ne mesure rien : Embla lit offsetLeft / offsetWidth. On simule une
 * fenêtre de 300 px et des diapositives de 300 px posées bout à bout. jsdom
 * renvoie aussi une marge calculée vide (un navigateur renvoie « 0px ») :
 * Embla en tirerait NaN et aucun point d'arrêt.
 */
const SIZE = 300;
const slot = (el: HTMLElement) => el.getAttribute("data-slot");
const position = (el: HTMLElement) => Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
const measured = (el: HTMLElement) => slot(el) === "carousel-content" || slot(el) === "carousel-item";

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeAll(() => {
  globalThis.IntersectionObserver ??= IntersectionObserverStub as unknown as typeof IntersectionObserver;
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = computedStyle(element, pseudo);
    const read = style.getPropertyValue.bind(style);
    style.getPropertyValue = (property: string) => read(property) || (property.startsWith("margin") ? "0px" : "");
    return style;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return measured(this) ? SIZE : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return measured(this) ? SIZE : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    return slot(this) === "carousel-item" ? position(this) * SIZE : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return slot(this) === "carousel-item" ? position(this) * SIZE : 0;
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

function Demo({ count = 5, dots = true, ...props }: Partial<CarouselProps> & { count?: number; dots?: boolean }) {
  return (
    <Carousel aria-label="Projets récents" {...props}>
      <CarouselContent>
        {Array.from({ length: count }, (_, i) => (
          <CarouselItem key={i}>Projet {i + 1}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      {dots && <CarouselDots />}
    </Carousel>
  );
}

const dot = (n: number) => screen.getByRole("button", { name: `Aller à la diapositive ${n}` });

describe("Carousel", () => {
  it("région nommée « carrousel », diapositives « 3 sur 5 »", () => {
    render(<Demo />);
    const region = screen.getByRole("region", { name: "Projets récents" });
    expect(region).toHaveAttribute("aria-roledescription", "carrousel");
    expect(region).toHaveAttribute("data-orientation", "horizontal");
    const slide = within(region).getByRole("group", { name: "3 sur 5" });
    expect(slide).toHaveAttribute("aria-roledescription", "diapositive");
    expect(slide).toHaveTextContent("Projet 3");
  });

  it("flèches : désactivées aux bornes sans loop, le focus reste sur le bouton", async () => {
    const user = userEvent.setup();
    render(<Demo count={3} />);
    const previous = screen.getByRole("button", { name: "Diapositive précédente" });
    const next = screen.getByRole("button", { name: "Diapositive suivante" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toHaveAttribute("aria-disabled");

    await user.click(next);
    expect(previous).not.toHaveAttribute("aria-disabled");
    expect(screen.getByText("Diapositive 2 sur 3")).toHaveAttribute("aria-live", "polite");

    await user.click(next);
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveFocus();
    expect(dot(3)).toHaveAttribute("aria-current", "true");

    // Un clic sur la flèche désactivée ne fait rien.
    await user.click(next);
    expect(dot(3)).toHaveAttribute("aria-current", "true");
  });

  it("loop : les flèches ne sont jamais désactivées", () => {
    render(<Demo opts={{ loop: true }} />);
    expect(screen.getByRole("button", { name: "Diapositive précédente" })).not.toHaveAttribute("aria-disabled");
  });

  it("clavier : ← / → , Début / Fin quand le focus est dans le carrousel", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Diapositive précédente" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(dot(2)).toHaveAttribute("aria-current", "true");
    await user.keyboard("{End}");
    expect(dot(5)).toHaveAttribute("aria-current", "true");
    await user.keyboard("{ArrowLeft}");
    expect(dot(4)).toHaveAttribute("aria-current", "true");
    await user.keyboard("{Home}");
    expect(dot(1)).toHaveAttribute("aria-current", "true");
  });

  it("vertical : ↑ / ↓", async () => {
    const user = userEvent.setup();
    render(<Demo orientation="vertical" />);
    expect(screen.getByRole("region")).toHaveAttribute("data-orientation", "vertical");
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(dot(3)).toHaveAttribute("aria-current", "true");
    await user.keyboard("{ArrowUp}");
    expect(dot(2)).toHaveAttribute("aria-current", "true");
  });

  it("droite à gauche : ← avance", async () => {
    const user = userEvent.setup();
    let api: CarouselApi;
    render(
      <DirectionProvider dir="rtl">
        <Demo setApi={(a) => (api = a)} />
      </DirectionProvider>,
    );
    expect(screen.getByRole("region")).toHaveAttribute("data-direction", "rtl");
    const scrollNext = vi.spyOn(api!, "scrollNext");
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(scrollNext).toHaveBeenCalledOnce();
  });

  it("points : nommés, l'actif en aria-current, un seul arrêt de tabulation, le focus suit", async () => {
    const user = userEvent.setup();
    const setApi = vi.fn();
    render(<Demo setApi={setApi} />);
    const api = setApi.mock.lastCall?.[0] as NonNullable<CarouselApi>;
    expect(api.scrollSnapList()).toHaveLength(5);

    await user.click(dot(3));
    expect(api.selectedScrollSnap()).toBe(2);
    expect(dot(3)).toHaveAttribute("aria-current", "true");
    expect(dot(3)).toHaveAttribute("tabindex", "0");
    expect(dot(1)).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowRight}");
    expect(dot(4)).toHaveAttribute("aria-current", "true");
    expect(dot(4)).toHaveFocus();
  });

  it("mouvement réduit : saut direct, sans défilement animé", async () => {
    const user = userEvent.setup();
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    let api: CarouselApi;
    render(<Demo setApi={(a) => (api = a)} />);
    const scrollNext = vi.spyOn(api!, "scrollNext");
    await user.click(screen.getByRole("button", { name: "Diapositive suivante" }));
    expect(scrollNext).toHaveBeenCalledWith(true);
    matchMedia.mockRestore();
  });

  it("libellés surchargeables", () => {
    render(<Demo labels={{ next: "Projet suivant", slidePosition: (n, total) => `Projet ${n} de ${total}` }} />);
    expect(screen.getByRole("button", { name: "Projet suivant" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Projet 2 de 5" })).toBeInTheDocument();
  });

  it("plusieurs diapositives par vue : variables CSS posées", () => {
    render(<Demo slidesPerView={3} spacing={2} />);
    const region = screen.getByRole("region");
    expect(region.style.getPropertyValue("--ui-carousel-per-view")).toBe("3");
    expect(region.style.getPropertyValue("--ui-carousel-gap")).toBe("8px");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <Carousel aria-label="Photos de l'événement">
        <CarouselContent>
          {[1, 2, 3].map((n) => (
            <CarouselItem key={n}>
              <a href={`#photo-${n}`}>Photo {n}</a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots variant="overlay" />
      </Carousel>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Carousel hors contexte", () => {
  it("un sous-composant seul lève une erreur explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CarouselNext />)).toThrow("useCarousel doit être utilisé dans un <Carousel>.");
    spy.mockRestore();
  });
});

