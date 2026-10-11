import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks/useControllableState";
import { Spinner } from "../spinner/Spinner";

/* ═══ Types publics ═══════════════════════════════════════════════════════ */

/** Un nœud de l'arborescence (API à données). */
export interface TreeViewItem {
  /** Identifiant unique dans tout l'arbre. */
  id: string;
  /** Libellé affiché et annoncé ; sert aussi à la saisie de lettres (type-ahead). */
  label: string;
  /** Icône posée avant le libellé (dossier, fichier…), 20 px. */
  icon?: React.ReactNode;
  /** Icône à l'état ouvert (dossier ouvert) ; `icon` sinon. */
  iconExpanded?: React.ReactNode;
  /** Information discrète alignée à droite (compteur, pictogramme de partage). Jamais interactive. */
  trailing?: React.ReactNode;
  /** Enfants connus d'avance. */
  children?: TreeViewItem[];
  /**
   * Le nœud a des enfants qui ne sont pas encore lus : ils sont demandés à
   * `loadChildren` à la première ouverture (chargement paresseux).
   */
  hasChildren?: boolean;
  /** Ni focalisable, ni sélectionnable, ni dépliable ; ses descendants non plus. */
  disabled?: boolean;
  /** Classe ajoutée à l'élément `treeitem`. */
  className?: string;
}

export type TreeViewSelectionMode = "single" | "multiple" | "none";
export type TreeViewSize = "sm" | "default";

/** Textes internes, surchargeables (annonces aux lecteurs d'écran, message d'échec). */
export interface TreeViewLabels {
  /** Annonce au début d'un chargement paresseux. */
  loading: (label: string) => string;
  /** Annonce d'un chargement en échec. */
  error: (label: string) => string;
  /** Mention visible à côté d'un dossier dont le chargement a échoué. */
  errorHint: string;
}

const defaultLabels: TreeViewLabels = {
  loading: (label) => `Chargement du contenu de ${label}…`,
  error: (label) => `Impossible de charger le contenu de ${label}. Rouvrez le dossier pour réessayer.`,
  errorHint: "Échec du chargement",
};

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children" | "onSelect" | "defaultValue" | "dir"> {
  /** Arborescence (API à données). Prioritaire sur les enfants `TreeItem`. */
  items?: TreeViewItem[];
  /** API composable : des `TreeItem` imbriqués, convertis vers le même modèle que `items`. */
  children?: React.ReactNode;

  /** Nœuds ouverts (contrôlé). */
  expandedIds?: string[];
  /** Nœuds ouverts au premier rendu (non contrôlé). */
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;

  /**
   * `single` (défaut) : un nœud choisi, comme le dossier courant de Drive.
   * `multiple` : Ctrl/⌘ + clic, Maj + clic, Espace, Maj + flèches, Ctrl + A.
   * `none` : arborescence de navigation pure, sans état de sélection.
   */
  selectionMode?: TreeViewSelectionMode;
  /** Nœuds sélectionnés (contrôlé). Toujours un tableau, même en `single`. */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;

  /** Ouverture d'un nœud : Entrée ou double-clic (ouvrir le dossier, le fichier). */
  onItemActivate?: (item: TreeViewItem) => void;

  /**
   * Chargement paresseux : appelé à la première ouverture d'un nœud marqué
   * `hasChildren` sans `children`. Le chevron cède la place à un indicateur
   * d'attente ; un échec referme le nœud, qu'on peut rouvrir pour réessayer.
   */
  loadChildren?: (item: TreeViewItem) => Promise<TreeViewItem[]>;

  /**
   * Ce qui ouvre et ferme un nœud à la souris : le chevron seul (`chevron`,
   * défaut, comme Drive) ou toute la ligne (`row`, comme un explorateur de code).
   */
  expansionTrigger?: "chevron" | "row";
  /** Lignes de 32 px (`sm`) ou 36 px (`default`). */
  size?: TreeViewSize;
  /** Guides d'indentation verticaux. Activés par défaut. */
  guides?: boolean;
  /** Sens de lecture ; hérite du `DirectionProvider` sinon. Inverse ← et →. */
  dir?: "ltr" | "rtl";
  labels?: Partial<TreeViewLabels>;
}

