import * as React from "react";
import { cn } from "../../utils/cn";
import { useMessages } from "../../i18n/LocaleProvider";

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.6" />
    <path d="m10.25 10.25 3.25 3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const ClearIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export interface SearchBarLabels {
  /** Bouton qui vide le champ. « Effacer la recherche ». */
  clear: string;
}
export const SEARCH_BAR_LABELS: SearchBarLabels = { clear: "Effacer la recherche" };

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "type"> {
  value?: string;
  defaultValue?: string;
  /** Appelé à chaque frappe et à l'effacement, avec la nouvelle valeur. */
  onValueChange?: (value: string) => void;
  /** Appelé quand l'utilisateur vide le champ (bouton ou Échap). */
  onClear?: () => void;
  /** `lg` : 48 px, barre d'en-tête de Drive. `default` : 40 px, dans une page ou un panneau. */
  size?: "default" | "lg";
  /** Contenu à droite du champ (bouton de filtres, avatar…). */
  trailing?: React.ReactNode;
  /** Classe du conteneur ; `className` va au champ. */
  containerClassName?: string;
  /** Nom accessible du bouton d'effacement. */
  clearLabel?: string;
}

/**
 * Barre de recherche : pilule tonale avec loupe (Drive), bouton d'effacement
 * et Échap pour vider (iOS). Contrôlée (`value` + `onValueChange`) ou non.
 * Sans libellé visible, passer `aria-label`.
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    className,
    containerClassName,
    size = "default",
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onClear,
    onChange,
    onKeyDown,
    trailing,
    clearLabel: clearLabelProp,
    disabled,
    ...props
  },
  forwardedRef,
) {
  const clearLabelLabels = useMessages("searchBar", SEARCH_BAR_LABELS);
  const clearLabel = clearLabelProp ?? clearLabelLabels.clear;
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;

  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const clear = () => {
    setValue("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      data-slot="search-bar"
      data-size={size}
      data-disabled={disabled || undefined}
      className={cn("ui-search", containerClassName)}
    >
      <span className="ui-search__icon"><SearchIcon /></span>
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className={cn("ui-search__input", className)}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange?.(event);
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          // Échap vide le champ ; sur un champ déjà vide, il remonte (fermeture d'un panneau…).
          if (event.key === "Escape" && value !== "" && !event.defaultPrevented) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
        {...props}
      />
      {value !== "" && !disabled && (
        <button type="button" className="ui-search__clear" aria-label={clearLabel} onClick={clear}>
          <ClearIcon />
        </button>
      )}
      {trailing != null && <span className="ui-search__trailing">{trailing}</span>}
    </div>
  );
});
