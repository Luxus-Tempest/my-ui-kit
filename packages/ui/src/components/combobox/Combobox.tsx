import * as React from "react";
import { cn } from "../../utils/cn";
import { Chip } from "../chip/Chip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../command/Command";
import { useFieldContext, useFieldControl } from "../field/Field";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../popover/Popover";
import { useMessages } from "../../i18n/LocaleProvider";

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 6.25 8 9.75l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.5 12.5 4.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface ComboboxOption {
  /** Valeur transmise à `onValueChange` ; unique dans la liste. */
  value: string;
  /** Texte affiché et recherché. */
  label: string;
  /** Seconde ligne discrète, recherchée elle aussi. */
  description?: string;
  /** Icône de tête (18 px). */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Intitulé du groupe : les options d'un même groupe sont rendues ensemble. */
  group?: string;
}

interface ComboboxBaseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "children"> {
  options: ComboboxOption[];
  /** Texte du déclencheur sans valeur. */
  placeholder?: string;
  /** Indication du champ de recherche ; nomme aussi la recherche pour les lecteurs d'écran. */
  searchPlaceholder?: string;
  /** Message quand la recherche ne trouve rien. */
  emptyText?: React.ReactNode;
  /** `default` : 40 px. `sm` : 32 px. */
  density?: "sm" | "default";
  /** Ouverture contrôlée de la liste. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classe du panneau flottant. */
  contentClassName?: string;
  /** Nom annoncé de la liste d'options. */
  listLabel?: string;
  /** Champ obligatoire (annoncé par `aria-required`) ; hérité du `Field`. */
  required?: boolean;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  /** Valeur choisie (contrôlé). */
  value?: string;
  /** Valeur initiale (non contrôlé). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  /** Choix multiple : la liste reste ouverte, chaque entrée se coche ou se décoche. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Au-delà de ce nombre, les puces laissent place à « 3 sélectionnés ». */
  maxChips?: number;
  /** Résumé affiché au-delà de `maxChips`. */
  formatCount?: (count: number) => string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

export interface ComboboxLabels {
  /** Déclencheur vide. « Choisir… ». */
  placeholder: string;
  /** Champ de recherche. « Rechercher… ». */
  searchPlaceholder: string;
  /** Aucune option ne correspond. « Aucun résultat ». */
  empty: string;
  /** Nom de la liste d'options. « Options ». */
  list: string;
  /** Résumé au-delà de `maxChips`. « 3 sélectionnés ». */
  selectedCount: (count: number) => string;
}
export const COMBOBOX_LABELS: ComboboxLabels = {
  placeholder: "Choisir…",
  searchPlaceholder: "Rechercher…",
  empty: "Aucun résultat",
  list: "Options",
  selectedCount: (count) => (count > 1 ? `${count} sélectionnés` : `${count} sélectionné`),
};

/** Regroupe les options en conservant l'ordre d'apparition ; les options sans groupe d'abord. */
function groupOptions(options: ComboboxOption[]) {
  const ungrouped: ComboboxOption[] = [];
  const groups = new Map<string, ComboboxOption[]>();
  for (const option of options) {
    if (!option.group) ungrouped.push(option);
    else groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
  }
  return { ungrouped, groups: [...groups.entries()] };
}

function useControllable<T>(controlled: boolean, value: T, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = controlled ? value : inner;
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

const EMPTY: string[] = [];

/**
 * Liste déroulante avec recherche : le déclencheur d'un Select, une liste
 * filtrée à la frappe (cmdk) dans un panneau de la largeur du déclencheur.
 * En `multiple`, chaque entrée se coche et le déclencheur montre des puces
 * retirables, puis un résumé « 3 sélectionnés » au-delà de `maxChips`.
 *
 *   <Field label="Ville">
 *     <Combobox options={villes} value={ville} onValueChange={setVille} />
 *   </Field>
 *
 * Hors d'un `Field`, nommer le déclencheur par `aria-label`.
 */
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(props, ref) {
  const labels = useMessages("combobox", COMBOBOX_LABELS);
  const {
    options,
    placeholder = labels.placeholder,
    searchPlaceholder = labels.searchPlaceholder,
    emptyText = labels.empty,
    density = "default",
    open: openProp,
    defaultOpen,
    onOpenChange,
    contentClassName,
    listLabel = labels.list,
    className,
    multiple,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    onKeyDown,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;
  // Props propres au mode multiple, retirées de ce qui part sur le bouton.
  const { maxChips = 2, formatCount = labels.selectedCount, ...buttonProps } = rest as typeof rest & {
    maxChips?: number;
    formatCount?: (count: number) => string;
  };

  const field = useFieldContext();
  // `required` n'existe pas sur un bouton : il devient aria-required, permis sur role="combobox".
  const { required, ...fieldProps } = useFieldControl(
    buttonProps as React.ButtonHTMLAttributes<HTMLButtonElement> & { required?: boolean; "aria-labelledby"?: string },
  );
  const disabled = Boolean(fieldProps.disabled);

  // Valeur : toujours manipulée comme une liste en interne.
  const controlled = "value" in props;
  const [selected, setSelected] = useControllable<string[]>(
    controlled,
    props.multiple ? (props.value ?? EMPTY) : props.value ? [props.value] : EMPTY,
    props.multiple ? (props.defaultValue ?? EMPTY) : props.defaultValue ? [props.defaultValue] : EMPTY,
    (next) => {
      if (props.multiple) props.onValueChange?.(next);
      else props.onValueChange?.(next[0] ?? "");
    },
  );

  const [open, setOpen] = useControllable(openProp !== undefined, openProp ?? false, defaultOpen ?? false, onOpenChange);
  const [search, setSearch] = React.useState("");
  const [listId, setListId] = React.useState<string>();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const autoId = React.useId();
  const valueId = `${autoId}-value`;

  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const changeOpen = (next: boolean) => {
    if (next && disabled) return;
    setOpen(next);
    if (!next) setSearch("");
  };

  const byValue = React.useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const { ungrouped, groups } = React.useMemo(() => groupOptions(options), [options]);
  const selectedOptions = selected.map((v) => byValue.get(v)).filter((o): o is ComboboxOption => Boolean(o));

  const toggle = (value: string) => {
    if (multiple) {
      setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    } else {
      setSelected([value]);
      changeOpen(false);
    }
  };

  const remove = (value: string) => {
    setSelected(selected.filter((v) => v !== value));
    triggerRef.current?.focus();
  };

  const showChips = Boolean(multiple) && selectedOptions.length > 0 && selectedOptions.length <= maxChips;
  let text: React.ReactNode = placeholder;
  if (multiple && selectedOptions.length > maxChips) text = formatCount(selectedOptions.length);
  else if (!multiple && selectedOptions[0]) text = selectedOptions[0].label;
  const hasValue = selectedOptions.length > 0;

  // Hors d'un Field et sans nom explicite, le texte affiché nomme le déclencheur.
  const labelledBy = ariaLabelledBy ?? (!field && !ariaLabel ? valueId : fieldProps["aria-labelledby"]);

  const renderItem = (option: ComboboxOption) => {
    const isSelected = selected.includes(option.value);
    return (
      <CommandItem
        key={option.value}
        value={option.value}
        keywords={[option.label, option.description ?? ""]}
        disabled={option.disabled}
        aria-checked={isSelected}
        data-checked={isSelected || undefined}
        data-has-description={option.description ? "" : undefined}
        className={cn("ui-menu-item--check", "ui-combobox__item")}
        onSelect={() => toggle(option.value)}
      >
        {option.icon}
        <span className="ui-combobox__item-text">
          <span className="ui-combobox__item-label">{option.label}</span>
          {option.description && <span className="ui-combobox__item-description">{option.description}</span>}
        </span>
        {isSelected && (
          <span className="ui-menu-item__indicator">
            <Check />
          </span>
        )}
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild>
        <div
          data-slot="combobox"
          data-density={density}
          data-state={open ? "open" : "closed"}
          data-multiple={multiple || undefined}
          data-invalid={fieldProps["aria-invalid"] ? "" : undefined}
          data-disabled={disabled || undefined}
          className={cn("ui-combobox", className)}
          onClick={(event) => {
            // Un clic dans le cadre, hors puce et hors bouton, ouvre aussi la liste.
            if (event.target === event.currentTarget) {
              triggerRef.current?.focus();
              changeOpen(!open);
            }
          }}
        >
          {showChips &&
            selectedOptions.map((option) => (
              <Chip
                key={option.value}
                tabIndex={-1}
                className="ui-combobox__chip"
                disabled={disabled}
                onClick={() => changeOpen(true)}
                onRemove={() => remove(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          <PopoverTrigger asChild>
            <button
              ref={setTriggerRef}
              type="button"
              role="combobox"
              data-slot="combobox-trigger"
              data-placeholder={hasValue ? undefined : ""}
              className="ui-combobox__trigger"
              {...fieldProps}
              aria-label={ariaLabel}
              aria-required={required || undefined}
              aria-labelledby={labelledBy}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented) return;
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  changeOpen(true);
                } else if (multiple && event.key === "Backspace" && selected.length > 0) {
                  event.preventDefault();
                  setSelected(selected.slice(0, -1));
                } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
                  // La frappe ouvre la liste et commence la recherche.
                  event.preventDefault();
                  setSearch(event.key);
                  changeOpen(true);
                }
              }}
            >
              <span id={valueId} className="ui-combobox__value">
                {showChips ? (
                  <span className="ui-sr-only">{selectedOptions.map((o) => o.label).join(", ")}</span>
                ) : (
                  text
                )}
              </span>
              <span className="ui-combobox__chevron">
                <Chevron />
              </span>
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        aria-label={searchPlaceholder}
        className={cn("ui-combobox__content", contentClassName)}
      >
        <Command label={searchPlaceholder} loop defaultValue={multiple ? undefined : selected[0]}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList
            ref={(node) => {
              if (node?.id) setListId(node.id);
            }}
            label={listLabel}
            aria-multiselectable={multiple || undefined}
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            {ungrouped.map(renderItem)}
            {groups.map(([heading, items]) => (
              <CommandGroup key={heading} heading={heading}>
                {items.map(renderItem)}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