/* ═══ API composable ══════════════════════════════════════════════════════ */

export interface TreeItemProps extends Omit<TreeViewItem, "id" | "children"> {
  /** Identifiant unique dans tout l'arbre. */
  itemId: string;
  /** `TreeItem` enfants. */
  children?: React.ReactNode;
}

/**
 * Nœud de l'API composable. Il ne rend rien seul : `TreeView` lit ses props
 * et celles de ses `TreeItem` enfants (fragments et tableaux compris) pour
 * construire l'arbre. Il doit donc être un enfant direct d'un `TreeView` ou
 * d'un autre `TreeItem`.
 */
export function TreeItem(_props: TreeItemProps): React.ReactElement | null {
  return null;
}

function collectItems(children: React.ReactNode): TreeViewItem[] {
  const out: TreeViewItem[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      out.push(...collectItems((child.props as { children?: React.ReactNode }).children));
      return;
    }
    if (child.type !== TreeItem) return;
    const { itemId, children: nested, ...rest } = child.props as TreeItemProps;
    const sub = collectItems(nested);
    out.push({ ...rest, id: itemId, children: sub.length > 0 ? sub : undefined });
  });
  return out;
}

/* ═══ Modèle interne ══════════════════════════════════════════════════════ */

interface TreeNode {
  item: TreeViewItem;
  id: string;
  /** Rang en parcours préfixe : sert aux identifiants DOM. */
  index: number;
  parentId: string | null;
  level: number;
  posinset: number;
  setsize: number;
  /** Enfants connus (fournis ou chargés). */
  childIds: string[];
  /** Possède des enfants, connus ou encore à charger. */
  expandable: boolean;
  /** Enfants à charger avec `loadChildren`. */
  lazy: boolean;
  /** Désactivé lui-même ou par un ancêtre. */
  disabled: boolean;
}

const has = (record: object, key: string) => Object.prototype.hasOwnProperty.call(record, key);

function buildModel(roots: TreeViewItem[], loaded: Record<string, TreeViewItem[]>) {
  const nodes = new Map<string, TreeNode>();
  let index = 0;
  const walk = (list: TreeViewItem[], parentId: string | null, level: number, parentDisabled: boolean): string[] =>
    list.map((item, i) => {
      const known = item.children ?? (has(loaded, item.id) ? loaded[item.id] : undefined);
      const lazy = known === undefined && !!item.hasChildren;
      const disabled = parentDisabled || !!item.disabled;
      const node: TreeNode = {
        item,
        id: item.id,
        index: index++,
        parentId,
        level,
        posinset: i + 1,
        setsize: list.length,
        childIds: [],
        expandable: lazy || (known?.length ?? 0) > 0,
        lazy,
        disabled,
      };
      nodes.set(item.id, node);
      if (known && known.length > 0) node.childIds = walk(known, item.id, level + 1, disabled);
      return item.id;
    });
  const rootIds = walk(roots, null, 1, false);
  return { nodes, rootIds };
}

/** Nœuds visibles dans l'ordre de lecture : racines, puis enfants des nœuds ouverts. */
function visibleOrder(rootIds: string[], nodes: Map<string, TreeNode>, expanded: Set<string>) {
  const out: string[] = [];
  const walk = (ids: string[]) => {
    for (const id of ids) {
      out.push(id);
      const node = nodes.get(id);
      if (node && node.childIds.length > 0 && expanded.has(id)) walk(node.childIds);
    }
  };
  walk(rootIds);
  return out;
}

/** Comparaison de la saisie de lettres : casse et accents ignorés (« é » trouve « Équipe »). */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

