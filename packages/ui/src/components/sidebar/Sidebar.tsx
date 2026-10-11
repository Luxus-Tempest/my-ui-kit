import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { Button, type ButtonProps } from "../button/Button";
import { Separator, type SeparatorProps } from "../separator/Separator";
import { Sheet, SheetContent, SheetTitle } from "../sheet/Sheet";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  type TooltipContentProps,
} from "../tooltip/Tooltip";

/*
 * Barre latérale : la coquille d'application, à la manière de Drive.
 *
 *   <SidebarProvider>
 *     <Sidebar>                      panneau de navigation (Sheet sur mobile)
 *       <SidebarHeader />            espace de travail, recherche
 *       <SidebarContent>             seule zone qui défile
 *         <SidebarGroup>
 *           <SidebarGroupLabel />
 *           <SidebarMenu>
 *             <SidebarMenuItem>
 *               <SidebarMenuButton isActive tooltip="Accueil">…</SidebarMenuButton>
 *             </SidebarMenuItem>
 *           </SidebarMenu>
 *         </SidebarGroup>
 *       </SidebarContent>
 *       <SidebarFooter />            compte, espace de stockage
 *     </Sidebar>
 *     <SidebarInset>…</SidebarInset> contenu principal (<main>)
 *   </SidebarProvider>
 */

/** Sous ce seuil (768 px), la barre devient une feuille modale à gauche (ou à droite). */
const MOBILE_QUERY = "(max-width: 767.98px)";

export type SidebarState = "expanded" | "collapsed";
export type SidebarSide = "left" | "right";
export type SidebarVariant = "inset" | "floating" | "sidebar";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";

type SetOpen = (open: boolean | ((open: boolean) => boolean)) => void;

export interface SidebarContextValue {
  /** `expanded` : barre ouverte ; `collapsed` : réduite (colonne d'icônes) ou masquée. */
  state: SidebarState;
  /** Barre ouverte sur grand écran. */
  open: boolean;
  setOpen: SetOpen;
  /** Feuille ouverte sur petit écran. */
  openMobile: boolean;
  setOpenMobile: SetOpen;
  /** Écran de moins de 768 px : la barre est une feuille. Toujours `false` au rendu serveur. */
  isMobile: boolean;
  /** Ouvre ou ferme la barre (ou la feuille sur petit écran). */
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** État et commandes de la barre latérale. À appeler sous un `SidebarProvider`. */
export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar doit être appelé à l'intérieur d'un SidebarProvider.");
  return context;
}

/* Réglages de la barre courante, lus par ses entrées (infobulles, côté). */
interface SidebarInstance {
  side: SidebarSide;
  collapsible: SidebarCollapsible;
}
const SidebarInstanceContext = React.createContext<SidebarInstance | null>(null);

/* Largeur d'écran, sûre au rendu serveur : `false` côté serveur et à l'hydratation. */
function subscribeToMobile(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(MOBILE_QUERY);
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }
  query.addListener(onChange);
  return () => query.removeListener(onChange);
}
const getMobileSnapshot = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(MOBILE_QUERY).matches;
const getServerMobileSnapshot = () => false;

function useIsMobile() {
  return React.useSyncExternalStore(subscribeToMobile, getMobileSnapshot, getServerMobileSnapshot);
}

/* ══ Fournisseur ═════════════════════════════════════════════════════════ */

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** État initial sur grand écran (non contrôlé). Ouvert par défaut. */
  defaultOpen?: boolean;
  /** État contrôlé, avec `onOpenChange`. */
  open?: boolean;
  /** Appelé quand la barre s'ouvre ou se ferme (pour la mémoriser dans un cookie, par exemple). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Touche du raccourci, avec ⌘ (macOS) ou Ctrl (Windows, Linux). `"b"` par défaut,
   * comme les éditeurs de code ; `false` le désactive.
   */
  keyboardShortcut?: string | false;
}

