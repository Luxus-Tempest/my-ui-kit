import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "../../utils/cn";
import { space, type Space } from "../../utils/space";
import { Button, type ButtonProps } from "../button/Button";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

/* ── Types ───────────────────────────────────────────────────────────── */

/** API d'Embla (`scrollNext`, `selectedScrollSnap`, `on("select")`…), reçue par `setApi`. */
export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
/** Options d'Embla : `loop`, `align`, `slidesToScroll`, `dragFree`, `startIndex`… */
export type CarouselOptions = UseCarouselParameters[0];
/** Extensions d'Embla (lecture automatique, défilement à la molette…). */
export type CarouselPlugin = UseCarouselParameters[1];
export type CarouselOrientation = "horizontal" | "vertical";

export interface CarouselLabels {
  /** Rôle annoncé du carrousel (`aria-roledescription`). « carrousel ». */
  carousel?: string;
  /** Rôle annoncé d'une diapositive. « diapositive ». */
  slide?: string;
  /** Nom d'une diapositive. « 3 sur 8 ». */
  slidePosition?: (position: number, count: number) => string;
  /** « Diapositive précédente ». */
  previous?: string;
  /** « Diapositive suivante ». */
  next?: string;
  /** Nom du groupe de points. « Choisir une diapositive ». */
  dots?: string;
  /** Nom d'un point. « Aller à la diapositive 3 ». */
  goTo?: (position: number) => string;
  /** Annonce après une navigation (boutons, points, clavier). « Diapositive 3 sur 8 ». */
  status?: (position: number, count: number) => string;
}

export const CAROUSEL_LABELS: Required<CarouselLabels> = {
  carousel: "carrousel",
  slide: "diapositive",
  slidePosition: (position, count) => `${position} sur ${count}`,
  previous: "Diapositive précédente",
  next: "Diapositive suivante",
  dots: "Choisir une diapositive",
  goTo: (position) => `Aller à la diapositive ${position}`,
  status: (position, count) => `Diapositive ${position} sur ${count}`,
};

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Options d'Embla : `{ loop: true, align: "start" }`… */
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  /** `horizontal` (défaut) ou `vertical` (donner une hauteur à `CarouselContent`). */
  orientation?: CarouselOrientation;
  /** Reçoit l'API d'Embla une fois le carrousel monté. */
  setApi?: (api: CarouselApi) => void;
  /** Diapositives visibles à la fois (1 par défaut) ; décimal permis (`1.15` laisse deviner la suivante). */
  slidesPerView?: number;
  /** Espace entre les diapositives, échelle de 4 px : `4` → 16 px (défaut), ou une longueur CSS. */
  spacing?: Space;
  /** Libellés internes, à traduire ou préciser. */
  labels?: CarouselLabels;
}

