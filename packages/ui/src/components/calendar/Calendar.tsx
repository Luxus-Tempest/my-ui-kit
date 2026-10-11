import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import {
  DayPicker,
  formatCaption as defaultFormatCaption,
  type ChevronProps,
  type ClassNames,
  type DayPickerProps,
  type RootProps,
} from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";

export type { DateRange, Matcher } from "react-day-picker";

/**
 * Props du calendrier : toutes celles de DayPicker v9 (`mode`, `selected`,
 * `onSelect`, `disabled`, `numberOfMonths`, `startMonth`, `endMonth`…).
 * La locale est française et la semaine commence le lundi par défaut.
 */
export type CalendarProps = DayPickerProps;

/** Classes `ui-calendar__*` : remplacent intégralement le CSS de react-day-picker. */
const calendarClassNames: ClassNames = {
  root: "ui-calendar",
  months: "ui-calendar__months",
  month: "ui-calendar__month",
  month_caption: "ui-calendar__caption",
  caption_label: "ui-calendar__caption-label",
  nav: "ui-calendar__nav",
  button_previous: "ui-calendar__nav-button ui-calendar__nav-button--previous",
  button_next: "ui-calendar__nav-button ui-calendar__nav-button--next",
  chevron: "ui-calendar__chevron",
  dropdowns: "ui-calendar__dropdowns",
  dropdown: "ui-calendar__dropdown",
  dropdown_root: "ui-calendar__dropdown-root",
  months_dropdown: "ui-calendar__months-dropdown",
  years_dropdown: "ui-calendar__years-dropdown",
  month_grid: "ui-calendar__grid",
  weekdays: "ui-calendar__weekdays",
  weekday: "ui-calendar__weekday",
  weeks: "ui-calendar__weeks",
  week: "ui-calendar__week",
  week_number: "ui-calendar__week-number",
  week_number_header: "ui-calendar__week-number-header",
  day: "ui-calendar__day",
  day_button: "ui-calendar__day-button",
  footer: "ui-calendar__footer",
  // Indicateurs de jour
  disabled: "ui-calendar__day--disabled",
  hidden: "ui-calendar__day--hidden",
  outside: "ui-calendar__day--outside",
  focused: "ui-calendar__day--focused",
  today: "ui-calendar__day--today",
  // Sélection
  selected: "ui-calendar__day--selected",
  range_start: "ui-calendar__day--range-start",
  range_middle: "ui-calendar__day--range-middle",
  range_end: "ui-calendar__day--range-end",
  // Animations (prop `animate`)
  weeks_before_enter: "ui-calendar__anim--weeks-before-enter",
  weeks_before_exit: "ui-calendar__anim--weeks-before-exit",
  weeks_after_enter: "ui-calendar__anim--weeks-after-enter",
  weeks_after_exit: "ui-calendar__anim--weeks-after-exit",
  caption_after_enter: "ui-calendar__anim--caption-after-enter",
  caption_after_exit: "ui-calendar__anim--caption-after-exit",
  caption_before_enter: "ui-calendar__anim--caption-before-enter",
  caption_before_exit: "ui-calendar__anim--caption-before-exit",
};

/** Chevron des boutons de navigation (et des listes du mode `captionLayout="dropdown"`). */
function CalendarChevron({ className, orientation = "left" }: ChevronProps) {
  const d = {
    left: "M10 3.5 5.5 8l4.5 4.5",
    right: "m6 3.5 4.5 4.5L6 12.5",
    up: "M3.5 10 8 5.5l4.5 4.5",
    down: "M3.5 6 8 10.5 12.5 6",
  }[orientation];
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Mois précédent / suivant : nos boutons fantômes ronds de 32 px. */
function CalendarNavButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button variant="ghost" size="icon-sm" className={className} {...props} />;
}

/** La ref passée à Calendar rejoint l'élément racine rendu par DayPicker. */
const CalendarRefContext = React.createContext<React.ForwardedRef<HTMLDivElement>>(null);

function CalendarRoot({ rootRef, ...props }: RootProps) {
  const forwarded = React.useContext(CalendarRefContext);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      for (const ref of [rootRef, forwarded]) {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [rootRef, forwarded],
  );
  return <div ref={setRef} data-slot="calendar" {...props} />;
}

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase("fr-FR") + text.slice(1);

/**
 * Calendrier : grille mensuelle de DayPicker v9 au langage Drive × iOS.
 * Jours en cercles de 36 px, sélection en disque primaire, plage en bande
 * de sélection arrondie, navigation par boutons fantômes. Accessible au
 * clavier (flèches, Début / Fin, Page préc. / suiv.) et libellés en français.
 *
 *   <Calendar mode="single" selected={date} onSelect={setDate} />
 *   <Calendar mode="range" selected={plage} onSelect={setPlage} numberOfMonths={2} />
 *
 * Les jours hors du mois sont affichés quand un seul mois est visible
 * (`showOutsideDays` pour forcer l'un ou l'autre).
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const { className, classNames, components, formatters, locale, weekStartsOn, showOutsideDays, numberOfMonths } =
    props;
  // Sens de lecture : celui de DirectionProvider / ThemeProvider dir, sauf `dir` explicite.
  const dir = useDirection(props.dir as "ltr" | "rtl" | undefined);

  return (
    <CalendarRefContext.Provider value={ref}>
      <DayPicker
        {...props}
        dir={dir}
        locale={locale ?? fr}
        weekStartsOn={weekStartsOn ?? 1}
        numberOfMonths={numberOfMonths}
        showOutsideDays={showOutsideDays ?? (numberOfMonths ?? 1) === 1}
        className={cn(className)}
        classNames={{ ...calendarClassNames, ...classNames }}
        formatters={{
          formatCaption: (month, options, dateLib) => capitalize(defaultFormatCaption(month, options, dateLib)),
          ...formatters,
        }}
        components={{
          Root: CalendarRoot,
          Chevron: CalendarChevron,
          PreviousMonthButton: CalendarNavButton,
          NextMonthButton: CalendarNavButton,
          ...components,
        }}
      />
    </CalendarRefContext.Provider>
  );
});