/**
 * Porte l'état de la barre latérale et pose la mise en page de l'application :
 * barre et contenu côte à côte, sur le fond d'application. Largeurs réglables par
 * `style` : `--ui-sidebar-width` (256 px), `--ui-sidebar-width-icon` (60 px),
 * `--ui-sidebar-width-mobile` (288 px, à poser sur `:root` : la feuille vit dans un portail).
 */
export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(function SidebarProvider(
  { defaultOpen = true, open: openProp, onOpenChange, keyboardShortcut = "b", className, children, ...props },
  ref,
) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobileState] = React.useState(false);
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp ?? innerOpen;

  const setOpen = React.useCallback<SetOpen>(
    (value) => {
      const next = typeof value === "function" ? value(open) : value;
      if (next === open) return;
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [open, openProp, onOpenChange],
  );

  const setOpenMobile = React.useCallback<SetOpen>((value) => setOpenMobileState(value), []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobileState((value) => !value);
    else setOpen((value) => !value);
  }, [isMobile, setOpen]);

  // Revenu sur grand écran, la feuille n'a plus lieu d'être.
  React.useEffect(() => {
    if (!isMobile) setOpenMobileState(false);
  }, [isMobile]);

  // ⌘B / Ctrl+B. Ignoré dans un éditeur de texte riche (où il met en gras).
  const toggleRef = React.useRef(toggleSidebar);
  React.useEffect(() => {
    toggleRef.current = toggleSidebar;
  }, [toggleSidebar]);
  React.useEffect(() => {
    if (!keyboardShortcut) return;
    const key = keyboardShortcut.toLowerCase();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== key) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      event.preventDefault();
      toggleRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardShortcut]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div ref={ref} data-slot="sidebar-wrapper" className={cn("ui-sidebar-wrapper", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});

/* ══ Barre ═══════════════════════════════════════════════════════════════ */

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Bord de l'écran. `right` : placée à droite quel que soit son rang dans le DOM. */
  side?: SidebarSide;
  /**
   * `inset` (défaut) : posée sur le fond d'application, le contenu (`SidebarInset`)
   * dans un panneau au grand rayon, comme Drive.
   * `floating` : carte détachée des bords, qui flotte au-dessus du fond.
   * `sidebar` : colonne pleine hauteur séparée du contenu par un filet.
   */
  variant?: SidebarVariant;
  /**
   * `offcanvas` (défaut) : sort de l'écran une fois fermée.
   * `icon` : se réduit à une colonne d'icônes, avec infobulles.
   * `none` : toujours ouverte, sans feuille sur mobile.
   */
  collapsible?: SidebarCollapsible;
  /** Nom du repère de navigation (et de la feuille sur mobile). */
  label?: string;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
  {
    side = "left",
    variant = "inset",
    collapsible = "offcanvas",
    label = "Barre latérale",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    children,
    ...props
  },
  ref,
) {
  const context = React.useContext(SidebarContext);
  const instance = React.useMemo<SidebarInstance>(() => ({ side, collapsible }), [side, collapsible]);
  const navLabel = ariaLabelledBy ? undefined : (ariaLabel ?? label);

  const panel = (
    <nav className="ui-sidebar__panel" aria-label={navLabel} aria-labelledby={ariaLabelledBy}>
      {children}
    </nav>
  );

  // Petit écran : la barre devient une feuille modale (piège à focus, Échap, voile).
  if (context?.isMobile && collapsible !== "none") {
    return (
      <SidebarInstanceContext.Provider value={instance}>
        <TooltipProvider>
          <Sheet open={context.openMobile} onOpenChange={context.setOpenMobile}>
            <SheetContent
              ref={ref}
              side={side}
              showCloseButton={false}
              aria-describedby={undefined}
              data-slot="sidebar"
              data-mobile="true"
              data-variant={variant}
              className={cn("ui-sidebar-sheet", className)}
              {...props}
            >
              <SheetTitle className="ui-sr-only">{label}</SheetTitle>
              {panel}
            </SheetContent>
          </Sheet>
        </TooltipProvider>
      </SidebarInstanceContext.Provider>
    );
  }

  const state: SidebarState = collapsible === "none" ? "expanded" : (context?.state ?? "expanded");

  return (
    <SidebarInstanceContext.Provider value={instance}>
      <TooltipProvider>
        <div
          ref={ref}
          data-slot="sidebar"
          data-state={state}
          data-collapsible={collapsible}
          data-variant={variant}
          data-side={side}
          className={cn("ui-sidebar", className)}
          {...props}
        >
          {panel}
        </div>
      </TooltipProvider>
    </SidebarInstanceContext.Provider>
  );
});

const PanelIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.75 4v12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export interface SidebarTriggerProps extends ButtonProps {
  /** Nom accessible quand la barre est fermée ou réduite. */
  showLabel?: string;
  /** Nom accessible quand la barre est ouverte. */
  hideLabel?: string;
}

/** Bouton icône qui ouvre ou ferme la barre ; son nom suit l'état (« Afficher… » / « Masquer… »). */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger(
  {
    className,
    onClick,
    children,
    variant = "ghost",
    size = "icon",
    showLabel = "Afficher la barre latérale",
    hideLabel = "Masquer la barre latérale",
    ...props
  },
  ref,
) {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  const visible = isMobile ? openMobile : open;
  return (
    <Button
      ref={ref}
      data-slot="sidebar-trigger"
      variant={variant}
      size={size}
      aria-label={visible ? hideLabel : showLabel}
      className={cn("ui-sidebar-trigger", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      {...props}
    >
      {children ?? <PanelIcon />}
    </Button>
  );
});

export interface SidebarRailProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Nom de la poignée ; « Afficher / Masquer la barre latérale » par défaut. */
  label?: string;
}

/**
 * Poignée au bord intérieur de la barre : un clic l'ouvre ou la ferme. Hors de
 * l'ordre de tabulation (le raccourci et `SidebarTrigger` suffisent au clavier).
 */
export const SidebarRail = React.forwardRef<HTMLButtonElement, SidebarRailProps>(function SidebarRail(
  { className, onClick, label = "Afficher / Masquer la barre latérale", ...props },
  ref,
) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-label={label}
      title={label}
      data-slot="sidebar-rail"
      className={cn("ui-sidebar-rail", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      {...props}
    />
  );
});

/** Zone principale (`<main>`). Avec `variant="inset"`, un panneau au grand rayon posé sur le fond d'application. */
export const SidebarInset = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function SidebarInset(
  { className, ...props },
  ref,
) {
  return <main ref={ref} data-slot="sidebar-inset" className={cn("ui-sidebar-inset", className)} {...props} />;
});

/* ══ Structure ═══════════════════════════════════════════════════════════ */

/** En-tête fixe : sélecteur d'espace de travail, recherche. */
export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarHeader({ className, ...props }, ref) {
    return <div ref={ref} data-slot="sidebar-header" className={cn("ui-sidebar-header", className)} {...props} />;
  },
);

/** Pied fixe : compte, espace de stockage. */
export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...props }, ref) {
    return <div ref={ref} data-slot="sidebar-footer" className={cn("ui-sidebar-footer", className)} {...props} />;
  },
);

/** Seule zone qui défile, entre l'en-tête et le pied. */
export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarContent({ className, ...props }, ref) {
    return <div ref={ref} data-slot="sidebar-content" className={cn("ui-sidebar-content", className)} {...props} />;
  },
);

/** Filet entre deux zones de la barre. */
export const SidebarSeparator = React.forwardRef<HTMLDivElement, SeparatorProps>(function SidebarSeparator(
  { className, ...props },
  ref,
) {
  return <Separator ref={ref} data-slot="sidebar-separator" className={cn("ui-sidebar-separator", className)} {...props} />;
});

/* ══ Groupes ═════════════════════════════════════════════════════════════ */

interface SidebarGroupContextValue {
  labelId: string;
  registerLabel: (id: string) => () => void;
}
const SidebarGroupContext = React.createContext<SidebarGroupContextValue | null>(null);