interface CarouselContextValue {
  viewportRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  orientation: CarouselOrientation;
  labels: Required<CarouselLabels>;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  /** Index du point d'arrêt courant (0 pour le premier). */
  selectedIndex: number;
  /** Nombre de points d'arrêt (pages) : égal au nombre de diapositives sauf regroupement. */
  snapCount: number;
  /** Éléments des diapositives, dans l'ordre. */
  slides: HTMLElement[];
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

/** État et commandes du carrousel parent : compteur, contrôles sur mesure… */
export function useCarousel(): CarouselContextValue {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel doit être utilisé dans un <Carousel>.");
  return context;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/* ── Carousel ────────────────────────────────────────────────────────── */

/**
 * Carrousel sur Embla : glisser au doigt ou à la souris, flèches ← / → (↑ / ↓
 * en vertical) et Début / Fin quand le focus est dans le carrousel. Le sens
 * de lecture (`DirectionProvider`, `ThemeProvider dir`) est suivi.
 *
 * Structure : `Carousel` › `CarouselContent` › `CarouselItem`, puis
 * `CarouselPrevious`, `CarouselNext` et `CarouselDots`. Donner un `aria-label`
 * au carrousel (« Projets récents ») : c'est une région nommée.
 *
 * Mouvement réduit : les boutons, les points et le clavier sautent
 * directement à la diapositive, sans défilement animé.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  {
    orientation = "horizontal",
    opts,
    plugins,
    setApi,
    slidesPerView,
    spacing = 4,
    labels: labelsProp,
    className,
    style,
    onKeyDown,
    children,
    ...props
  },
  ref,
) {
  const direction = useDirection(opts?.direction);
  const [viewportRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y", direction },
    plugins,
  );
  const reducedMotion = usePrefersReducedMotion();
  const catalog = useMessages("carousel", CAROUSEL_LABELS);
  const labels = React.useMemo(() => ({ ...catalog, ...labelsProp }), [catalog, labelsProp]);

  const [snapState, setSnapState] = React.useState({
    canScrollPrev: false,
    canScrollNext: false,
    selectedIndex: 0,
    snapCount: 0,
  });
  const [slides, setSlides] = React.useState<HTMLElement[]>([]);
  const [status, setStatus] = React.useState("");
  // Seule une navigation demandée par l'utilisateur est annoncée (pas le glisser, ni une lecture automatique).
  const announceNext = React.useRef(false);
  const labelsRef = React.useRef(labels);
  labelsRef.current = labels;

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      const selectedIndex = api.selectedScrollSnap();
      const snapCount = api.scrollSnapList().length;
      setSnapState({ canScrollPrev: api.canScrollPrev(), canScrollNext: api.canScrollNext(), selectedIndex, snapCount });
      if (announceNext.current) {
        announceNext.current = false;
        setStatus(labelsRef.current.status(selectedIndex + 1, snapCount));
      }
    };
    const updateSlides = () => {
      setSlides(api.slideNodes());
      update();
    };
    updateSlides();
    api.on("select", update);
    api.on("reInit", updateSlides);
    api.on("slidesChanged", updateSlides);
    return () => {
      api.off("select", update);
      api.off("reInit", updateSlides);
      api.off("slidesChanged", updateSlides);
    };
  }, [api]);

  React.useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  const scrollPrev = React.useCallback(() => {
    announceNext.current = true;
    api?.scrollPrev(reducedMotion);
  }, [api, reducedMotion]);
  const scrollNext = React.useCallback(() => {
    announceNext.current = true;
    api?.scrollNext(reducedMotion);
  }, [api, reducedMotion]);
  const scrollTo = React.useCallback(
    (index: number) => {
      announceNext.current = true;
      api?.scrollTo(index, reducedMotion);
    },
    [api, reducedMotion],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (isEditable(event.target)) return;
    const horizontal = orientation === "horizontal";
    const rtl = horizontal && direction === "rtl";
    const prevKey = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    const nextKey = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    if (event.key === prevKey) scrollPrev();
    else if (event.key === nextKey) scrollNext();
    else if (event.key === "Home") scrollTo(0);
    else if (event.key === "End") scrollTo(Math.max(0, snapState.snapCount - 1));
    else return;
    event.preventDefault();
  };

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      viewportRef,
      api,
      orientation,
      labels,
      scrollPrev,
      scrollNext,
      scrollTo,
      slides,
      ...snapState,
    }),
    [viewportRef, api, orientation, labels, scrollPrev, scrollNext, scrollTo, slides, snapState],
  );

  const vars = {
    "--ui-carousel-gap": space(spacing),
    "--ui-carousel-per-view": slidesPerView != null && slidesPerView > 0 ? String(slidesPerView) : undefined,
  } as React.CSSProperties;

  return (
    <CarouselContext.Provider value={value}>
      <div
        ref={ref}
        role="region"
        aria-roledescription={labels.carousel}
        data-slot="carousel"
        data-orientation={orientation}
        data-direction={direction}
        className={cn("ui-carousel", className)}
        style={{ ...vars, ...style }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <div className="ui-carousel__status" aria-live="polite" aria-atomic="true">
          {status}
        </div>
      </div>
    </CarouselContext.Provider>
  );
});

/* ── Contenu et diapositives ─────────────────────────────────────────── */

/**
 * Fenêtre du carrousel et rail des diapositives. `className` et `style`
 * s'appliquent au rail : en vertical, c'est lui qui reçoit la hauteur.
 */
export const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CarouselContent({ className, ...props }, ref) {
    const { viewportRef } = useCarousel();
    return (
      <div ref={viewportRef} data-slot="carousel-viewport" className="ui-carousel__viewport">
        <div ref={ref} data-slot="carousel-content" className={cn("ui-carousel__content", className)} {...props} />
      </div>
    );
  },
);

function useMergedRef<T>(forwarded: React.Ref<T> | undefined, inner: React.MutableRefObject<T | null>) {
  return React.useCallback(
    (node: T | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as React.MutableRefObject<T | null>).current = node;
    },
    [forwarded, inner],
  );
}

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Une diapositive : groupe nommé « 3 sur 8 », annoncé comme « diapositive ».
 * Sa largeur vient de `slidesPerView` ; la surcharger par `style.flexBasis`
 * pour des diapositives de largeurs différentes.
 */
