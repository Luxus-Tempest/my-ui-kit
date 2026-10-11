import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "../../utils/cn";
import { watchScrollableFocus } from "../../utils/scrollable-focus";

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /** Barres affichées : verticale (défaut), horizontale ou les deux. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Hauteur maximale du viewport (le reste défile). */
  maxHeight?: number | string;
}

/**
 * Zone défilante aux barres fines et flottantes (7 px, 11 px au survol), identiques sur
 * tous les systèmes. Le défilement reste natif : molette, tactile, clavier.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, children, orientation = "vertical", maxHeight, type = "hover", ...props },
  ref,
) {
  // Sans contenu focalisable, le viewport doit l'être pour défiler au clavier.
  const viewportRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => (viewportRef.current ? watchScrollableFocus(viewportRef.current) : undefined), []);
  return (
    <ScrollAreaPrimitive.Root ref={ref} type={type} data-slot="scroll-area" className={cn("ui-scroll-area", className)} {...props}>
      <ScrollAreaPrimitive.Viewport ref={viewportRef} className="ui-scroll-area__viewport" style={{ maxHeight }}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(orientation === "vertical" || orientation === "both") && <ScrollBar orientation="vertical" />}
      {(orientation === "horizontal" || orientation === "both") && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});

export const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(function ScrollBar({ className, orientation = "vertical", ...props }, ref) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn("ui-scroll-area__bar", className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="ui-scroll-area__thumb" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