/** Section de la barre ; nommée par son `SidebarGroupLabel` (rôle `group`). */
export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarGroup({ className, ...props }, ref) {
    const labelId = React.useId();
    const [labelledBy, setLabelledBy] = React.useState<string>();
    const registerLabel = React.useCallback((id: string) => {
      setLabelledBy(id);
      return () => setLabelledBy(undefined);
    }, []);
    const value = React.useMemo(() => ({ labelId, registerLabel }), [labelId, registerLabel]);
    return (
      <SidebarGroupContext.Provider value={value}>
        <div
          ref={ref}
          role="group"
          aria-labelledby={labelledBy}
          data-slot="sidebar-group"
          className={cn("ui-sidebar-group", className)}
          {...props}
        />
      </SidebarGroupContext.Provider>
    );
  },
);

export interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rend l'enfant (un `CollapsibleTrigger` pour un groupe repliable…) avec le style de l'intitulé. */
  asChild?: boolean;
}

/** Intitulé de groupe, discret, en casse de phrase. S'efface en mode icône. */
export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(function SidebarGroupLabel(
  { className, asChild = false, id, ...props },
  ref,
) {
  const group = React.useContext(SidebarGroupContext);
  const labelId = id ?? group?.labelId;
  const register = group?.registerLabel;
  React.useEffect(() => (register && labelId ? register(labelId) : undefined), [register, labelId]);
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} id={labelId} data-slot="sidebar-group-label" className={cn("ui-sidebar-group-label", className)} {...props} />;
});

export interface SidebarGroupActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Action de groupe (« Nouveau projet »…), bouton icône à droite de l'intitulé. `aria-label` obligatoire. */
export const SidebarGroupAction = React.forwardRef<HTMLButtonElement, SidebarGroupActionProps>(
  function SidebarGroupAction({ className, asChild = false, type, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        data-slot="sidebar-group-action"
        className={cn("ui-sidebar-group-action", className)}
        {...props}
      />
    );
  },
);

/** Contenu d'un groupe, sous son intitulé. */
export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarGroupContent({ className, ...props }, ref) {
    return <div ref={ref} data-slot="sidebar-group-content" className={cn("ui-sidebar-group-content", className)} {...props} />;
  },
);

/* ══ Menu ════════════════════════════════════════════════════════════════ */

/** Liste d'entrées de navigation. */
export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  function SidebarMenu({ className, ...props }, ref) {
    return <ul ref={ref} role="list" data-slot="sidebar-menu" className={cn("ui-sidebar-menu", className)} {...props} />;
  },
);

/** Entrée : porte le bouton, et éventuellement badge, action et sous-menu. */
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  function SidebarMenuItem({ className, ...props }, ref) {
    return <li ref={ref} data-slot="sidebar-menu-item" className={cn("ui-sidebar-menu-item", className)} {...props} />;
  },
);

/* Sur mobile, suivre un lien referme la feuille ; un déclencheur de menu ou de sous-menu la laisse ouverte. */
function useCloseOnNavigate() {
  const context = React.useContext(SidebarContext);
  return React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!context?.isMobile || event.defaultPrevented) return;
      const target = event.currentTarget;
      if (target.hasAttribute("aria-expanded") || target.hasAttribute("aria-haspopup")) return;
      context.setOpenMobile(false);
    },
    [context],
  );
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Rend l'enfant unique (le `Link` du routeur, un `<a>`, un `MenuTrigger`…) avec
   * le style et le comportement de l'entrée.
   */
  asChild?: boolean;
  /** Page courante : pilule de sélection et `aria-current="page"`. */
  isActive?: boolean;
  /** `sm` : 32 px · `default` : 36 px · `lg` : 48 px (espace de travail, compte, sur deux lignes). */
  size?: "sm" | "default" | "lg";
  /**
   * Infobulle affichée seulement quand la barre est réduite en icônes : le libellé
   * de l'entrée, ou les props d'un `TooltipContent`.
   */
  tooltip?: string | TooltipContentProps;
}