export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem(
  { className, ...props },
  forwardedRef,
) {
  const { slides, labels } = useCarousel();
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useMergedRef(forwardedRef, innerRef);
  const [index, setIndex] = React.useState(-1);

  React.useEffect(() => {
    setIndex(innerRef.current ? slides.indexOf(innerRef.current) : -1);
  }, [slides]);

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription={labels.slide}
      aria-label={index >= 0 ? labels.slidePosition(index + 1, slides.length) : undefined}
      data-slot="carousel-item"
      className={cn("ui-carousel__item", className)}
      {...props}
    />
  );
});

/* ── Flèches ─────────────────────────────────────────────────────────── */

export type CarouselControlPlacement = "overlay" | "inline";

export interface CarouselControlProps extends ButtonProps {
  /**
   * `overlay` (défaut) : bouton rond surélevé posé sur le bord de la fenêtre,
   * révélé au survol sur les appareils à pointeur. `inline` : dans le flux,
   * pour une barre d'outils (« Récents  ‹ › »).
   */
  placement?: CarouselControlPlacement;
}

const ChevronIcon = ({ next }: { next?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d={next ? "m6 3.5 4.5 4.5L6 12.5" : "M10 3.5 5.5 8l4.5 4.5"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function useControl(kind: "previous" | "next") {
  const context = useCarousel();
  return {
    ...context,
    enabled: kind === "previous" ? context.canScrollPrev : context.canScrollNext,
    scroll: kind === "previous" ? context.scrollPrev : context.scrollNext,
    label: kind === "previous" ? context.labels.previous : context.labels.next,
  };
}

function createControl(kind: "previous" | "next") {
  const Control = React.forwardRef<HTMLButtonElement, CarouselControlProps>(function CarouselControl(
    { className, variant = "elevated", size = "icon", placement = "overlay", onClick, children, ...props },
    ref,
  ) {
    const { orientation, enabled, scroll, label } = useControl(kind);
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        data-slot={`carousel-${kind}`}
        data-placement={placement}
        data-orientation={orientation}
        className={cn("ui-carousel__control", `ui-carousel__control--${kind}`, className)}
        aria-label={label}
        // aria-disabled plutôt que disabled : le focus reste sur le bouton à la dernière diapositive.
        aria-disabled={!enabled || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && enabled) scroll();
        }}
        {...props}
      >
        {children ?? <ChevronIcon next={kind === "next"} />}
      </Button>
    );
  });
  return Control;
}

/** « Diapositive précédente ». Désactivée (`aria-disabled`) à la première diapositive sans `loop`. */
export const CarouselPrevious = createControl("previous");
CarouselPrevious.displayName = "CarouselPrevious";

/** « Diapositive suivante ». Désactivée (`aria-disabled`) à la dernière diapositive sans `loop`. */
export const CarouselNext = createControl("next");
CarouselNext.displayName = "CarouselNext";

/* ── Points de pagination ────────────────────────────────────────────── */

export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `default` : rangée sous la fenêtre (à droite en vertical).
   * `overlay` : capsule translucide posée en bas de la fenêtre, pour les images.
   */
  variant?: "default" | "overlay";
}

/**
 * Points de pagination d'iOS : une pastille par point d'arrêt, l'active
 * s'allonge en pilule. Un seul arrêt de tabulation (le point actif) ; les
 * flèches changent de diapositive et le focus suit le point actif.
 */
export const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots(
  { className, variant = "default", ...props },
  forwardedRef,
) {
  const { snapCount, selectedIndex, scrollTo, labels, orientation } = useCarousel();
  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useMergedRef(forwardedRef, groupRef);

  // Navigation au clavier depuis un point : le focus suit la pastille active.
  React.useEffect(() => {
    const group = groupRef.current;
    if (!group || typeof document === "undefined" || !group.contains(document.activeElement)) return;
    group.querySelector<HTMLButtonElement>(`[data-index="${selectedIndex}"]`)?.focus();
  }, [selectedIndex]);

  const empty = snapCount <= 1;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={labels.dots}
      aria-hidden={empty || undefined}
      data-slot="carousel-dots"
      data-variant={variant}
      data-orientation={orientation}
      data-empty={empty || undefined}
      className={cn("ui-carousel-dots", className)}
      {...props}
    >
      {!empty &&
        Array.from({ length: snapCount }, (_, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              className="ui-carousel-dots__dot"
              data-index={index}
              data-state={active ? "active" : "inactive"}
              aria-label={labels.goTo(index + 1)}
              aria-current={active ? "true" : undefined}
              tabIndex={active ? 0 : -1}
              onClick={() => scrollTo(index)}
            />
          );
        })}
    </div>
  );
});
