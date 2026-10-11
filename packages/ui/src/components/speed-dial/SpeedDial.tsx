import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { Tooltip } from "../tooltip/Tooltip";
import { Fab, type FabSize, type FabVariant } from "./Fab";

export type SpeedDialDirection = "up" | "down" | "left" | "right";

const PlusGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* Touche qui éloigne du FAB (action suivante) et touche qui y ramène. */
const NEXT_KEY: Record<SpeedDialDirection, string> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};
const PREV_KEY: Record<SpeedDialDirection, string> = {
  up: "ArrowDown",
  down: "ArrowUp",
  left: "ArrowRight",
  right: "ArrowLeft",
};
const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])';

interface SpeedDialContextValue {
  open: boolean;
  direction: SpeedDialDirection;
  showLabels: boolean;
  /** Referme et rend le focus au FAB (après le choix d'une action). */
  closeAndFocus: () => void;
}

const SpeedDialContext = React.createContext<SpeedDialContextValue | null>(null);

// useLayoutEffect sans avertissement au rendu serveur.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useSpeedDialContext() {
  const context = React.useContext(SpeedDialContext);
  if (!context) throw new Error("SpeedDialAction doit être placé dans un SpeedDial.");
  return context;
}

export interface SpeedDialProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nom de l'ensemble (« Créer ») : nomme le FAB et le menu. Obligatoire. */
  label: string;
  /** Icône du FAB. Par défaut un « + » qui pivote en « × » à l'ouverture. */
  icon?: React.ReactNode;
  /** Icône affichée ouvert, en fondu pivotant (sinon `icon` pivote de 45°). */
  openIcon?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Côté où les actions se déploient depuis le FAB. */
  direction?: SpeedDialDirection;
  /** Ouvre aussi au survol de la souris (et referme en sortant). */
  openOnHover?: boolean;
  /**
   * Libellés visibles à côté des actions. Par défaut : oui en `up`/`down`,
   * infobulles en `left`/`right` (la place manque en ligne).
   */
  showLabels?: boolean;
  /** Apparence du FAB. */
  variant?: FabVariant;
  size?: FabSize;
  /** FAB avec libellé visible (`label`), en pilule. */
  extended?: boolean;
  /** `fixed` : flotte en bas à droite de la fenêtre, hors des zones sûres. */
  position?: "static" | "fixed";
  disabled?: boolean;
}

/**
 * FAB qui déploie 3 à 6 actions liées (« Nouveau » : document, dossier,
 * import). Les actions apparaissent en cascade, en ressort ; le « + » pivote
 * en « × ». Sémantique de bouton de menu : `aria-haspopup="menu"`,
 * `aria-expanded`, `aria-controls` ; actions en `menuitem`.
 *
 * Clavier : Entrée ou Espace ouvre et place le focus sur la première action ;
 * flèches dans le sens du déploiement pour parcourir (le sens inverse revient
 * au FAB) ; Début / Fin ; Échap referme et rend le focus au FAB ; Tab referme.
 */
