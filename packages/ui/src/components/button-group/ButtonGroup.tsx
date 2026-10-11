import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { ButtonDefaultsContext, type ButtonSize, type ButtonVariant } from "../button/Button";
import { Separator, type SeparatorProps } from "../separator/Separator";

export type ButtonGroupOrientation = "horizontal" | "vertical";

const ButtonGroupContext = React.createContext<{ orientation: ButtonGroupOrientation } | null>(null);

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `horizontal` (défaut) : segments côte à côte, une seule pilule.
   * `vertical` : segments empilés, coins extérieurs d'une demi-hauteur.
   */
  orientation?: ButtonGroupOrientation;
  /** Prend toute la largeur disponible ; les segments à libellé se partagent l'espace. */
  fullWidth?: boolean;
  /** Variante par défaut des boutons du groupe (chaque bouton peut la redéfinir). */
  variant?: ButtonVariant;
  /** Taille par défaut des boutons du groupe (chaque bouton peut la redéfinir). */
  size?: ButtonSize;
}

/**
 * Groupe de boutons accolés : des `Button` liés par le sens (« Précédent / Suivant »,
 * action + menu d'un bouton scindé). Seuls les bouts extérieurs sont arrondis ;
 * les filets des `outline` se fondent en un seul trait, deux segments pleins
 * gardent un liseré de la surface entre eux. Toutes les variantes de Button
 * conviennent : `variant` et `size` sur le groupe s'appliquent à tous ses
 * boutons (comme MUI), chaque bouton pouvant les redéfinir.
 *
 * Rôle `group` : nomme-le avec `aria-label` (ou `aria-labelledby`). Tab passe
 * d'un bouton à l'autre. Pour des bascules (un choix parmi plusieurs), préférer `ToggleGroup`.
 *
 *   <ButtonGroup aria-label="Navigation">
 *     <Button variant="outline">Précédent</Button>
 *     <Button variant="outline">Suivant</Button>
 *   </ButtonGroup>
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, orientation = "horizontal", fullWidth = false, role = "group", variant, size, ...props },
  ref,
) {
  const context = React.useMemo(() => ({ orientation }), [orientation]);
  const defaults = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <ButtonDefaultsContext.Provider value={defaults}>
      <ButtonGroupContext.Provider value={context}>
        <div
          ref={ref}
          role={role}
          data-slot="button-group"
          data-orientation={orientation}
          data-full-width={fullWidth || undefined}
          className={cn("ui-button-group", className)}
          {...props}
        />
      </ButtonGroupContext.Provider>
    </ButtonDefaultsContext.Provider>
  );
});

export interface ButtonGroupSeparatorProps extends SeparatorProps {}

/**
 * Filet entre deux segments. Inutile entre deux `outline` (leurs filets se
 * fondent) ; utile pour structurer des segments `ghost`, `secondary` ou `tonal`.
 * Son orientation suit le groupe : verticale dans un groupe horizontal, et
 * inversement. Décoratif par défaut, comme `Separator`.
 */
export const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  function ButtonGroupSeparator({ className, orientation, ...props }, ref) {
    const group = React.useContext(ButtonGroupContext);
    const resolved = orientation ?? (group?.orientation === "vertical" ? "horizontal" : "vertical");
    return (
      <Separator
        ref={ref}
        orientation={resolved}
        data-slot="button-group-separator"
        className={cn("ui-button-group__separator", className)}
        {...props}
      />
    );
  },
);

export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rend l'enfant unique (un `<label>`, un `<span>`…) à la place du `<div>`. */
  asChild?: boolean;
}

/**
 * Segment de texte non interactif (préfixe, unité, libellé d'un champ voisin),
 * à la hauteur des boutons du groupe.
 */
export const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(function ButtonGroupText(
  { className, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} data-slot="button-group-text" className={cn("ui-button-group__text", className)} {...props} />;
});
