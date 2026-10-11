import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { Chip } from "../chip/Chip";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../command/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/Popover";
import { useDataTableLabels } from "./context";
import type { DataTableFilterOption, DataTableLabels } from "./types";
import { getColumnLabel } from "./utils";

const PlusCircle = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const Chevron = () => (
  <svg className="ui-data-table-facet__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 6.25 8 9.75l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface DataTableFacetedFilterProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Colonne filtrée (`table.getColumn("statut")`). */
  column: Column<any, any>;
  /** Intitulé de la puce ; par défaut le libellé de la colonne. */
  title?: string;
  /** Valeurs proposées ; par défaut `meta.filterOptions` de la colonne. */
  options?: DataTableFilterOption[];
  /**
   * Compteur de lignes par valeur, calculé sur les données chargées.
   * `DataTableToolbar` le coupe en filtrage serveur (seul `option.count` s'affiche alors).
   */
  showCounts?: boolean;
  /** Classe du panneau flottant. */
  contentClassName?: string;
  labels?: Partial<DataTableLabels>;
}

/**
 * Filtre à facettes : une puce dans la barre d'outils (« Statut », puis
 * « Statut · 2 » en conteneur de sélection), qui ouvre une liste à choix
 * multiple avec, pour chaque valeur, le nombre de lignes correspondantes
 * compte tenu des autres filtres. « Réinitialiser » vide le filtre.
 */
export const DataTableFacetedFilter = React.forwardRef<HTMLButtonElement, DataTableFacetedFilterProps>(
  function DataTableFacetedFilter(
    { column, title, options: optionsProp, showCounts = true, contentClassName, labels: labelsProp, className, ...props },
    ref,
  ) {
    const labels = useDataTableLabels(labelsProp);
    const [open, setOpen] = React.useState(false);
    const name = title ?? getColumnLabel(column);
    const options = optionsProp ?? column.columnDef.meta?.filterOptions ?? [];
    const filterValue = column.getFilterValue();
    const selected = React.useMemo(
      () => new Set(Array.isArray(filterValue) ? filterValue.map(String) : []),
      [filterValue],
    );
    const facets = column.getFacetedUniqueValues();
    const counts = React.useMemo(() => {
      const map = new Map<string, number>();
      facets.forEach((count, key) => {
        for (const value of Array.isArray(key) ? key : [key]) map.set(String(value), (map.get(String(value)) ?? 0) + count);
      });
      return map;
    }, [facets]);

    const set = (next: Set<string>) => {
      const values = options.map((o) => o.value).filter((v) => next.has(v));
      column.setFilterValue(values.length ? values : undefined);
    };
    const toggle = (value: string) => {
      const next = new Set(selected);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      set(next);
    };

    const selectedLabels = options.filter((o) => selected.has(o.value)).map((o) => o.label);
    const count = selectedLabels.length;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Chip
            ref={ref}
            data-slot="data-table-faceted-filter"
            className={cn("ui-data-table-facet__trigger", className)}
            icon={count === 0 ? <PlusCircle /> : undefined}
            // Sélectionnée sans devenir une bascule : la puce ouvre une liste, elle ne se presse pas.
            data-selected={count > 0 ? "" : undefined}
            {...props}
          >
            <span className="ui-sr-only">{labels.facetPrefix}</span>
            <span>{count > 0 ? labels.facetSummary(name, selectedLabels) : name}</span>
            {count > 1 && <span className="ui-sr-only">{labels.facetSelected(count)}</span>}
            <Chevron />
          </Chip>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          aria-label={name}
          className={cn("ui-data-table-facet", contentClassName)}
        >
          <Command loop label={name}>
            <CommandInput placeholder={labels.facetSearch(name)} aria-label={labels.facetSearch(name)} />
            <CommandList aria-multiselectable="true" label={name} className="ui-data-table-facet__list">
              <CommandEmpty>{labels.facetEmpty}</CommandEmpty>
              {options.map((option) => {
                const checked = selected.has(option.value);
                const optionCount = option.count ?? (showCounts ? (counts.get(option.value) ?? 0) : undefined);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    aria-checked={checked}
                    data-checked={checked || undefined}
                    data-empty={optionCount === 0 && !checked ? "" : undefined}
                    className="ui-data-table-facet__item"
                    onSelect={() => toggle(option.value)}
                  >
                    <span className="ui-data-table-facet__box" data-state={checked ? "checked" : "unchecked"} aria-hidden="true">
                      {checked && <Check />}
                    </span>
                    {option.icon != null && <span className="ui-data-table-facet__icon">{option.icon}</span>}
                    <span className="ui-data-table-facet__label">{option.label}</span>
                    {optionCount !== undefined && <span className="ui-data-table-facet__count">{optionCount.toLocaleString("fr-FR")}</span>}
                  </CommandItem>
                );
              })}
            </CommandList>
            {count > 0 && (
              <div className="ui-data-table-facet__footer">
                <Button variant="ghost" size="sm" fullWidth onClick={() => set(new Set())}>
                  {labels.reset}
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