export const SpeedDial = React.forwardRef<HTMLDivElement, SpeedDialProps>(function SpeedDial(
  {
    label,
    icon,
    openIcon,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    direction = "up",
    openOnHover = false,
    showLabels,
    variant,
    size = "default",
    extended = false,
    position = "static",
    disabled = false,
    className,
    children,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    ...props
  },
  ref,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = (openProp ?? uncontrolledOpen) && !disabled;
  const openRef = React.useRef(open);
  openRef.current = open;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === openRef.current) return;
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fabRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const pendingFocus = React.useRef<"first" | null>(null);
  const pointerDown = React.useRef(false);
  const openedByHover = React.useRef(false);
  const menuId = `${React.useId()}-actions`;
  const labelsVisible = showLabels ?? (direction === "up" || direction === "down");
  const vertical = direction === "up" || direction === "down";

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const getItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);

  const closeAndFocus = React.useCallback(() => {
    setOpen(false);
    fabRef.current?.focus();
  }, [setOpen]);

  // Rang de chaque action dans l'ordre du DOM (--_i) et leur nombre (--_n) :
  // la cascade fonctionne même si les actions viennent d'un composant ou d'un fragment.
  useIsomorphicLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = menu.querySelectorAll<HTMLElement>('[role="menuitem"]');
    menu.style.setProperty("--_n", String(items.length));
    items.forEach((item, index) => item.style.setProperty("--_i", String(index)));
  });

  // Focus différé : les actions ne sont focalisables qu'une fois visibles.
  React.useEffect(() => {
    if (open && pendingFocus.current === "first") getItems()[0]?.focus();
    pendingFocus.current = null;
  }, [open]);

  // Un appui hors du composant referme.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDownOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [open, setOpen]);

  const openAndFocusFirst = () => {
    if (openRef.current) getItems()[0]?.focus();
    else {
      pendingFocus.current = "first";
      setOpen(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const items = getItems();
    const active = document.activeElement as HTMLElement | null;
    const index = active ? items.indexOf(active) : -1;
    const onFab = active === fabRef.current;

    switch (event.key) {
      case "Escape":
        if (!open) return;
        event.preventDefault();
        event.stopPropagation();
        closeAndFocus();
        return;
      case "Tab":
        setOpen(false);
        return;
      case NEXT_KEY[direction]:
        event.preventDefault();
        if (onFab) openAndFocusFirst();
        else if (index >= 0) items[Math.min(index + 1, items.length - 1)]?.focus();
        return;
      case PREV_KEY[direction]:
        if (index < 0) return;
        event.preventDefault();
        if (index === 0) fabRef.current?.focus();
        else items[index - 1]?.focus();
        return;
      case "Home":
      case "End":
        if (index < 0) return;
        event.preventDefault();
        items[event.key === "Home" ? 0 : items.length - 1]?.focus();
        return;
    }
  };

  const handleFabClick = () => {
    const byKeyboard = !pointerDown.current;
    pointerDown.current = false;
    // Ouvert par le survol : le clic confirme au lieu de refermer.
    if (openOnHover && openedByHover.current && open) {
      openedByHover.current = false;
      return;
    }
    if (open) setOpen(false);
    else if (byKeyboard) openAndFocusFirst();
    else setOpen(true);
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    if (!openOnHover || disabled || event.pointerType !== "mouse" || openRef.current) return;
    openedByHover.current = true;
    setOpen(true);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (!openOnHover || event.pointerType !== "mouse") return;
    openedByHover.current = false;
    setOpen(false);
  };

  const context = React.useMemo<SpeedDialContextValue>(
    () => ({ open, direction, showLabels: labelsVisible, closeAndFocus }),
    [open, direction, labelsVisible, closeAndFocus],
  );

  return (
    <SpeedDialContext.Provider value={context}>
      <div
        ref={setRootRef}
        data-slot="speed-dial"
        data-state={open ? "open" : "closed"}
        data-direction={direction}
        data-size={size}
        data-labels={labelsVisible ? "visible" : "tooltip"}
        data-hover={openOnHover || undefined}
        data-position={position === "fixed" ? "fixed" : undefined}
        className={cn("ui-speed-dial", className)}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <Fab
          ref={fabRef}
          variant={variant}
          size={size}
          extended={extended}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={extended ? undefined : label}
          className="ui-speed-dial__fab"
          onPointerDown={() => {
            pointerDown.current = true;
          }}
          onClick={handleFabClick}
        >
          <span className="ui-speed-dial__fab-icon" data-open-icon={openIcon != null || undefined}>
            <span className="ui-speed-dial__icon-closed">{icon ?? <PlusGlyph />}</span>
            {openIcon != null && <span className="ui-speed-dial__icon-open">{openIcon}</span>}
          </span>
          {extended && <span className="ui-speed-dial__fab-label">{label}</span>}
        </Fab>
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          aria-orientation={vertical ? "vertical" : "horizontal"}
          aria-hidden={open ? undefined : true}
          data-state={open ? "open" : "closed"}
          className="ui-speed-dial__actions"
        >
          {children}
        </div>
      </div>
    </SpeedDialContext.Provider>
  );
});

export interface SpeedDialActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Pictogramme de l'action (20 px). */
  icon: React.ReactNode;
  /** Libellé : affiché à côté de l'action (ou en infobulle) et lu par les lecteurs d'écran. */
  label: string;
  /** Rend l'enfant unique (un `<a>`, un `<Link>`…) : libellé et icône y sont posés. */
  asChild?: boolean;
}

/**
 * Une action du SpeedDial : pastille surélevée de 40 px et son libellé.
 * Le choix referme le menu et rend le focus au FAB (sauf `preventDefault()`
 * dans `onClick`).
 */
export const SpeedDialAction = React.forwardRef<HTMLButtonElement, SpeedDialActionProps>(function SpeedDialAction(
  { icon, label, asChild = false, className, disabled, onClick, children, ...props },
  ref,
) {
  const { direction, showLabels, closeAndFocus } = useSpeedDialContext();
  const Comp = asChild ? Slot : "button";

  const action = (
    <Comp
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      data-slot="speed-dial-action"
      className={cn("ui-speed-dial__action", className)}
      type={asChild ? undefined : "button"}
      disabled={asChild ? undefined : disabled}
      aria-disabled={disabled || undefined}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (!event.defaultPrevented) closeAndFocus();
      }}
      {...props}
    >
      {[
        <span key="label" className={showLabels ? "ui-speed-dial__label" : "ui-sr-only"}>
          {label}
        </span>,
        <span key="tile" className="ui-speed-dial__tile" aria-hidden="true">
          {icon}
        </span>,
        <Slottable key="child">{children}</Slottable>,
      ]}
    </Comp>
  );

  // Toujours le même arbre ouvert ou fermé : sinon l'action serait remontée
  // à l'ouverture et perdrait sa transition d'entrée.
  if (showLabels) return action;
  return (
    <Tooltip content={label} side={direction === "left" || direction === "right" ? "top" : "left"}>
      {action}
    </Tooltip>
  );
});
