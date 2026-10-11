import * as React from "react";
import { cn } from "../../utils/cn";

/**
 * Fil d'activité, comme le panneau « Activité » de Drive : une liste ordonnée
 * d'évènements reliés par un connecteur vertical, regroupés par date.
 *
 * ```tsx
 * <Timeline>
 *   <TimelineGroup label="Aujourd'hui">
 *     <TimelineItem>
 *       <TimelineIndicator tone="pri"><PencilIcon /></TimelineIndicator>
 *       <TimelineContent>
 *         <TimelineTitle><strong>Inès</strong> a modifié <strong>Budget 2027</strong></TimelineTitle>
 *         <TimelineTime dateTime="2026-10-11T09:12">09:12</TimelineTime>
 *       </TimelineContent>
 *     </TimelineItem>
 *   </TimelineGroup>
 * </Timeline>
 * ```
 *
 * Le connecteur passe derrière les indicateurs, détourés d'un anneau de la
 * couleur du fond (`--ui-timeline-surface`, panneau par défaut) : à ajuster
 * quand le fil est posé sur une carte (`var(--ui-card-2)`).
 */
export type TimelineAlign = "left" | "alternate";

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /**
   * `left` (défaut) : indicateurs à gauche, contenu à droite, heure en haut à droite.
   * `alternate` : axe central, contenu alterné de part et d'autre et heure en
   * vis-à-vis ; repasse en `left` quand la place manque (moins de 480 px).
   */
  align?: TimelineAlign;
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { className, align = "left", ...props },
  ref,
) {
  return <ol ref={ref} data-slot="timeline" data-align={align} className={cn("ui-timeline", className)} {...props} />;
});

export interface TimelineGroupProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Intitulé du groupe : « Aujourd'hui », « Hier », « 3 octobre ». */
  label: React.ReactNode;
  /** Niveau du titre de groupe, à accorder à la structure de la page (`h3` par défaut). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** Groupe d'évènements sous un intitulé de date ; sa liste est nommée par l'intitulé. */
export const TimelineGroup = React.forwardRef<HTMLLIElement, TimelineGroupProps>(function TimelineGroup(
  { className, label, headingLevel = 3, children, ...props },
  ref,
) {
  const headingId = React.useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <li ref={ref} data-slot="timeline-group" className={cn("ui-timeline__group", className)} {...props}>
      <Heading id={headingId} className="ui-timeline__heading">
        <span className="ui-timeline__heading-text">{label}</span>
      </Heading>
      <ol aria-labelledby={headingId} className="ui-timeline__list">
        {children}
      </ol>
    </li>
  );
});

/** Un évènement : un `TimelineIndicator` et un `TimelineContent`. */
export const TimelineItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(function TimelineItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} data-slot="timeline-item" className={cn("ui-timeline__item", className)} {...props} />;
});

export type TimelineTone = "neu" | "pri" | "ok" | "warn" | "err";

export interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Ton de l'indicateur. `neu` (défaut) pour l'activité courante ; `pri`,
   * `ok`, `warn`, `err` sont des **états** (partagé, validé, en attente,
   * échec) : les doubler d'un mot dans le titre, ou d'un `label`.
   */
  tone?: TimelineTone;
  /** `soft` (défaut) : pastille teintée. `solid` : pastille pleine, pour l'évènement à mettre en avant. */
  variant?: "soft" | "solid";
  /**
   * Texte annoncé (« Échec », « Validé »…) quand le ton porte une information
   * absente du titre. Sans lui, l'indicateur est décoratif.
   */
  label?: string;
}

/**
 * Indicateur posé sur l'axe : un point (sans enfant) ou une pastille de 28 px
 * qui contient une icône (16 px) ou un avatar (`size="sm"`).
 */
export const TimelineIndicator = React.forwardRef<HTMLSpanElement, TimelineIndicatorProps>(function TimelineIndicator(
  { className, tone = "neu", variant = "soft", label, children, ...props },
  ref,
) {
  const shape = children == null || children === false ? "dot" : "icon";
  return (
    <span className="ui-timeline__separator" data-shape={shape}>
      <span
        ref={ref}
        data-slot="timeline-indicator"
        data-tone={tone}
        data-variant={variant}
        data-shape={shape}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={cn("ui-timeline__indicator", className)}
        {...props}
      >
        {shape === "icon" ? children : null}
      </span>
    </span>
  );
});

/** Corps de l'évènement : titre, description, heure, et tout contenu libre (aperçu de fichier, citation…). */
export const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TimelineContent({ className, ...props }, ref) {
    return <div ref={ref} data-slot="timeline-content" className={cn("ui-timeline__content", className)} {...props} />;
  },
);

/** Phrase de l'évènement : « **Inès** a modifié **Budget 2027** ». Les noms se mettent en `<strong>`. */
export const TimelineTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function TimelineTitle({ className, ...props }, ref) {
    return <p ref={ref} data-slot="timeline-title" className={cn("ui-timeline__title", className)} {...props} />;
  },
);

/** Détail plus discret sous le titre. */
export const TimelineDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function TimelineDescription({ className, ...props }, ref) {
    return (
      <p ref={ref} data-slot="timeline-description" className={cn("ui-timeline__description", className)} {...props} />
    );
  },
);

export interface TimelineTimeProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, "dateTime"> {
  /** Date machine (chaîne ISO 8601 ou `Date`), posée sur `<time datetime>`. */
  dateTime: string | Date;
  /**
   * Format d'affichage quand aucun enfant n'est fourni (`Intl.DateTimeFormat`,
   * fr-FR). Heure et minutes par défaut : « 09:12 ».
   */
  format?: Intl.DateTimeFormatOptions;
}

const timeFormat: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/** Horodatage : `<time datetime>` lisible par les machines, texte libre ou formaté pour les humains. */
export const TimelineTime = React.forwardRef<HTMLTimeElement, TimelineTimeProps>(function TimelineTime(
  { className, dateTime, format = timeFormat, children, ...props },
  ref,
) {
  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
  const valid = !Number.isNaN(date.getTime());
  const machine = typeof dateTime === "string" ? dateTime : valid ? date.toISOString() : undefined;
  const text = children ?? (valid ? new Intl.DateTimeFormat("fr-FR", format).format(date) : null);
  return (
    <time ref={ref} data-slot="timeline-time" dateTime={machine} className={cn("ui-timeline__time", className)} {...props}>
      {text}
    </time>
  );
});
