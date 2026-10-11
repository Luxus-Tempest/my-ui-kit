import * as React from "react";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 6.25 8 9.75l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type NativeSelectDensity = "sm" | "default";

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple"> {
  /**
   * `default` : 40 px (formulaires). `sm` : 32 px (barre d'outils, filtres).
   * Pas `size` : sur un `<select>`, c'est le nombre de lignes visibles.
   */
  density?: NativeSelectDensity;
  /**
   * Texte affiché tant qu'aucune option n'est choisie : une première option
   * vide et non sélectionnable. Avec `required`, le formulaire refuse de partir sans choix.
   */
  placeholder?: string;
  /** Classe du conteneur (largeur, marges) ; `className` va au `<select>`. */
  containerClassName?: string;
}

/**
 * Liste déroulante native : le vrai `<select>` du navigateur, avec sa roue
 * d'iOS et sa feuille d'Android. Le bon choix sur mobile, dans un formulaire
 * simple ou sans JavaScript ; pour des options riches (icônes, recherche), `Select` ou `Combobox`.
 *
 * Gabarit du déclencheur de Select : remplissage tonal, 40 px (32 px en `sm`),
 * chevron, filet primaire et halo au focus. Choix unique. Se branche sur un `Field`.
 *
 *   <Field label="Pays">
 *     <NativeSelect placeholder="Choisir un pays">
 *       <NativeSelectOption value="ma">Maroc</NativeSelectOption>
 *     </NativeSelect>
 *   </Field>
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, containerClassName, density = "default", placeholder, children, ...rest },
  ref,
) {
  const props = useFieldControl(rest);
  // L'option d'indication est désactivée : sans valeur explicite, le navigateur
  // choisirait la première option valide. On la sélectionne donc d'office.
  const valueProps =
    props.value === undefined && props.defaultValue === undefined && placeholder != null ? { defaultValue: "" } : null;
  return (
    <div data-slot="native-select-wrapper" data-density={density} className={cn("ui-native-select", containerClassName)}>
      <select
        ref={ref}
        data-slot="native-select"
        data-density={density}
        className={cn("ui-native-select__control", className)}
        {...props}
        {...valueProps}
      >
        {placeholder != null && (
          <option value="" disabled data-placeholder="">
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <span className="ui-native-select__icon" aria-hidden="true">
        <Chevron />
      </span>
    </div>
  );
});

export type NativeSelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>;

/** Option d'un NativeSelect. */
export const NativeSelectOption = React.forwardRef<HTMLOptionElement, NativeSelectOptionProps>(
  function NativeSelectOption({ className, ...props }, ref) {
    return (
      <option ref={ref} data-slot="native-select-option" className={cn("ui-native-select__option", className)} {...props} />
    );
  },
);

export type NativeSelectOptGroupProps = React.OptgroupHTMLAttributes<HTMLOptGroupElement>;

/** Groupe d'options intitulé (`label`), rendu par le navigateur. */
export const NativeSelectOptGroup = React.forwardRef<HTMLOptGroupElement, NativeSelectOptGroupProps>(
  function NativeSelectOptGroup({ className, ...props }, ref) {
    return (
      <optgroup
        ref={ref}
        data-slot="native-select-optgroup"
        className={cn("ui-native-select__optgroup", className)}
        {...props}
      />
    );
  },
);
