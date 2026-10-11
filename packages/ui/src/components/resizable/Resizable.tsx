import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  getResizeHandleElement,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";
import { cn } from "../../utils/cn";

export type ResizableOrientation = "horizontal" | "vertical";
/** Poignée impérative d'un panneau (`ref`) : `resize`, `collapse`, `expand`, `getSize`, `isCollapsed`. */
export type ResizablePanelHandle = ImperativePanelHandle;
/** Poignée impérative du groupe (`ref`) : `getLayout`, `setLayout`. */
export type ResizablePanelGroupHandle = ImperativePanelGroupHandle;

export interface ResizablePanelGroupProps extends Omit<PanelGroupProps, "direction"> {
  /** `horizontal` : panneaux côte à côte (défaut). `vertical` : empilés. */
  orientation?: ResizableOrientation;
  /**
   * Clé de mémorisation : la disposition est enregistrée (localStorage par défaut,
   * ou `storage`) et restaurée au prochain affichage. Unique par écran. Si des
   * panneaux apparaissent sous condition, donner à chacun `id` et `order`.
   * Rendu côté serveur : la disposition enregistrée n'est connue qu'au montage.
   */
  autoSaveId?: string | null;
}

/**
 * Groupe de panneaux redimensionnables : explorateur, éditeur et aperçu, liste et
 * détail. Les tailles sont en pourcentage du groupe (`defaultSize`, `minSize`,
 * `maxSize`) ; un panneau `collapsible` se replie à `collapsedSize` sous son minimum.
 *
 * Le groupe remplit son parent : lui donner une hauteur (ou le placer dans une grille).
 * Les séparateurs se manipulent au pointeur et au clavier : flèches (10 % par
 * défaut, `keyboardResizeBy`), Début / Fin, F6 pour passer de l'un à l'autre.
 */
export const ResizablePanelGroup = React.forwardRef<ImperativePanelGroupHandle, ResizablePanelGroupProps>(
  function ResizablePanelGroup({ className, orientation = "horizontal", ...props }, ref) {
    return (
      <PanelGroup
        ref={ref}
        direction={orientation}
        data-slot="resizable-panel-group"
        className={cn("ui-resizable", className)}
        {...props}
      />
    );
  },
);

export type ResizablePanelProps = PanelProps;

/** Un panneau. La `ref` donne la poignée impérative : `resize`, `collapse`, `expand`, `getSize`. */
export const ResizablePanel = React.forwardRef<ImperativePanelHandle, ResizablePanelProps>(function ResizablePanel(
  { className, ...props },
  ref,
) {
  return <Panel ref={ref} data-slot="resizable-panel" className={cn("ui-resizable__panel", className)} {...props} />;
});

export interface ResizableHandleProps extends PanelResizeHandleProps {
  /** Affiche une pilule de préhension au milieu du séparateur. */
  withHandle?: boolean;
  /** Nom annoncé du séparateur ; à préciser quand le groupe en compte plusieurs. */
  "aria-label"?: string;
}

/**
 * Séparateur entre deux panneaux (`role="separator"`, valeur = taille du panneau
 * précédent). Filet de 1 px au repos ; il s'épaissit et prend la couleur primaire
 * au survol, au glissement et au focus clavier.
 */
export const ResizableHandle = React.forwardRef<HTMLElement, ResizableHandleProps>(function ResizableHandle(
  { className, withHandle = false, id, "aria-label": ariaLabel = "Redimensionner les panneaux", children, ...props },
  ref,
) {
  // react-resizable-panels v3 ne transmet pas de ref au séparateur : on le retrouve par son identifiant.
  const autoId = React.useId();
  const handleId = id ?? autoId;
  React.useImperativeHandle(ref, () => getResizeHandleElement(handleId) as HTMLElement, [handleId]);

  return (
    <PanelResizeHandle
      id={handleId}
      data-slot="resizable-handle"
      data-with-handle={withHandle || undefined}
      aria-label={ariaLabel}
      className={cn("ui-resizable__handle", className)}
      {...props}
    >
      {withHandle && <span className="ui-resizable__grip" aria-hidden="true" />}
      {children}
    </PanelResizeHandle>
  );
});