/** Durée de l'animation CSS en cours sur l'élément (0 si aucune : jsdom, mouvement réduit). */
function animationMs(el: HTMLElement | null): number {
  if (!el || typeof window === "undefined" || !window.getComputedStyle) return 0;
  const style = window.getComputedStyle(el);
  if (!style.animationName || style.animationName === "none") return 0;
  const first = (style.animationDuration || "0s").split(",")[0]!.trim();
  const value = parseFloat(first);
  if (!Number.isFinite(value)) return 0;
  return first.endsWith("ms") ? value : value * 1000;
}

/* ═══ Repli animé ═════════════════════════════════════════════════════════ */

type CollapsePhase = "opening" | "open" | "closing" | "closed";

/**
 * Groupe d'enfants : monté à l'ouverture (déroulé en ressort), gardé le temps
 * de l'animation de fermeture puis démonté. Masqué aux technologies
 * d'assistance dès que la fermeture commence.
 */
function TreeCollapse({
  open,
  appear = false,
  children,
}: {
  open: boolean;
  /** Anime aussi le premier rendu (enfants qui arrivent d'un chargement paresseux). */
  appear?: boolean;
  children: () => React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<{ open: boolean; phase: CollapsePhase }>(() => ({
    open,
    phase: open ? (appear ? "opening" : "open") : "closed",
  }));
  // Changement d'état dérivé pendant le rendu : pas d'image intermédiaire.
  if (state.open !== open) setState({ open, phase: open ? "opening" : "closing" });
  const phase = state.open !== open ? (open ? "opening" : "closing") : state.phase;

  const settle = React.useCallback((from: CollapsePhase) => {
    setState((s) => (s.phase === from ? { ...s, phase: from === "opening" ? "open" : "closed" } : s));
  }, []);

  React.useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const ms = animationMs(ref.current);
    if (ms === 0) {
      settle(phase);
      return;
    }
    const timer = window.setTimeout(() => settle(phase), ms + 50);
    return () => window.clearTimeout(timer);
  }, [phase, settle]);

  if (phase === "closed") return null;
  return (
    <div
      ref={ref}
      className="ui-tree__collapse"
      data-phase={phase}
      aria-hidden={phase === "closing" || undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) settle(phase);
      }}
    >
      {children()}
    </div>
  );
}