/**
 * Entrée de navigation en pilule : icône (premier enfant) puis libellé dans un `<span>`.
 * En mode icône, seul le premier enfant reste visible ; un chevron en dernier enfant
 * pivote quand l'entrée déplie un sous-menu (`CollapsibleTrigger asChild`).
 */
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(function SidebarMenuButton(
  { asChild = false, isActive = false, size = "default", tooltip, className, type, onClick, ...props },
  ref,
) {
  const sidebar = React.useContext(SidebarContext);
  const instance = React.useContext(SidebarInstanceContext);
  const closeOnNavigate = useCloseOnNavigate();
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const Comp = asChild ? Slot : "button";

  const button = (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      data-slot="sidebar-menu-button"
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn("ui-sidebar-menu-button", className)}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        closeOnNavigate(event);
      }}
      {...props}
    />
  );

  // Sans barre (ou sur mobile) pas d'infobulle ; l'arbre reste stable pour ne pas perdre le focus au repli.
  if (!tooltip || !instance) return button;

  const showTooltip = sidebar?.state === "collapsed" && !sidebar.isMobile && instance.collapsible === "icon";
  const contentProps: TooltipContentProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

  return (
    <TooltipRoot open={showTooltip && tooltipOpen} onOpenChange={(next) => setTooltipOpen(next && showTooltip)}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={instance.side === "right" ? "left" : "right"} align="center" sideOffset={10} {...contentProps} />
    </TooltipRoot>
  );
});

export interface SidebarMenuActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** N'apparaît qu'au survol ou au focus de l'entrée (toujours visible sur écran tactile). */
  showOnHover?: boolean;
}

/** Action d'une entrée (menu « ⋯ »), bouton icône rond à droite. `aria-label` obligatoire. */
export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, SidebarMenuActionProps>(function SidebarMenuAction(
  { className, asChild = false, showOnHover = false, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      data-slot="sidebar-menu-action"
      data-show-on-hover={showOnHover || undefined}
      className={cn("ui-sidebar-menu-action", className)}
      {...props}
    />
  );
});

/**
 * Compteur à droite d'une entrée (non lus, éléments en attente). Devient une
 * pastille sur l'icône quand la barre est réduite.
 */
export const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function SidebarMenuBadge({ className, ...props }, ref) {
    return <span ref={ref} data-slot="sidebar-menu-badge" className={cn("ui-sidebar-menu-badge", className)} {...props} />;
  },
);

/* ══ Sous-menu ═══════════════════════════════════════════════════════════ */

/** Sous-niveau d'une entrée, le long d'un filet. Masqué en mode icône. */
export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  function SidebarMenuSub({ className, ...props }, ref) {
    return <ul ref={ref} role="list" data-slot="sidebar-menu-sub" className={cn("ui-sidebar-menu-sub", className)} {...props} />;
  },
);

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  function SidebarMenuSubItem({ className, ...props }, ref) {
    return <li ref={ref} data-slot="sidebar-menu-sub-item" className={cn("ui-sidebar-menu-sub-item", className)} {...props} />;
  },
);

export interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Rend l'enfant (le `Link` du routeur…) avec le style de l'entrée. */
  asChild?: boolean;
  /** Page courante : pilule de sélection et `aria-current="page"`. */
  isActive?: boolean;
  /** `sm` : 28 px · `md` (défaut) : 32 px. */
  size?: "sm" | "md";
}

/** Lien de sous-niveau (`<a>` par défaut). */
export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  function SidebarMenuSubButton({ className, asChild = false, isActive = false, size = "md", onClick, ...props }, ref) {
    const closeOnNavigate = useCloseOnNavigate();
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        data-slot="sidebar-menu-sub-button"
        data-size={size}
        data-active={isActive || undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn("ui-sidebar-menu-sub-button", className)}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          closeOnNavigate(event);
        }}
        {...props}
      />
    );
  },
);
