import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "../../utils/cn";

export type AccordionVariant = "inset" | "plain";

export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  /**
   * `inset` (défaut) : carte tonale aux coins arrondis, filets décalés entre
   * les éléments (liste groupée d'iOS). `plain` : filets fins, posé sur un panneau.
   */
  variant?: AccordionVariant;
};

/**
 * Accordéon : sections repliables dont un seul (`type="single"`) ou plusieurs
 * (`type="multiple"`) panneaux sont ouverts. Navigation au clavier par Radix :
 * Tab entre les déclencheurs, flèches haut / bas, Début / Fin, Entrée et Espace.
 *
 * Le contenu s'ouvre en hauteur avec la courbe ressort ; le chevron pivote.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { className, variant = "inset", ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      data-slot="accordion"
      data-variant={variant}
      className={cn("ui-accordion", className)}
      {...(props as React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>)}
    />
  );
});

export type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;

/** Un élément : un déclencheur et son contenu, identifiés par `value`. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Item ref={ref} data-slot="accordion-item" className={cn("ui-accordion__item", className)} {...props} />
  );
});

const Chevron = () => (
  <svg className="ui-accordion__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /**
   * Niveau du titre qui enveloppe le déclencheur (`h3` par défaut), à accorder
   * à la structure de la page.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Icône posée avant le titre. */
  leading?: React.ReactNode;
}

/** Déclencheur : ligne de 52 px, titre 15 px / 500, chevron à droite. */
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { className, headingLevel = 3, leading, children, ...props },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <AccordionPrimitive.Header asChild>
      <Heading className="ui-accordion__header">
        <AccordionPrimitive.Trigger
          ref={ref}
          data-slot="accordion-trigger"
          className={cn("ui-accordion__trigger", className)}
          {...props}
        >
          {leading != null && <span className="ui-accordion__leading">{leading}</span>}
          <span className="ui-accordion__title">{children}</span>
          <Chevron />
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  );
});

export type AccordionContentProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

/** Contenu : animé en hauteur à l'ouverture et à la fermeture. */
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(
  { className, children, ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      data-slot="accordion-content"
      className={cn("ui-accordion__content", className)}
      {...props}
    >
      {/* Le retrait est sur l'enveloppe intérieure : la hauteur animée l'inclut sans saut. */}
      <div className="ui-accordion__body">{children}</div>
    </AccordionPrimitive.Content>
  );
});
