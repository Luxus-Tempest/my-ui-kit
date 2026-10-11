import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { useMessages } from "../../i18n/LocaleProvider";

export type TextSize = 10 | 11 | 11.5 | 12 | 12.5 | 13 | 14 | 15 | 16;
export type TextWeight = "regular" | "medium" | "semibold" | "bold" | "extrabold";
export type TextTone = "default" | "muted" | "subtle" | "pri" | "ok" | "warn" | "err" | "inherit";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** `span` par défaut ; `p`, `div`, `label`, `strong`… */
  as?: React.ElementType;
  asChild?: boolean;
  /** Corps de texte ; hérite par défaut (14 px sous ThemeProvider). */
  size?: TextSize;
  weight?: TextWeight;
  /** `default` = fg, `muted` = fg-2, `subtle` = fg-3 (mention secondaire lisible). */
  tone?: TextTone;
  /** Coupe sur une ligne avec « … ». */
  truncate?: boolean;
  /** Coupe après N lignes. */
  lineClamp?: number;
  /** JetBrains Mono, sans ligatures : identifiants, empreintes, chemins. */
  mono?: boolean;
  /** Chiffres tabulaires : toute donnée numérique en colonne. */
  numeric?: boolean;
  /** Surtitre : 11 px, 600, capitales espacées, fg-3. */
  eyebrow?: boolean;
}

/** Texte courant. Ne porte ni marge ni couleur en dur : tout vient des jetons. */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag = "span", asChild, size, weight, tone, truncate, lineClamp, mono, numeric, eyebrow, className, style, ...props },
  ref,
) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      ref={ref}
      data-slot="text"
      data-size={size}
      data-weight={weight}
      data-tone={tone}
      data-truncate={truncate || undefined}
      data-mono={mono || undefined}
      data-numeric={numeric || undefined}
      data-eyebrow={eyebrow || undefined}
      className={cn("ui-text", className)}
      style={lineClamp ? { WebkitLineClamp: lineClamp, ...style } : style}
      data-clamp={lineClamp ? true : undefined}
      {...props}
    />
  );
});

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = { 1: "xl", 2: "lg", 3: "md", 4: "sm", 5: "xs", 6: "xs" };

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Niveau sémantique (h1…h6), indépendant de la taille visuelle. */
  level?: HeadingLevel;
  /** 34 / 28 / 24 / 20 / 18 / 15 px. Par défaut, déduite du niveau. */
  size?: HeadingSize;
  tone?: TextTone;
  asChild?: boolean;
}

/**
 * Titre. Le niveau dit la structure du document, la taille dit la hiérarchie
 * visuelle : un titre de panneau peut être un h3 de 15 px.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, tone, asChild, className, ...props },
  ref,
) {
  const Comp: React.ElementType = asChild ? Slot : (`h${level}` as const);
  return (
    <Comp
      ref={ref}
      data-slot="heading"
      data-size={size ?? LEVEL_SIZE[level]}
      data-tone={tone}
      className={cn("ui-heading", className)}
      {...props}
    />
  );
});

export interface LinkLabels {
  /** Mention lue après un lien `external`. « nouvel onglet ». */
  newTab: string;
}
export const LINK_LABELS: LinkLabels = { newTab: "nouvel onglet" };

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Rend l'enfant (le `Link` de Next.js, de React Router…) avec le style du lien. */
  asChild?: boolean;
  /** Ouvre dans un nouvel onglet, de façon sûre et annoncée. */
  external?: boolean;
  /** `inline` (défaut) : lien de contenu dans une phrase. `subtle` : encre courante. */
  variant?: "inline" | "subtle";
}

/** Lien de contenu : encre `pri`, souligné au survol. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { asChild, external, variant = "inline", className, children, target, rel, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "a";
  const { newTab } = useMessages("link", LINK_LABELS);
  const externalProps = external
    ? { target: target ?? "_blank", rel: rel ?? "noopener noreferrer" }
    : { target, rel };
  return (
    <Comp ref={ref} data-slot="link" data-variant={variant} className={cn("ui-link", className)} {...externalProps} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {external && (
            <>
              <svg className="ui-link__external" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4.5 2.5h5v5M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ui-sr-only"> ({newTab})</span>
            </>
          )}
        </>
      )}
    </Comp>
  );
});

/** Touche de clavier : `⌘K`, `Échap`. */
export const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function Kbd(
  { className, ...props },
  ref,
) {
  return <kbd ref={ref} data-slot="kbd" className={cn("ui-kbd", className)} {...props} />;
});

/** Masqué à l'écran, lu par les lecteurs d'écran. */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function VisuallyHidden({ className, ...props }, ref) {
    return <span ref={ref} className={cn("ui-sr-only", className)} {...props} />;
  },
);
