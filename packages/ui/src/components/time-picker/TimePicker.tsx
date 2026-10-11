import * as React from "react";
import { cn } from "../../utils/cn";
import { DatePicker, type DatePickerProps } from "../date-picker/DatePicker";
import { useFieldContext, useFieldControl } from "../field/Field";
import { Popover, PopoverAnchor, PopoverContent } from "../popover/Popover";

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.5 12.5 4.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Heures ────────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");
const DAY_MINUTES = 24 * 60;

/**
 * Lit une heure saisie librement et la normalise en « HH:mm » : « 14:30 »,
 * « 14h30 », « 14 h 30 », « 14.30 », « 1430 », « 930 » (9:30), « 14h », « 9 ».
 * Renvoie `null` si la saisie est illisible ou hors de 00:00–23:59.
 */
export function parseTime(input: string): string | null {
  const text = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!text) return null;
  let hours: number;
  let minutes: number;
  const digits = /^\d{1,4}$/.exec(text);
  if (digits) {
    // 1 ou 2 chiffres : des heures ; 3 ou 4 : les deux derniers sont les minutes.
    hours = Number(text.length <= 2 ? text : text.slice(0, -2));
    minutes = text.length <= 2 ? 0 : Number(text.slice(-2));
  } else {
    const parts = /^(\d{1,2})[:h.,](\d{1,2})?$/.exec(text);
    if (!parts) return null;
    hours = Number(parts[1]);
    minutes = parts[2] ? Number(parts[2]) : 0;
  }
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
function fromMinutes(total: number) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
function nearestIndex(options: number[], minutes: number) {
  let best = -1;
  let bestGap = Infinity;
  options.forEach((option, index) => {
    const gap = Math.abs(option - minutes);
    if (gap < bestGap) {
      best = index;
      bestGap = gap;
    }
  });
  return best;
}
function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
/** « HH:mm » d'une date. */
function timeOf(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
/** La date `date` à l'heure `time` (« HH:mm »). */
function atTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = controlled ? (value as T) : inner;
  const currentRef = React.useRef(current);
  currentRef.current = current;
  const set = React.useCallback(
    (next: T) => {
      if (Object.is(next, currentRef.current)) return;
      currentRef.current = next;
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

/* ── TimePicker ────────────────────────────────────────────────────── */

export interface TimePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type" | "size" | "min" | "max" | "step" | "list"
  > {
  /** Heure choisie, « HH:mm » (contrôlé). Chaîne vide : aucune heure. */
  value?: string;
  /** Heure initiale, « HH:mm » (non contrôlé). */
  defaultValue?: string;
  /** Appelé avec l'heure normalisée (« 14:30 »), ou `""` quand le champ est vidé. */
  onValueChange?: (value: string) => void;
  /** Pas de la liste, en minutes. Défaut : 15. Une heure saisie peut tomber entre deux pas. */
  step?: number;
  /** Première heure admise (incluse), « HH:mm » ; la liste commence là. */
  minTime?: string;
  /** Dernière heure admise (incluse), « HH:mm ». */
  maxTime?: string;
  /** `default` : 40 px. `sm` : 32 px. */
  density?: "sm" | "default";
  /** Ouverture contrôlée de la liste. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classe du conteneur (largeur, marges) ; `className` va au champ. */
  containerClassName?: string;
  /** Classe de la liste flottante. */
  contentClassName?: string;
  /** Nom annoncé de la liste. Défaut : « Heures proposées ». */
  listLabel?: string;
}

type Reveal = { index: number; mode: "center" | "nearest" };

/**
 * Champ d'heure à la manière de Google Agenda : on tape l'heure librement
 * (« 14:30 », « 1430 », « 14h30 », normalisée en « 14:30 » en quittant le champ),
 * ou on la choisit dans la liste flottante des heures, par pas de `step` minutes,
 * ouverte au clic ou avec ↓. La liste se cale sur l'entrée la plus proche de la
 * saisie. Au clavier : ↑ / ↓ (et Page ↑ / Page ↓ par heure) parcourent la liste,
 * Entrée valide, Échap ferme. Une saisie illisible ou hors de `minTime` / `maxTime`
 * est abandonnée : le champ revient à la dernière heure valide.
 *
 * Valeur : chaîne « HH:mm » (24 h), `""` sans heure. Se branche sur un `Field` ;
 * hors `Field`, le champ s'annonce « Heure » (surchargeable par `aria-label`).
 *
 *   <Field label="Début">
 *     <TimePicker value={start} onValueChange={setStart} minTime="08:00" maxTime="20:00" />
 *   </Field>
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(props, ref) {
  const {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    step = 15,
    minTime,
    maxTime,
    density = "default",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    containerClassName,
    contentClassName,
    listLabel = "Heures proposées",
    placeholder = "hh:mm",
    className,
    name,
    form,
    onKeyDown,
    onBlur,
    onClick,
    ...rest
  } = props;
  const field = useFieldContext();
  const inputProps = useFieldControl(rest);
  const named = Boolean(inputProps["aria-label"] || inputProps["aria-labelledby"] || field);
  const interactive = !inputProps.disabled && !inputProps.readOnly;

  const normalize = (time: string) => (time ? (parseTime(time) ?? time) : "");
  const [value, setValue] = useControllable(
    valueProp === undefined ? undefined : normalize(valueProp),
    normalize(defaultValue),
    onValueChange,
  );
  const [open, setOpenState] = useControllable(openProp, defaultOpen, onOpenChange);
  const setOpen = (next: boolean) => setOpenState(next && interactive);
  // Saisie en cours ; `null` quand le champ affiche la valeur.
  const [draft, setDraft] = React.useState<string | null>(null);
  const text = draft ?? value;
  // Entrée mise en avant (clavier, pointeur) ; -1 : aucune.
  const [highlight, setHighlight] = React.useState(-1);
  const pendingReveal = React.useRef<Reveal | null>(null);
  // Le portail de Radix monte la liste un rendu plus tard : son nœud est gardé
  // en état pour relancer le défilement quand il apparaît.
  const [listNode, setListNode] = React.useState<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listId = `${React.useId()}-heures`;
  const optionId = (index: number) => `${listId}-${index}`;

  const min = minTime ? parseTime(minTime) : null;
  const max = maxTime ? parseTime(maxTime) : null;
  const stepMinutes = Math.max(1, Math.round(step));
  const options = React.useMemo(() => {
    const list: number[] = [];
    const end = max ? toMinutes(max) : DAY_MINUTES - 1;
    for (let t = min ? toMinutes(min) : 0; t <= end; t += stepMinutes) list.push(t);
    return list;
  }, [min, max, stepMinutes]);
  const inBounds = (time: string) => {
    const minutes = toMinutes(time);
    return (!min || minutes >= toMinutes(min)) && (!max || minutes <= toMinutes(max));
  };
  /** Entrée la plus proche d'une saisie (ou de la valeur), -1 si rien à lire. */
  const anchorOf = (input: string) => {
    const parsed = parseTime(input) ?? (value ? parseTime(value) : null);
    return parsed ? nearestIndex(options, toMinutes(parsed)) : -1;
  };

  // Fait défiler la liste (et elle seule, jamais la page) jusqu'à l'entrée demandée ;
  // à l'ouverture (y compris `open` / `defaultOpen`), jusqu'à la valeur ou l'heure courante.
  const wasOpen = React.useRef(false);
  React.useLayoutEffect(() => {
    const list = listNode;
    if (!open || !list) {
      if (!open) wasOpen.current = false;
      return;
    }
    let reveal = pendingReveal.current;
    if (!reveal && !wasOpen.current) {
      const anchor = anchorOf(text);
      reveal = { index: anchor >= 0 ? anchor : nearestIndex(options, nowMinutes()), mode: "center" };
    }
    wasOpen.current = true;
    pendingReveal.current = null;
    if (!reveal) return;
    const option = list.querySelector<HTMLElement>(`[data-index="${reveal.index}"]`);
    if (!option) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (reveal.mode === "center") {
      list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2;
    } else if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  });

  const openList = (navigate: boolean) => {
    const anchor = anchorOf(text);
    const target = anchor >= 0 ? anchor : nearestIndex(options, nowMinutes());
    setHighlight(navigate ? target : -1);
    pendingReveal.current = { index: target, mode: "center" };
    setOpen(true);
  };

  const move = (delta: number) => {
    const anchor = anchorOf(text);
    const from = anchor >= 0 ? anchor : nearestIndex(options, nowMinutes());
    const next = highlight < 0 ? from : Math.min(options.length - 1, Math.max(0, highlight + delta));
    setHighlight(next);
    pendingReveal.current = { index: next, mode: "nearest" };
  };

  const select = (index: number) => {
    setDraft(null);
    setValue(fromMinutes(options[index]));
    setHighlight(-1);
    setOpen(false);
  };

  /** Valide la saisie : normalisée si lisible et dans les bornes, abandonnée sinon. */
  const commit = () => {
    if (draft === null) return;
    const raw = draft.trim();
    setDraft(null);
    if (raw === "") {
      setValue("");
      return;
    }
    const parsed = parseTime(raw);
    if (parsed && inBounds(parsed)) setValue(parsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (open) move(event.key === "ArrowDown" ? 1 : -1);
        else openList(true);
        break;
      case "PageDown":
      case "PageUp":
        if (!open) return;
        event.preventDefault();
        move((event.key === "PageDown" ? 1 : -1) * Math.max(1, Math.round(60 / stepMinutes)));
        break;
      case "Enter":
        if (!open) {
          commit();
          return;
        }
        event.preventDefault();
        if (highlight >= 0) select(highlight);
        else {
          commit();
          setOpen(false);
        }
        break;
      case "Escape":
        // Ouverte, la liste se ferme d'elle-même (Radix) ; fermée, Échap annule la saisie.
        if (!open && draft !== null) {
          event.preventDefault();
          setDraft(null);
        }
        break;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    setHighlight(-1);
    if (!interactive) return;
    const anchor = anchorOf(next);
    if (anchor >= 0) pendingReveal.current = { index: anchor, mode: "center" };
    if (!open && next.trim() !== "") {
      if (anchor < 0) pendingReveal.current = { index: nearestIndex(options, nowMinutes()), mode: "center" };
      setOpen(true);
    }
  };

  const activeId = open && highlight >= 0 ? optionId(highlight) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={containerRef}
          data-slot="time-picker"
          data-density={density}
          className={cn("ui-time-picker", containerClassName)}
        >
          <input
            ref={ref}
            type="text"
            role="combobox"
            aria-autocomplete="none"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={activeId}
            aria-label={named ? undefined : "Heure"}
            autoComplete="off"
            spellCheck={false}
            data-slot="time-picker-input"
            data-density={density}
            placeholder={placeholder}
            className={cn("ui-input", "ui-time-picker__input", className)}
            {...inputProps}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={(event) => {
              onClick?.(event);
              if (!event.defaultPrevented && interactive && !open) openList(false);
            }}
            onBlur={(event) => {
              onBlur?.(event);
              commit();
              setOpen(false);
            }}
          />
          <span className="ui-time-picker__icon" aria-hidden="true">
            <ClockIcon />
          </span>
          {name && <input type="hidden" name={name} form={form} value={value} disabled={inputProps.disabled} />}
        </div>
      </PopoverAnchor>
      <PopoverContent
        ref={setListNode}
        id={listId}
        role="listbox"
        aria-label={listLabel}
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className={cn("ui-time-picker__content", contentClassName)}
        // Le focus reste dans le champ : la liste se pilote par aria-activedescendant.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (containerRef.current?.contains(event.target as Node)) event.preventDefault();
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        {options.map((minutes, index) => {
          const time = fromMinutes(minutes);
          const selected = time === value;
          return (
            <div
              key={time}
              id={optionId(index)}
              role="option"
              aria-selected={selected}
              data-index={index}
              data-highlighted={index === highlight || undefined}
              className="ui-menu-item ui-menu-item--check ui-time-picker__option"
              onPointerMove={() => {
                if (index !== highlight) setHighlight(index);
              }}
              onClick={() => select(index)}
            >
              {time}
              {selected && (
                <span className="ui-menu-item__indicator">
                  <Check />
                </span>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
});

/* ── DateTimePicker ────────────────────────────────────────────────── */

export interface DateTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Date et heure choisies (contrôlé). `undefined` : aucune date. */
  value?: Date | undefined;
  /** Valeur initiale (non contrôlé). */
  defaultValue?: Date;
  /** Appelé dès qu'une date est connue ; l'heure vient du champ d'heure ou de `defaultTime`. */
  onValueChange?: (value: Date | undefined) => void;
  /** Première date sélectionnable (incluse). */
  minDate?: Date;
  /** Dernière date sélectionnable (incluse). */
  maxDate?: Date;
  /** Autres jours non sélectionnables (week-ends, jours fériés…). */
  disabledDays?: DatePickerProps["disabledDays"];
  /** Pas de la liste des heures, en minutes. Défaut : 15. */
  step?: number;
  /** Première heure admise, « HH:mm ». */
  minTime?: string;
  /** Dernière heure admise, « HH:mm ». */
  maxTime?: string;
  /** Heure posée quand on choisit une date sans heure (ou qu'on vide l'heure). Défaut : « 00:00 ». */
  defaultTime?: string;
  /** `default` : 40 px. `sm` : 32 px. */
  density?: "sm" | "default";
  disabled?: boolean;
  /** Champ obligatoire ; hérité du `Field`. */
  required?: boolean;
  /** Ajoute « Effacer la date » au calendrier. */
  clearable?: boolean;
  /** Indication du sélecteur de date. */
  datePlaceholder?: string;
  /** Indication du champ d'heure. */
  timePlaceholder?: string;
  /** Nom annoncé du sélecteur de date (après le libellé du `Field`). Défaut : « Date ». */
  dateLabel?: string;
  /** Nom annoncé du champ d'heure (après le libellé du `Field`). Défaut : « Heure ». */
  timeLabel?: string;
}

/**
 * Date et heure côte à côte : un `DatePicker` et un `TimePicker`, une seule
 * valeur `Date`. L'heure peut se saisir avant la date ; la valeur part dès que la
 * date est connue (à `defaultTime` si l'heure manque). Dans un `Field`, le groupe
 * prend le libellé du champ, et ses deux contrôles s'annoncent « Rendez-vous Date »
 * et « Rendez-vous Heure » ; l'aide et l'erreur s'appliquent aux deux.
 */
export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(function DateTimePicker(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    minDate,
    maxDate,
    disabledDays,
    step,
    minTime,
    maxTime,
    defaultTime = "00:00",
    density = "default",
    disabled,
    required,
    clearable,
    datePlaceholder,
    timePlaceholder,
    dateLabel = "Date",
    timeLabel = "Heure",
    className,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;
  const field = useFieldContext();
  const autoId = React.useId();
  const groupId = id ?? field?.controlId ?? `date-heure-${autoId}`;
  const dateNameId = `${autoId}-date`;
  const timeNameId = `${autoId}-heure`;

  const controlled = "value" in props;
  const [inner, setInner] = React.useState<Date | undefined>(defaultValue);
  const value = controlled ? valueProp : inner;
  const emit = (next: Date | undefined) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };
  // Heure saisie avant la date : gardée jusqu'au choix du jour.
  const [timeDraft, setTimeDraft] = React.useState(() => (value ? timeOf(value) : ""));
  const time = value ? timeOf(value) : timeDraft;
  const fallbackTime = parseTime(defaultTime) ?? "00:00";

  const handleDate = (date: Date | undefined) => {
    if (!date) {
      if (value) setTimeDraft(timeOf(value));
      emit(undefined);
      return;
    }
    const nextTime = time || fallbackTime;
    setTimeDraft(nextTime);
    emit(atTime(date, nextTime));
  };
  const handleTime = (nextTime: string) => {
    if (!value) {
      setTimeDraft(nextTime);
      return;
    }
    const resolved = nextTime || fallbackTime;
    setTimeDraft(resolved);
    emit(atTime(value, resolved));
  };

  // Nom du groupe : libellé du Field (ou aria-labelledby), sinon aria-label.
  const prefix = ariaLabelledBy ?? field?.labelId;

  return (
    <div
      ref={ref}
      role="group"
      id={groupId}
      data-slot="date-time-picker"
      data-density={density}
      aria-labelledby={prefix}
      aria-label={prefix ? undefined : (ariaLabel ?? "Date et heure")}
      className={cn("ui-date-time-picker", className)}
      {...rest}
    >
      <DatePicker
        id={`${groupId}-date`}
        className="ui-date-time-picker__date"
        value={value}
        onValueChange={handleDate}
        minDate={minDate}
        maxDate={maxDate}
        disabledDays={disabledDays}
        density={density}
        disabled={disabled}
        required={required}
        clearable={clearable}
        placeholder={datePlaceholder}
        {...(prefix ? { "aria-labelledby": `${prefix} ${dateNameId}` } : { triggerLabel: dateLabel })}
      />
      <TimePicker
        id={`${groupId}-time`}
        containerClassName="ui-date-time-picker__time"
        value={time}
        onValueChange={handleTime}
        step={step}
        minTime={minTime}
        maxTime={maxTime}
        density={density}
        disabled={disabled}
        required={required}
        placeholder={timePlaceholder}
        {...(prefix ? { "aria-labelledby": `${prefix} ${timeNameId}` } : { "aria-label": timeLabel })}
      />
      {prefix && (
        <>
          <span id={dateNameId} hidden>
            {dateLabel}
          </span>
          <span id={timeNameId} hidden>
            {timeLabel}
          </span>
        </>
      )}
    </div>
  );
});
