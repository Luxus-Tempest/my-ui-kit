import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

// Déclaration locale au module : pas besoin de @types/node (voir Button).
declare const process: { env: { NODE_ENV?: string } };

/**
 * Bouton d'action flottant : l'action principale d'un écran, posée au-dessus
 * du contenu. Cercle de 40 / 56 / 96 px ; `extended` ajoute un libellé et
 * devient une pilule de même hauteur.
 */
export const fabVariants = cva("ui-fab", {
  variants: {
    variant: {
      /** Panneau surélevé sur le fond d'application : le « + Nouveau » de Drive. */
      elevated: "ui-fab--elevated",
      /** Primaire plein : l'action la plus forte de l'écran. */
      primary: "ui-fab--primary",
      /** Conteneur primaire : présent sans crier (FAB par défaut de Material 3). */
      tonal: "ui-fab--tonal",
    },
    size: {
      /** 40 px, icône 20 : barres d'outils, écrans denses. */
      sm: "ui-fab--size-sm",
      /** 56 px, icône 24. */
      default: "ui-fab--size-default",
      /** 96 px, icône 36 : écran vide, mobile, action unique. */
      lg: "ui-fab--size-lg",
    },
    /** Icône + libellé, en pilule. */
    extended: { true: "ui-fab--extended" },
  },
  defaultVariants: { variant: "elevated", size: "default" },
});

type FabVariantProps = VariantProps<typeof fabVariants>;
export type FabVariant = NonNullable<FabVariantProps["variant"]>;
export type FabSize = NonNullable<FabVariantProps["size"]>;

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, FabVariantProps {
  /** Rend l'enfant unique (un `<a>`, un `<Link>`…) avec le style du FAB. */
  asChild?: boolean;
  /**
   * `fixed` : flotte en bas à droite de la fenêtre (en bas à gauche en
   * lecture de droite à gauche), à 24 px du bord et hors des zones sûres.
   */
  position?: "static" | "fixed";
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { className, variant, size, extended, position = "static", asChild = false, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFabLabelWarning(Boolean(extended), props);
  }

  return (
    <Comp
      ref={ref}
      data-slot="fab"
      data-position={position === "fixed" ? "fixed" : undefined}
      className={cn(fabVariants({ variant, size, extended }), className)}
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  );
});

/** En développement, signale un FAB icône sans nom accessible. */
function useFabLabelWarning(extended: boolean, props: React.AriaAttributes & { title?: string }) {
  const unlabeled = !extended && !props["aria-label"] && !props["aria-labelledby"] && !props.title;
  React.useEffect(() => {
    if (unlabeled) {
      console.warn("[Fab] Un FAB sans libellé visible n'affiche qu'une icône : ajoute aria-label pour les lecteurs d'écran.");
    }
  }, [unlabeled]);
}
