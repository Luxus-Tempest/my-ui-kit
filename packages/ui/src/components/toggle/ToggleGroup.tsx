import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks/useControllableState";

export type ToggleGroupVariant = "segmented" | "outline";
export type ToggleGroupSize = "sm" | "default";

export type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
  /**
   * `segmented` (défaut) : segmented control d'iOS, piste grise en pilule et
   * pastille surélevée sous l'élément actif.
   * `outline` : boutons pilule accolés, comme le sélecteur de vue liste / grille
   * de Drive ; l'élément actif prend le fond de sélection.
   */
  variant?: ToggleGroupVariant;
  /** `default` : 36 px. `sm` : 32 px. */
  size?: ToggleGroupSize;
  /**
   * `type="single"` : autoriser l'absence de choix (un clic sur l'élément actif
   * le désélectionne). Par défaut non : comme le segmented control d'iOS, une
   * période ou un filtre a toujours une valeur.
   */
  allowEmpty?: boolean;
};

/**
 * Groupe de bascules. `type="single"` : un seul choix (rôle `radiogroup`,
 * éléments `radio`) ; `type="multiple"` : plusieurs (rôle `toolbar`,
 * éléments à `aria-pressed`). Flèches pour passer d'un élément à l'autre,
 * Espace / Entrée pour (dé)sélectionner.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { className, variant = "segmented", size = "default", allowEmpty = false, ...props },
  ref,
) {
  const common = {
    "data-slot": "toggle-group",
    "data-variant": variant,
    "data-size": size,
    className: cn("ui-toggle-group", className),
  };
  if (props.type === "single" && !allowEmpty) return <RequiredSingleRoot ref={ref} {...common} {...props} />;
  return <ToggleGroupPrimitive.Root ref={ref} {...common} {...props} />;
});

type SingleRootProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & { type: "single" } & {
  "data-slot"?: string;
  "data-variant"?: string;
  "data-size"?: string;
};

/** Choix unique obligatoire : la désélection de l'élément actif est ignorée (contrôlé ou non). */
const RequiredSingleRoot = React.forwardRef<HTMLDivElement, SingleRootProps>(function RequiredSingleRoot(
  { value: valueProp, defaultValue, onValueChange, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? "", onChange: onValueChange });
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      {...props}
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) setValue(next);
      }}
    />
  );
});

export type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>;

/** Élément d'un ToggleGroup. Icône seule : ajoute un `aria-label`. */
export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { className, ...props },
  ref,
) {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      className={cn("ui-toggle-group__item", className)}
      {...props}
    />
  );
});