const Chevron = () => (
  <svg className="ui-tree__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══ TreeView ════════════════════════════════════════════════════════════ */

/**
 * Arborescence, comme le volet de dossiers de Drive : lignes en pilule,
 * sélection en conteneur bleu, chevron qui pivote en ressort, guides
 * d'indentation discrets, chargement paresseux.
 *
 * Deux écritures, un seul moteur :
 * - à données : `<TreeView items={[{ id, label, icon, children }]} />` ;
 * - composable : `<TreeView><TreeItem itemId="…" label="…">…</TreeItem></TreeView>`.
 *
 * Clavier (motif WAI-ARIA « tree ») : ↑ ↓ entre les lignes visibles, → ouvre
 * puis descend, ← ferme puis remonte, Origine / Fin, `*` ouvre les nœuds
 * frères, lettres pour atteindre un libellé, Entrée active, Espace sélectionne.
 * Un seul arrêt de tabulation (tabindex mobile).
 */
export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    items: itemsProp,
    children,
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
    selectionMode = "single",
    selectedIds,
    defaultSelectedIds,
    onSelectedChange,
    onItemActivate,
    loadChildren,
    expansionTrigger = "chevron",
    size = "default",
    guides = true,
    dir: dirProp,
    labels: labelsProp,
    className,
    onKeyDown,
    onFocus,
    ...props
  },
  forwardedRef,
) {
  const labels = { ...defaultLabels, ...labelsProp };
  const direction = useDirection(dirProp);
  const baseId = React.useId();

  const [expanded, setExpanded] = useControllableState<string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds ?? [],
    onChange: onExpandedChange,
  });
  const [selected, setSelected] = useControllableState<string[]>({
    value: selectedIds,
    defaultValue: defaultSelectedIds ?? [],
    onChange: onSelectedChange,
  });
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState<Record<string, TreeViewItem[]>>({});
  const [loading, setLoading] = React.useState<ReadonlySet<string>>(() => new Set());
  const [failed, setFailed] = React.useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = React.useState("");

  const roots = React.useMemo(() => itemsProp ?? collectItems(children), [itemsProp, children]);
  const { nodes, rootIds } = React.useMemo(() => buildModel(roots, loaded), [roots, loaded]);
  const expandedSet = React.useMemo(() => new Set(expanded), [expanded]);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const visible = React.useMemo(() => visibleOrder(rootIds, nodes, expandedSet), [rootIds, nodes, expandedSet]);
  const navigable = React.useMemo(() => visible.filter((id) => !nodes.get(id)!.disabled), [visible, nodes]);

  const elements = React.useRef(new Map<string, HTMLLIElement>());
  const anchorRef = React.useRef<string | null>(null);
  const typeahead = React.useRef<{ text: string; timer?: number }>({ text: "" });
  const loadingRef = React.useRef(new Set<string>());
  // Nœuds dont les enfants viennent d'arriver : leur groupe se déroule à l'apparition.
  const appearRef = React.useRef(new Set<string>());
  React.useEffect(() => {
    appearRef.current.clear();
  });
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearTimeout(typeahead.current.timer);
    };
  }, []);

  const multiple = selectionMode === "multiple";
  const selectable = selectionMode !== "none";

  /* ── Focus ── */
  const tabbableId =
    (focusedId && navigable.includes(focusedId) && focusedId) ||
    navigable.find((id) => selectedSet.has(id)) ||
    navigable[0] ||
    null;

  const focusItem = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    elements.current.get(id)?.focus();
  };

  const isDescendant = (id: string, ancestorId: string) => {
    let parent = nodes.get(id)?.parentId ?? null;
    while (parent) {
      if (parent === ancestorId) return true;
      parent = nodes.get(parent)?.parentId ?? null;
    }
    return false;
  };

  /* ── Ouverture ── */
  const setOpen = (ids: string[], open: boolean) => {
    const targets = ids.filter((id) => {
      const node = nodes.get(id);
      return node && !node.disabled && node.expandable && expandedSet.has(id) !== open;
    });
    if (targets.length === 0) return;
    if (open) {
      if (targets.some((id) => failed.has(id))) {
        setFailed((prev) => new Set([...prev].filter((id) => !targets.includes(id))));
      }
      setExpanded([...expanded, ...targets]);
    } else {
      setExpanded(expanded.filter((id) => !targets.includes(id)));
      // Le focus ne reste jamais dans une branche qui se referme.
      const closing = targets[0]!;
      if (focusedId && isDescendant(focusedId, closing)) focusItem(closing);
    }
  };

  /* ── Chargement paresseux ── */
  const loadRef = React.useRef(loadChildren);
  loadRef.current = loadChildren;
  const labelsRef = React.useRef(labels);
  labelsRef.current = labels;

  React.useEffect(() => {
    const load = loadRef.current;
    if (!load) return;
    for (const id of visible) {
      const node = nodes.get(id)!;
      if (!node.lazy || !expandedSet.has(id) || loadingRef.current.has(id) || failed.has(id)) continue;
      loadingRef.current.add(id);
      setLoading(new Set(loadingRef.current));
      setAnnouncement(labelsRef.current.loading(node.item.label));
      Promise.resolve()
        .then(() => load(node.item))
        .then(
          (result) => {
            if (!mountedRef.current) return;
            appearRef.current.add(id);
            setLoaded((prev) => ({ ...prev, [id]: result }));
            // Dossier vide : il devient une feuille, sans état d'ouverture.
            if (result.length === 0) setExpanded((prev) => prev.filter((x) => x !== id));
            setAnnouncement("");
          },
          () => {
            if (!mountedRef.current) return;
            setFailed((prev) => new Set(prev).add(id));
            setExpanded((prev) => prev.filter((x) => x !== id));
            setAnnouncement(labelsRef.current.error(node.item.label));
          },
        )
        .finally(() => {
          loadingRef.current.delete(id);
          if (mountedRef.current) setLoading(new Set(loadingRef.current));
        });
    }
  }, [visible, nodes, expandedSet, failed, setExpanded]);

  /* ── Sélection ── */
  const selectOnly = (id: string) => {
    anchorRef.current = id;
    setSelected([id]);
  };
  const toggleSelection = (id: string) => {
    anchorRef.current = id;
    setSelected(selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };
  /** Plage contiguë (lignes visibles) entre l'ancre et `id`. */
  const selectRange = (id: string, from = anchorRef.current ?? id) => {
    const a = navigable.indexOf(from);
    const b = navigable.indexOf(id);
    if (a < 0 || b < 0) return selectOnly(id);
    setSelected(navigable.slice(Math.min(a, b), Math.max(a, b) + 1));
  };

  /* ── Saisie de lettres ── */
  const runTypeahead = (char: string, fromId: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += fold(char);
    state.timer = window.setTimeout(() => (state.text = ""), 500);
    const text = state.text;
    // « aaa » fait défiler les libellés en « a » ; « ana » cherche le préfixe entier.
    const repeated = [...text].every((c) => c === text[0]);
    const query = repeated ? text[0]! : text;
    const start = navigable.indexOf(fromId);
    const offset = repeated || text.length === 1 ? 1 : 0;
    for (let i = 0; i < navigable.length; i++) {
      const id = navigable[(start + offset + i) % navigable.length]!;
      if (fold(nodes.get(id)!.item.label).startsWith(query)) return focusItem(id);
    }
  };

  /* ── Clavier ── */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") !== "treeitem") return;
    const id = target.dataset.treeId;
    const node = id != null ? nodes.get(id) : undefined;
    if (!id || !node || node.disabled) return;

    const index = navigable.indexOf(id);
    const isOpen = expandedSet.has(id);
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const mod = event.ctrlKey || event.metaKey;
    const isCharacter = event.key.length === 1 && !mod && !event.altKey && event.key.trim() !== "" && event.key !== "*";
    // Toute autre touche clôt la saisie de lettres en cours.
    if (!isCharacter) {
      window.clearTimeout(typeahead.current.timer);
      typeahead.current.text = "";
    }
    let handled = true;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        const next = navigable[index + (event.key === "ArrowDown" ? 1 : -1)];
        if (next) {
          focusItem(next);
          if (multiple && event.shiftKey) toggleSelection(next);
        }
        break;
      }
      case forward:
        if (node.expandable && !isOpen) setOpen([id], true);
        else if (isOpen) focusItem(node.childIds.find((child) => !nodes.get(child)!.disabled));
        break;
      case backward:
        if (node.expandable && isOpen) setOpen([id], false);
        else if (node.parentId) focusItem(node.parentId);
        break;
      case "Home":
      case "End": {
        const edge = event.key === "Home" ? navigable[0] : navigable[navigable.length - 1];
        if (multiple && mod && event.shiftKey && edge) selectRange(edge, id);
        focusItem(edge);
        break;
      }
      case "Enter":
        if (selectionMode === "single") selectOnly(id);
        onItemActivate?.(node.item);
        break;
      case " ":
        if (multiple) {
          if (event.shiftKey) selectRange(id);
          else toggleSelection(id);
        } else if (selectable) selectOnly(id);
        break;
      case "*": {
        const siblings = node.parentId ? nodes.get(node.parentId)!.childIds : rootIds;
        setOpen(siblings, true);
        break;
      }
      default:
        if (multiple && mod && (event.key === "a" || event.key === "A")) {
          setSelected([...nodes.values()].filter((n) => !n.disabled).map((n) => n.id));
        } else if (isCharacter) {
          runTypeahead(event.key, id);
        } else {
          handled = false;
        }
    }
    if (handled) event.preventDefault();
  };

  const handleFocus = (event: React.FocusEvent<HTMLUListElement>) => {
    onFocus?.(event);
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") === "treeitem" && target.dataset.treeId != null) setFocusedId(target.dataset.treeId);
  };

  /* ── Souris ── */
  const handleRowClick = (event: React.MouseEvent, node: TreeNode) => {
    if (node.disabled) return;
    if (expansionTrigger === "row" && node.expandable) setOpen([node.id], !expandedSet.has(node.id));
    if (selectionMode === "single") selectOnly(node.id);
    else if (multiple) {
      if (event.shiftKey) selectRange(node.id);
      else if (event.ctrlKey || event.metaKey) toggleSelection(node.id);
      else selectOnly(node.id);
    }
  };

  /* ── Rendu ── */
  const setRootRef = (el: HTMLUListElement | null) => {
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  const renderNodes = (ids: string[]): React.ReactNode =>
    ids.map((id) => {
      const node = nodes.get(id)!;
      const { item } = node;
      const isOpen = node.expandable && expandedSet.has(id);
      const isLoading = loading.has(id);
      const hasFailed = failed.has(id);
      const isSelected = selectedSet.has(id);
      const labelId = `${baseId}-${node.index}`;
      const icon = isOpen && item.iconExpanded != null ? item.iconExpanded : item.icon;
      // Sélection unique : aria-selected n'est posé que sur le nœud choisi (APG).
      const ariaSelected = !selectable ? undefined : multiple ? isSelected : isSelected || undefined;

      return (
        <li
          key={id}
          ref={(el) => {
            if (el) elements.current.set(id, el);
            else elements.current.delete(id);
          }}
          role="treeitem"
          data-tree-id={id}
          aria-labelledby={labelId}
          aria-level={node.level}
          aria-setsize={node.setsize}
          aria-posinset={node.posinset}
          aria-expanded={node.expandable ? isOpen : undefined}
          aria-selected={ariaSelected}
          aria-disabled={node.disabled || undefined}
          aria-busy={isLoading || undefined}
          tabIndex={id === tabbableId ? 0 : -1}
          className={cn("ui-tree__item", item.className)}
          style={{ "--_level": node.level } as React.CSSProperties}
        >
          <div
            className="ui-tree__row"
            data-failed={hasFailed || undefined}
            onMouseDown={node.disabled ? (event) => event.preventDefault() : undefined}
            onClick={(event) => handleRowClick(event, node)}
            onDoubleClick={() => {
              if (!node.disabled) onItemActivate?.(item);
            }}
          >
            <span
              className="ui-tree__toggle"
              data-expandable={node.expandable || undefined}
              aria-hidden="true"
              onClick={
                node.expandable
                  ? (event) => {
                      event.stopPropagation();
                      if (!node.disabled && !isLoading) setOpen([id], !isOpen);
                    }
                  : undefined
              }
              onDoubleClick={(event) => event.stopPropagation()}
            >
              {isLoading ? <Spinner size={14} label="" /> : node.expandable ? <Chevron /> : null}
            </span>
            {icon != null && (
              <span className="ui-tree__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <span id={labelId} className="ui-tree__label">
              {item.label}
            </span>
            {hasFailed && <span className="ui-tree__error">{labels.errorHint}</span>}
            {item.trailing != null && !hasFailed && <span className="ui-tree__trailing">{item.trailing}</span>}
          </div>
          {node.childIds.length > 0 && (
            <TreeCollapse open={isOpen} appear={appearRef.current.has(id)}>
              {() => (
                <ul role="group" className="ui-tree__group">
                  {renderNodes(node.childIds)}
                </ul>
              )}
            </TreeCollapse>
          )}
        </li>
      );
    });

  return (
    <>
      <ul
        ref={setRootRef}
        role="tree"
        aria-multiselectable={multiple || undefined}
        data-slot="tree-view"
        data-size={size}
        data-guides={guides ? undefined : "false"}
        dir={dirProp}
        className={cn("ui-tree", className)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...props}
      >
        {renderNodes(rootIds)}
      </ul>
      {loadChildren && (
        <span role="status" className="ui-sr-only">
          {announcement}
        </span>
      )}
    </>
  );
});
