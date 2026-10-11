import * as React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { Calendar, type DateRange, type Matcher } from "../calendar/Calendar";
import { useFieldContext, useFieldControl } from "../field/Field";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/Popover";

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.5" y="3.25" width="11" height="10.25" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Formatage ─────────────────────────────────────────────────────── */

const shortFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** « 10 oct. 2026 » */
export function formatDate(date: Date): string {
  return shortFormat.format(date);
}

/** « 10 – 14 oct. 2026 », ou « 10 oct. 2026 – … » tant que la fin manque. */
export function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "";
  if (!range.to) return `${formatDate(range.from)} – …`;
  const fmt = shortFormat as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };
  return typeof fmt.formatRange === "function"
    ? fmt.formatRange(range.from, range.to)
    : `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

/* ── Dates ─────────────────────────────────────────────────────────── */

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function sameDay(a: Date | undefined, b: Date | undefined) {
  return Boolean(a && b && startOfDay(a).getTime() === startOfDay(b).getTime());
}
function inBounds(date: Date, minDate?: Date, maxDate?: Date) {
  const d = startOfDay(date).getTime();
  return (!minDate || d >= startOfDay(minDate).getTime()) && (!maxDate || d <= startOfDay(maxDate).getTime());
}

/** Période prédéfinie d'un DateRangePicker. */
export interface DateRangePreset {
  label: string;
  /** Calculée à partir d'aujourd'hui (« 7 derniers jours » glisse avec le temps). */
  range: (today: Date) => { from: Date; to: Date };
}

/** Périodes par défaut : les raccourcis qu'on cherche le plus souvent. */
export const defaultDateRangePresets: DateRangePreset[] = [
  { label: "7 derniers jours", range: (t) => ({ from: addDays(t, -6), to: t }) },
  { label: "30 derniers jours", range: (t) => ({ from: addDays(t, -29), to: t }) },
  { label: "Ce mois-ci", range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }) },
  {
    label: "Mois dernier",
    range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }),
  },
  { label: "Cette année", range: (t) => ({ from: new Date(t.getFullYear(), 0, 1), to: t }) },
];

/* ── État contrôlé / non contrôlé ──────────────────────────────────── */

function useControllableValue<T>(controlled: boolean, value: T, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = controlled ? value : inner;
  const setValue = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, setValue] as const;
}

/* ── Props communes ────────────────────────────────────────────────── */

interface DatePickerBaseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "children"> {
  /** Texte du déclencheur sans valeur. */
  placeholder?: string;
  /** Première date sélectionnable (incluse) ; borne aussi la navigation. */
  minDate?: Date;
  /** Dernière date sélectionnable (incluse) ; borne aussi la navigation. */
  maxDate?: Date;
  /** Autres jours non sélectionnables (week-ends, jours fériés…). */
  disabledDays?: Matcher | Matcher[];
  /** Ajoute un bouton d'effacement dans le panneau. */
  clearable?: boolean;
  /** Libellé du bouton d'effacement. */
  clearLabel?: string;
  /**
   * Nom annoncé du déclencheur hors d'un `Field` (« Choisir une date ») ;
   * la valeur affichée s'y ajoute. Dans un `Field`, c'est le libellé du champ.
   */
  triggerLabel?: string;
  /** Nom annoncé du panneau flottant. */
  dialogLabel?: string;
  /** `default` : 40 px. `sm` : 32 px. */
  density?: "sm" | "default";
  /** Ouverture contrôlée du panneau. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classe du panneau flottant. */
  contentClassName?: string;
  /** Accepté pour la symétrie avec les autres champs ; l'obligation s'annonce par le libellé du `Field`. */
  required?: boolean;
}

function boundsMatchers(minDate?: Date, maxDate?: Date, disabledDays?: Matcher | Matcher[]): Matcher[] {
  const matchers: Matcher[] = [];
  if (minDate) matchers.push({ before: minDate });
  if (maxDate) matchers.push({ after: maxDate });
  if (disabledDays) matchers.push(...(Array.isArray(disabledDays) ? disabledDays : [disabledDays]));
  return matchers;
}

interface ShellProps extends DatePickerBaseProps {
  display: string;
  /** Colonne à gauche du calendrier (périodes prédéfinies). */
  aside?: React.ReactNode;
  /** Actions de pied à gauche (« Aujourd'hui »). */
  footerStart?: React.ReactNode;
  hasValue: boolean;
  onClear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  kind: "single" | "range";
}

/** Déclencheur + panneau, partagés par DatePicker et DateRangePicker. */
const DatePickerShell = React.forwardRef<HTMLButtonElement, ShellProps>(function DatePickerShell(
  {
    display,
    aside,
    footerStart,
    hasValue,
    onClear,
    open,
    setOpen,
    children,
    kind,
    placeholder,
    clearable,
    clearLabel,
    triggerLabel,
    dialogLabel,
    density = "default",
    className,
    contentClassName,
    // Retirées des props transmises au bouton :
    minDate: _minDate,
    maxDate: _maxDate,
    disabledDays: _disabledDays,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    required: _required,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  // `required` n'existe pas sur un bouton : on l'écarte.
  const { required: _fieldRequired, ...fieldProps } = useFieldControl(props as typeof props & { required?: boolean });
  const autoId = React.useId();
  const nameId = `${autoId}-name`;
  const valueId = `${autoId}-value`;

  // Nom annoncé : libellé (Field, aria-labelledby, aria-label ou « Choisir une date »)
  // suivi du texte visible (date formatée ou indication).
  const prefixId = ariaLabelledBy ?? (field && !ariaLabel ? field.labelId : nameId);
  const ownName = !ariaLabelledBy && !(field && !ariaLabel);
  const ownText = ariaLabel ?? triggerLabel;
  // Sans valeur, l'indication suffit quand elle répète déjà le nom (« Choisir une date »).
  const labelledBy = ownName && !hasValue && placeholder === ownText ? valueId : `${prefixId} ${valueId}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="date-picker-trigger"
          data-density={density}
          data-placeholder={hasValue ? undefined : ""}
          className={cn("ui-date-picker-trigger", className)}
          {...fieldProps}
          aria-labelledby={labelledBy}
        >
          <span className="ui-date-picker-trigger__icon">
            <CalendarIcon />
          </span>
          <span id={valueId} className="ui-date-picker-trigger__value">
            {hasValue ? display : placeholder}
          </span>
          {ownName && (
            <span id={nameId} hidden>
              {ownText}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={8}
        aria-label={dialogLabel}
        data-kind={kind}
        className={cn("ui-date-picker__content", contentClassName)}
        // Le focus va au jour sélectionné (ou à aujourd'hui), pas au bouton « mois précédent ».
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="ui-date-picker__body">
          {aside}
          <div className="ui-date-picker__calendar">{children}</div>
        </div>
        {(clearable || footerStart) && (
          <div className="ui-date-picker__footer">
            {footerStart}
            {clearable && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasValue}
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                {clearLabel}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

/** Mois affiché à l'ouverture : celui de la valeur, sinon aujourd'hui ramené dans les bornes. */
function initialMonth(value: Date | undefined, minDate?: Date, maxDate?: Date): Date {
  if (value) return value;
  const today = new Date();
  if (minDate && today < minDate) return minDate;
  if (maxDate && today > maxDate) return maxDate;
  return today;
}

/** Vrai sur petit écran : un seul mois y tient sans défilement horizontal. */
function useCompactViewport(query = "(max-width: 640px)") {
  const get = () => typeof window !== "undefined" && window.matchMedia?.(query).matches === true;
  const [compact, setCompact] = React.useState(get);
  React.useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const update = () => setCompact(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, [query]);
  return compact;
}

function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (o: boolean) => void) {
  return useControllableValue(open !== undefined, open ?? false, defaultOpen ?? false, onOpenChange);
}

/* ── DatePicker ────────────────────────────────────────────────────── */

export interface DatePickerProps extends DatePickerBaseProps {
  /** Date choisie (contrôlé). `undefined` : aucune date. */
  value?: Date | undefined;
  /** Date initiale (non contrôlé). */
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  /** Raccourci « Aujourd'hui » en pied de panneau (si aujourd'hui est sélectionnable). Défaut : `true`. */
  showToday?: boolean;
  /** Libellé du raccourci. Défaut : « Aujourd'hui ». */
  todayLabel?: string;
}

/**
 * Sélecteur de date : un déclencheur au remplissage tonal (comme un Select)
 * qui ouvre un calendrier flottant. Choisir un jour ferme le panneau et rend
 * le focus au déclencheur ; « Aujourd'hui » en pied de panneau. Se branche sur
 * un `Field` (libellé, aide, erreur).
 *
 *   <Field label="Échéance">
 *     <DatePicker value={date} onValueChange={setDate} minDate={new Date()} />
 *   </Field>
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = "Choisir une date",
    clearLabel = "Effacer la date",
    triggerLabel = "Choisir une date",
    dialogLabel = "Choisir une date",
    minDate,
    maxDate,
    disabledDays,
    open: openProp,
    defaultOpen,
    onOpenChange,
    showToday = true,
    todayLabel = "Aujourd'hui",
    ...rest
  } = props;
  const [value, setValue] = useControllableValue("value" in props, valueProp, defaultValue, onValueChange);
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const today = startOfDay(new Date());
  const todayAllowed = inBounds(today, minDate, maxDate);

  return (
    <DatePickerShell
      ref={ref}
      kind="single"
      footerStart={
        showToday ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={!todayAllowed || sameDay(value, today)}
            onClick={() => {
              setValue(today);
              setOpen(false);
            }}
          >
            {todayLabel}
          </Button>
        ) : undefined
      }
      display={value ? formatDate(value) : ""}
      hasValue={Boolean(value)}
      onClear={() => setValue(undefined)}
      open={open}
      setOpen={setOpen}
      placeholder={placeholder}
      clearLabel={clearLabel}
      triggerLabel={triggerLabel}
      dialogLabel={dialogLabel}
      {...rest}
    >
      <Calendar
        mode="single"
        autoFocus
        selected={value}
        defaultMonth={initialMonth(value, minDate, maxDate)}
        startMonth={minDate}
        endMonth={maxDate}
        disabled={boundsMatchers(minDate, maxDate, disabledDays)}
        onSelect={(date) => {
          // Un second clic sur le jour choisi le garde (l'effacement passe par le bouton dédié).
          if (date) setValue(date);
          setOpen(false);
        }}
      />
    </DatePickerShell>
  );
});

/* ── DateRangePicker ───────────────────────────────────────────────── */

export interface DateRangePickerProps extends DatePickerBaseProps {
  /** Plage choisie (contrôlé) : `{ from, to }`. */
  value?: DateRange | undefined;
  /** Plage initiale (non contrôlé). */
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
  /** Mois affichés côte à côte : 2 par défaut, 1 sur petit écran (≤ 640 px). */
  numberOfMonths?: number;
  /**
   * Périodes prédéfinies, en colonne à gauche du calendrier.
   * `defaultDateRangePresets` par défaut ; `false` pour les masquer.
   */
  presets?: DateRangePreset[] | false;
  /** Nom annoncé de la liste des périodes. Défaut : « Périodes ». */
  presetsLabel?: string;
  /** Texte d'état entre les deux clics. Défaut : « Du {début} — choisissez la date de fin ». */
  pendingLabel?: (from: string) => string;
}

/**
 * Sélecteur de plage : même déclencheur, calendrier sur deux mois et périodes
 * prédéfinies. À chaque ouverture, le premier clic démarre une nouvelle
 * période et le second la termine, ce qui ferme le panneau (un clic avant le
 * début déplace le début). Une période prédéfinie s'applique et ferme aussitôt.
 */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      numberOfMonths: numberOfMonthsProp,
      placeholder = "Choisir une période",
      clearLabel = "Effacer les dates",
      triggerLabel = "Choisir une période",
      dialogLabel = "Choisir une période",
      minDate,
      maxDate,
      disabledDays,
      open: openProp,
      defaultOpen,
      onOpenChange,
      presets = defaultDateRangePresets,
      presetsLabel = "Périodes",
      pendingLabel = (from: string) => `Du ${from} — choisissez la date de fin`,
      ...rest
    } = props;
    const [value, setValue] = useControllableValue("value" in props, valueProp, defaultValue, onValueChange);
    const [open, setOpenState] = useOpenState(openProp, defaultOpen, onOpenChange);
    // Début posé pendant cette ouverture, en attente de la fin ; remis à zéro à chaque ouverture.
    const pendingFrom = React.useRef<Date | null>(null);
    const setOpen = (next: boolean) => {
      if (next) pendingFrom.current = null;
      setOpenState(next);
    };
    const today = startOfDay(new Date());
    const compact = useCompactViewport();
    const numberOfMonths = numberOfMonthsProp ?? (compact ? 1 : 2);

    const pick = (day: Date) => {
      const from = pendingFrom.current;
      if (!from || day < from) {
        pendingFrom.current = day;
        setValue({ from: day, to: undefined });
        return;
      }
      pendingFrom.current = null;
      setValue({ from, to: day });
      setOpen(false);
    };

    const presetList =
      presets && presets.length > 0 ? (
        <div className="ui-date-picker__presets" role="group" aria-label={presetsLabel}>
          {presets.map((preset) => {
            const range = preset.range(today);
            const allowed = inBounds(range.from, minDate, maxDate) && inBounds(range.to, minDate, maxDate);
            const active = sameDay(value?.from, range.from) && sameDay(value?.to, range.to);
            return (
              <button
                key={preset.label}
                type="button"
                className="ui-date-picker__preset"
                aria-pressed={active}
                disabled={!allowed}
                onClick={() => {
                  pendingFrom.current = null;
                  setValue({ from: range.from, to: range.to });
                  setOpen(false);
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      ) : undefined;

    // Entre les deux clics, une ligne d'état guide vers la date de fin (annoncée aux lecteurs d'écran).
    const pending = open && pendingFrom.current && value?.from && !value.to ? value.from : null;

    return (
      <DatePickerShell
        ref={ref}
        kind="range"
        aside={presetList}
        footerStart={
          pending ? (
            <span className="ui-date-picker__status" role="status">
              {pendingLabel(formatDate(pending))}
            </span>
          ) : undefined
        }
        display={formatDateRange(value)}
        hasValue={Boolean(value?.from)}
        onClear={() => setValue(undefined)}
        open={open}
        setOpen={setOpen}
        placeholder={placeholder}
        clearLabel={clearLabel}
        triggerLabel={triggerLabel}
        dialogLabel={dialogLabel}
        {...rest}
      >
        <Calendar
          mode="range"
          autoFocus
          selected={value}
          numberOfMonths={numberOfMonths}
          defaultMonth={initialMonth(value?.from, minDate, maxDate)}
          startMonth={minDate}
          endMonth={maxDate}
          disabled={boundsMatchers(minDate, maxDate, disabledDays)}
          onSelect={(_range, day) => pick(startOfDay(day))}
        />
      </DatePickerShell>
    );
  },
);
