import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { useMessages } from "../../i18n/LocaleProvider";

export type BottomNavigationPosition = "fixed" | "sticky" | "static";

interface BottomNavigationContextValue {
  value: string | undefined;
  select: (value: string) => void;
}
const BottomNavigationContext = React.createContext<BottomNavigationContextValue | null>(null);

export interface BottomNavigationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
  /** Entrée active (contrôlé), comparée au `value` de chaque entrée. */
  value?: string;
  /** Entrée active au départ (non contrôlé). */
  defaultValue?: string;
  /** Appelé quand une entrée qui porte un `value` est choisie. */
  onValueChange?: (value: string) => void;
  /**
   * `fixed` (défaut) : collée au bas de l'écran. `sticky` : au bas de la zone qui
   * défile. `static` : dans le flux (maquette, aperçu).
   */
  position?: BottomNavigationPosition;
  /** Nom du repère de navigation. */
  label?: string;
}

/**
 * Barre d'onglets d'iOS (mobile) : 3 à 5 destinations de premier niveau, icône et
 * libellé, sur un matériau translucide qui laisse deviner le contenu. L'entrée
 * active passe en primaire, avec la pastille de sélection de Material derrière
 * l'icône. Respecte la zone de sécurité du bas (`safe-area-inset-bottom`).
 *
 * Deux façons de marquer l'entrée active : `value` / `onValueChange` sur la barre
 * (état local), ou `isActive` sur chaque entrée (lien de routeur, avec `asChild`).
 */
export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  {
    className,
    value: valueProp,
    defaultValue,
    onValueChange,
    position = "fixed",
    label: labelProp,
    children,
    ...props
  },
  ref,
) {
  const labelLabels = useMessages("bottomNavigation", BOTTOM_NAVIGATION_LABELS);
  const label = labelProp ?? labelLabels.label;
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const select = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setInner(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );
  const context = React.useMemo(() => ({ value, select }), [value, select]);

  return (
    <BottomNavigationContext.Provider value={context}>
      <nav
        ref={ref}
        aria-label={label}
        data-slot="bottom-navigation"
        data-position={position}
        className={cn("ui-bottom-nav", className)}
        {...props}
      >
        <ul role="list" className="ui-bottom-nav__list">
          {children}
        </ul>
      </nav>
    </BottomNavigationContext.Provider>
  );
});

export interface BottomNavigationItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Identifiant de la destination, comparé au `value` de la barre. */
  value?: string;
  /** Pictogramme de 24 px (lucide-react recommandé). */
  icon: React.ReactNode;
  /** Libellé court, sous l'icône. Avec `asChild`, le contenu de l'enfant sert de libellé. */
  label?: React.ReactNode;
  /** Force l'état actif (lien de routeur) ; sinon déduit du `value` de la barre. */
  isActive?: boolean;
  /**
   * Badge sur l'icône : un nombre (compteur, « 99+ » au-delà de 99), `true` (point),
   * ou un élément (un `Badge` de la librairie). `0`, `false` ou rien : aucun badge.
   */
  badge?: React.ReactNode;
  /**
   * Texte lu par les lecteurs d'écran pour le badge. Par défaut « 3 nouveaux »,
   * « Nouveau » pour un point ; à fournir pour un badge élément sans texte.
   */
  badgeLabel?: string;
  /** Rend l'enfant unique (`<a>`, `Link` du routeur) comme entrée, à l'intérieur du `<li>`. */
  asChild?: boolean;
}

const BADGE_MAX = 99;

export interface BottomNavigationLabels {
  /** Nom de la barre. « Navigation principale ». */
  label: string;
  /** Badge en pastille seule. « Nouveau ». */
  badgeNew: string;
  /** Badge chiffré. « 3 nouveaux ». */
  badgeCount: (count: number) => string;
  /** Au-delà de 99. « plus de 99 nouveaux ». */
  badgeOverflow: (max: number) => string;
}
export const BOTTOM_NAVIGATION_LABELS: BottomNavigationLabels = {
  label: "Navigation principale",
  badgeNew: "Nouveau",
  badgeCount: (count) => `${count} nouveau${count > 1 ? "x" : ""}`,
  badgeOverflow: (max) => `plus de ${max} nouveaux`,
};

function renderBadge(badge: React.ReactNode, badgeLabel: string | undefined, labels: BottomNavigationLabels) {
  if (badge == null || badge === false || badge === 0) return null;
  if (typeof badge === "number" || badge === true) {
    const dot = badge === true;
    const count = dot ? 0 : (badge as number);
    const text = count > BADGE_MAX ? `${BADGE_MAX}+` : String(count);
    const spoken =
      badgeLabel ??
      (dot ? labels.badgeNew : count > BADGE_MAX ? labels.badgeOverflow(BADGE_MAX) : labels.badgeCount(count));
    return (
      <>
        <span className="ui-bottom-nav__badge" data-dot={dot || undefined} aria-hidden="true">
          {dot ? null : text}
        </span>
        <span className="ui-sr-only">, {spoken}</span>
      </>
    );
  }
  // Badge élément : lu tel quel (après une pause), ou remplacé par `badgeLabel`.
  if (badgeLabel) {
    return (
      <>
        <span className="ui-bottom-nav__badge-slot" aria-hidden="true">{badge}</span>
        <span className="ui-sr-only">, {badgeLabel}</span>
      </>
    );
  }
  return (
    <span className="ui-bottom-nav__badge-slot">
      <span className="ui-sr-only">, </span>
      {badge}
    </span>
  );
}

/** Destination de la barre d'onglets : bouton par défaut, lien avec `asChild`. */
export const BottomNavigationItem = React.forwardRef<HTMLButtonElement, BottomNavigationItemProps>(
  function BottomNavigationItem(
    { className, value, icon, label, isActive, badge, badgeLabel, asChild = false, disabled, type, onClick, children, ...props },
    ref,
  ) {
    const context = React.useContext(BottomNavigationContext);
    const labels = useMessages("bottomNavigation", BOTTOM_NAVIGATION_LABELS);
    const active = isActive ?? (value !== undefined && context?.value === value);

    const layout = (text: React.ReactNode) => (
      <>
        <span className="ui-bottom-nav__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="ui-bottom-nav__label">{text}</span>
        {renderBadge(badge, badgeLabel, labels)}
      </>
    );

    const itemProps = {
      "data-slot": "bottom-navigation-item",
      "data-active": active || undefined,
      "aria-current": active ? ("page" as const) : undefined,
      className: cn("ui-bottom-nav__button", className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        if (asChild && disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (!event.defaultPrevented && value !== undefined) context?.select(value);
      },
      ...props,
    };

    let item: React.ReactNode;
    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      item = (
        <Slot ref={ref} aria-disabled={disabled || undefined} {...itemProps}>
          {React.cloneElement(children, undefined, layout(label ?? children.props.children))}
        </Slot>
      );
    } else {
      item = (
        <button ref={ref} type={type ?? "button"} disabled={disabled} {...itemProps}>
          {layout(label ?? children)}
        </button>
      );
    }

    return (
      <li data-slot="bottom-navigation-entry" className="ui-bottom-nav__item">
        {item}
      </li>
    );
  },
);
